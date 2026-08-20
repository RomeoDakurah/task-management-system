from fastapi import APIRouter, HTTPException, Depends
from typing import Optional
from schemas import (
    Task, 
    TaskResponse, 
    TaskUpdate,
    TaskAssign
)
from crud.tasks import (
    get_all_tasks,
    create_task,
    update_task,
    delete_task,
    get_task_by_id,
    get_all_statuses,
    get_all_priorities,
    get_all_categories,
    get_all_groups,
    assign_task,
    get_task_assignee
)
from dependencies import get_current_user, require_workspace_role

router = APIRouter()

# Read
@router.get("/tasks", response_model=list[TaskResponse])
def get_tasks(
    workspace_id: Optional[int] = None,
    status_id: Optional[int] = None,
    priority_id: Optional[int] = None,
    category_id: Optional[int] = None,
    group_id: Optional[int] = None
):
    
    return get_all_tasks(
        workspace_id,
        status_id, 
        priority_id, 
        category_id, 
        group_id
    )

@router.get("/tasks/{task_id}", response_model=TaskResponse)
def get_task(task_id: int):

    task = get_task_by_id(task_id)

    if task is None:
        raise HTTPException(
            status_code=404,
            detail="Task not found"
        )

    return task

# Create
# workspace_id lives in the request body here (not the URL), so we can't
# use the require_workspace_role(...) path-param dependency directly —
# check the role against task.workspace_id by hand instead.
@router.post("/tasks")
def post_tasks(
    task: Task,
    current_user: dict = Depends(get_current_user)
):
    from crud.users import get_workspace_role

    role = get_workspace_role(task.workspace_id, current_user["id"])

    if role != "admin":
        raise HTTPException(
            status_code=403,
            detail="Only workspace admins can create tasks"
        )

    create_task(task, created_by=current_user["id"])

    return {
        "message": "Task created successfully"
    }


# Assign — admin only, in the task's workspace
@router.patch("/tasks/{task_id}/assign")
def patch_assign_task(
    task_id: int,
    payload: TaskAssign,
    current_user: dict = Depends(get_current_user)
):
    from crud.users import get_workspace_role

    task = get_task_by_id(task_id)

    if task is None:
        raise HTTPException(status_code=404, detail="Task not found")

    role = get_workspace_role(task["workspace_id"], current_user["id"])

    if role != "admin":
        raise HTTPException(
            status_code=403,
            detail="Only workspace admins can assign tasks"
        )

    assign_task(task_id, payload.assigned_to)

    return {"message": "Task assigned successfully"}


# Accept — the assignee marks they've picked it up. Any workspace member
# can be assigned a task, but only the assignee themselves can accept it.
@router.post("/tasks/{task_id}/accept")
def post_accept_task(
    task_id: int,
    current_user: dict = Depends(get_current_user)
):
    task = get_task_by_id(task_id)

    if task is None:
        raise HTTPException(status_code=404, detail="Task not found")

    assignee = get_task_assignee(task_id)

    if assignee != current_user["id"]:
        raise HTTPException(
            status_code=403,
            detail="You can only accept tasks assigned to you"
        )

    # Move to whatever status represents active work — matched by name
    # since there's no is_in_progress flag (mirrors is_completed/is_cancelled).
    # Falls back to the first non-completed, non-cancelled status if this
    # workspace doesn't use the label "In Progress".
    statuses = get_all_statuses(task["workspace_id"])

    in_progress = next(
        (s for s in statuses if s["name"].strip().lower() == "in progress"),
        None
    ) or next(
        (s for s in statuses if not s["is_completed"] and not s["is_cancelled"]),
        None
    )

    if in_progress is None:
        raise HTTPException(
            status_code=400,
            detail="This workspace has no suitable status to move an accepted task into"
        )

    update_task(task_id, TaskUpdate(status_id=in_progress["id"]))

    return {"message": "Task accepted"}


# Complete — same rule: only the assignee can mark it done.
@router.post("/tasks/{task_id}/complete")
def post_complete_task(
    task_id: int,
    current_user: dict = Depends(get_current_user)
):
    task = get_task_by_id(task_id)

    if task is None:
        raise HTTPException(status_code=404, detail="Task not found")

    assignee = get_task_assignee(task_id)

    if assignee != current_user["id"]:
        raise HTTPException(
            status_code=403,
            detail="You can only complete tasks assigned to you"
        )

    completed_status = next(
        (s for s in get_all_statuses(task["workspace_id"]) if s["is_completed"]),
        None
    )

    if completed_status is None:
        raise HTTPException(
            status_code=400,
            detail="This workspace has no status marked as 'completed'"
        )

    update_task(task_id, TaskUpdate(status_id=completed_status["id"]))

    return {"message": "Task marked complete"}

# Update
@router.patch("/tasks/{task_id}")
def edit_task(
    task_id: int,
    task_update: TaskUpdate
):

    updated = update_task(
        task_id,
        task_update
    )


    if not updated:
        raise HTTPException(
            status_code=404,
            detail="Task not found"
        )


    return {
        "message": "Task updated successfully"
    }

# Delete
@router.delete("/tasks/{task_id}")
def remove_task(task_id: int):

    deleted = delete_task(task_id)

    if deleted == 0:
        return {
            "message": "Task not found"
        }

    return {
        "message": "Task deleted successfully"
    }

# status
@router.get("/workspaces/{workspace_id}/statuses")
def get_statuses(workspace_id: int):
    return get_all_statuses(workspace_id)

# priorities
@router.get("/workspaces/{workspace_id}/priorities")
def get_priorities(workspace_id: int):
    return get_all_priorities(workspace_id)

# categories
@router.get("/workspaces/{workspace_id}/categories")
def get_categories(workspace_id: int):
    return get_all_categories(workspace_id)

# groups
@router.get("/workspaces/{workspace_id}/groups")
def get_groups(workspace_id: int):
    return get_all_groups(workspace_id)
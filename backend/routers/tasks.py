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
    get_task_assignee,
    accept_task,
    decline_task
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
    group_id: Optional[int] = None,
    current_user: dict = Depends(get_current_user)
):
    from crud.users import get_workspace_role

    if workspace_id is None:
        raise HTTPException(
            status_code=400,
            detail="workspace_id is required"
        )

    role = get_workspace_role(workspace_id, current_user["id"])

    if role is None:
        raise HTTPException(
            status_code=403,
            detail="You are not a member of this workspace"
        )

    # Admins can see every task in the workspace.
    # Regular users only see tasks assigned to them. This keeps unassigned
    # and other users' tasks out of the user's task list at the API level.
    assigned_to = None if role == "admin" else current_user["id"]

    return get_all_tasks(
        workspace_id,
        status_id,
        priority_id,
        category_id,
        group_id,
        assigned_to=assigned_to
    )

@router.get("/tasks/{task_id}", response_model=TaskResponse)
def get_task(
    task_id: int,
    current_user: dict = Depends(get_current_user)
):
    from crud.users import get_workspace_role

    task = get_task_by_id(task_id)

    if task is None:
        raise HTTPException(
            status_code=404,
            detail="Task not found"
        )

    role = get_workspace_role(task["workspace_id"], current_user["id"])

    if role is None:
        raise HTTPException(
            status_code=403,
            detail="You are not a member of this workspace"
        )

    if role != "admin" and task["assigned_to"] != current_user["id"]:
        raise HTTPException(
            status_code=403,
            detail="You can only view tasks assigned to you"
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


# Accept — only the assigned user can accept a task that has not
# already been accepted.
@router.post("/tasks/{task_id}/accept")
def post_accept_task(
    task_id: int,
    current_user: dict = Depends(get_current_user)
):
    task = get_task_by_id(task_id)

    if task is None:
        raise HTTPException(status_code=404, detail="Task not found")

    from crud.users import get_workspace_role
    role = get_workspace_role(task["workspace_id"], current_user["id"])

    if role != "user" or task["assigned_to"] != current_user["id"]:
        raise HTTPException(
            status_code=403,
            detail="Only the assigned user can accept this task"
        )

    if task["accepted_at"]:
        raise HTTPException(
            status_code=400,
            detail="Task has already been accepted"
        )

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
            detail="This workspace has no suitable status for an accepted task"
        )

    # Record acceptance and move the task into an active status.
    accepted = accept_task(task_id)

    if not accepted:
        raise HTTPException(
            status_code=404,
            detail="Task not found"
        )

    update_task(task_id, TaskUpdate(status_id=in_progress["id"]))

    return {"message": "Task accepted"}

# Complete — only the assigned user can complete their accepted task.
@router.post("/tasks/{task_id}/complete")
def post_complete_task(
    task_id: int,
    current_user: dict = Depends(get_current_user)
):
    task = get_task_by_id(task_id)

    if task is None:
        raise HTTPException(status_code=404, detail="Task not found")

    from crud.users import get_workspace_role
    role = get_workspace_role(task["workspace_id"], current_user["id"])

    if role != "user" or task["assigned_to"] != current_user["id"]:
        raise HTTPException(
            status_code=403,
            detail="Only the assigned user can complete this task"
        )

    if not task["accepted_at"]:
        raise HTTPException(
            status_code=400,
            detail="Accept the task before completing it"
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


# Decline — before acceptance, remove the assignment so the task returns
# to the admin's unassigned task pool.
@router.post("/tasks/{task_id}/decline")
def post_decline_task(
    task_id: int,
    current_user: dict = Depends(get_current_user)
):
    task = get_task_by_id(task_id)

    if task is None:
        raise HTTPException(status_code=404, detail="Task not found")

    from crud.users import get_workspace_role
    role = get_workspace_role(task["workspace_id"], current_user["id"])

    if role != "user" or task["assigned_to"] != current_user["id"]:
        raise HTTPException(
            status_code=403,
            detail="Only the assigned user can decline this task"
        )

    if task["accepted_at"]:
        raise HTTPException(
            status_code=400,
            detail="An accepted task cannot be declined"
        )

    # Return the task to the workspace's initial non-terminal status.
    statuses = get_all_statuses(task["workspace_id"])
    initial_status = next(
        (s for s in statuses if not s["is_completed"] and not s["is_cancelled"]),
        None
    )

    if initial_status is None:
        raise HTTPException(
            status_code=400,
            detail="This workspace has no available non-terminal status"
        )

    declined = decline_task(task_id, initial_status["id"])

    if not declined:
        raise HTTPException(
            status_code=404,
            detail="Task not found"
        )

    return {"message": "Task declined"}

# Update
@router.patch("/tasks/{task_id}")
def edit_task(
    task_id: int,
    task_update: TaskUpdate,
    current_user: dict = Depends(get_current_user)
):
    from crud.users import get_workspace_role

    task = get_task_by_id(task_id)

    if task is None:
        raise HTTPException(status_code=404, detail="Task not found")

    role = get_workspace_role(task["workspace_id"], current_user["id"])

    # Regular users cannot edit task fields directly. Their task workflow
    # is handled by the dedicated accept/decline/complete endpoints.
    if role != "admin":
        raise HTTPException(
            status_code=403,
            detail="Only workspace admins can edit task details"
        )

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
def remove_task(
    task_id: int,
    current_user: dict = Depends(get_current_user)
):
    from crud.users import get_workspace_role

    task = get_task_by_id(task_id)

    if task is None:
        return {"message": "Task not found"}

    role = get_workspace_role(task["workspace_id"], current_user["id"])

    if role != "admin":
        raise HTTPException(
            status_code=403,
            detail="Only workspace admins can delete tasks"
        )

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
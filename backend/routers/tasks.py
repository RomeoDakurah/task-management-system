from fastapi import APIRouter, HTTPException
from typing import Optional
from schemas import (
    Task, 
    TaskResponse, 
    TaskUpdate
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
    get_all_groups
)

router = APIRouter()

# Read
@router.get("/tasks", response_model=list[TaskResponse])
def get_tasks(
    status_id: Optional[int] = None,
    priority_id: Optional[int] = None,
    category_id: Optional[int] = None,
    group_id: Optional[int] = None
):
    
    return get_all_tasks(
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
@router.post("/tasks")
def post_tasks(task: Task):

    create_task(task)

    return {
        "message": "Task created successfully"
    }

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
@router.get("/statuses")
def get_statuses():
    return get_all_statuses()

# priorities
@router.get("/priorities")
def get_priorities():
    return get_all_priorities()

# categories
@router.get("/categories")
def get_categories():
    return get_all_categories()

# groups
@router.get("/groups")
def get_groups():
    return get_all_groups()
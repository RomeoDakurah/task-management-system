from fastapi import APIRouter, HTTPException, Depends

from schemas import (
    ConfigCreate,
    GroupCreate,
    StatusCreate
)

from crud.tasks import (
    get_all_statuses,
    get_all_priorities,
    get_all_categories,
    get_all_groups,
)

from dependencies import require_workspace_role

from crud.operations import (
    create_status,
    update_status,
    delete_status,

    create_priority,
    update_priority,
    delete_priority,

    create_category,
    update_category,
    delete_category,

    create_group,
    update_group,
    delete_group
)

router = APIRouter(
    prefix="/workspaces/{workspace_id}",
    tags=["configuration"]
)

@router.get("/statuses")
def get_statuses(workspace_id: int):
    return get_all_statuses(workspace_id)


@router.post("/statuses")
def post_status(
    workspace_id: int,
    status: StatusCreate,
    _admin: dict = Depends(require_workspace_role("admin"))
):
    return create_status(
        workspace_id,
        status.name,
        status.is_completed,
        status.is_cancelled
    )


@router.put("/statuses/{status_id}")
def put_status(
    workspace_id: int,
    status_id: int,
    status: StatusCreate,
    _admin: dict = Depends(require_workspace_role("admin"))
):
    updated = update_status(
        workspace_id,
        status_id,
        status.name,
        status.is_completed,
        status.is_cancelled
    )

    if not updated:
        raise HTTPException(
            status_code=404,
            detail="Status not found"
        )

    return {
        "message": "Status updated successfully"
    }


@router.delete("/statuses/{status_id}")
def remove_status(
    workspace_id: int,
    status_id: int,
    _admin: dict = Depends(require_workspace_role("admin"))
):
    deleted = delete_status(
        workspace_id,
        status_id
    )

    if not deleted:
        raise HTTPException(
            status_code=404,
            detail="Status not found"
        )

    return {
        "message": "Status deleted successfully"
    }

@router.get("/priorities")
def get_priorities(workspace_id: int):
    return get_all_priorities(workspace_id)


@router.post("/priorities")
def post_priority(
    workspace_id: int,
    config: ConfigCreate,
    _admin: dict = Depends(require_workspace_role("admin"))
):
    return create_priority(
        workspace_id,
        config.name
    )


@router.put("/priorities/{priority_id}")
def put_priority(
    workspace_id: int,
    priority_id: int,
    config: ConfigCreate,
    _admin: dict = Depends(require_workspace_role("admin"))
):
    updated = update_priority(
        workspace_id,
        priority_id,
        config.name
    )

    if not updated:
        raise HTTPException(
            status_code=404,
            detail="Priority not found"
        )

    return {
        "message": "Priority updated successfully"
    }


@router.delete("/priorities/{priority_id}")
def remove_priority(
    workspace_id: int,
    priority_id: int,
    _admin: dict = Depends(require_workspace_role("admin"))
):
    deleted = delete_priority(
        workspace_id,
        priority_id
    )

    if not deleted:
        raise HTTPException(
            status_code=404,
            detail="Priority not found"
        )

    return {
        "message": "Priority deleted successfully"
    }

@router.get("/categories")
def get_categories(workspace_id: int):
    return get_all_categories(workspace_id)


@router.post("/categories")
def post_category(
    workspace_id: int,
    config: ConfigCreate,
    _admin: dict = Depends(require_workspace_role("admin"))
):
    return create_category(
        workspace_id,
        config.name
    )


@router.put("/categories/{category_id}")
def put_category(
    workspace_id: int,
    category_id: int,
    config: ConfigCreate,
    _admin: dict = Depends(require_workspace_role("admin"))
):
    updated = update_category(
        workspace_id,
        category_id,
        config.name
    )

    if not updated:
        raise HTTPException(
            status_code=404,
            detail="Category not found"
        )

    return {
        "message": "Category updated successfully"
    }


@router.delete("/categories/{category_id}")
def remove_category(
    workspace_id: int,
    category_id: int,
    _admin: dict = Depends(require_workspace_role("admin"))
):
    deleted = delete_category(
        workspace_id,
        category_id
    )

    if not deleted:
        raise HTTPException(
            status_code=404,
            detail="Category not found"
        )

    return {
        "message": "Category deleted successfully"
    }

@router.get("/groups")
def get_groups(workspace_id: int):
    return get_all_groups(workspace_id)


@router.post("/groups")
def post_group(
    workspace_id: int,
    group: GroupCreate,
    _admin: dict = Depends(require_workspace_role("admin"))
):
    return create_group(
        workspace_id,
        group.name,
        group.type
    )


@router.put("/groups/{group_id}")
def put_group(
    workspace_id: int,
    group_id: int,
    group: GroupCreate,
    _admin: dict = Depends(require_workspace_role("admin"))
):
    updated = update_group(
        workspace_id,
        group_id,
        group.name,
        group.type
    )

    if not updated:
        raise HTTPException(
            status_code=404,
            detail="Group not found"
        )

    return {
        "message": "Group updated successfully"
    }


@router.delete("/groups/{group_id}")
def remove_group(
    workspace_id: int,
    group_id: int,
    _admin: dict = Depends(require_workspace_role("admin"))
):
    deleted = delete_group(
        workspace_id,
        group_id
    )

    if not deleted:
        raise HTTPException(
            status_code=404,
            detail="Group not found"
        )

    return {
        "message": "Group deleted successfully"
    }
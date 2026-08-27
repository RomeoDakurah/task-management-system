from fastapi import APIRouter, HTTPException, Depends

from schemas import WorkspaceCreate, MemberAdd, MemberRoleUpdate
from crud.workspaces import create_workspace, remove_workspace_member, delete_workspace
from crud.users import (
    add_workspace_member,
    get_workspace_role,
    get_user_workspaces,
    get_workspace_members,
    get_user_by_email
)
from dependencies import get_current_user, require_workspace_role

router = APIRouter(prefix="/workspaces", tags=["workspaces"])


# List — only workspaces the caller actually belongs to, with their role
# in each. Replaces the old unauthenticated GET /workspaces that returned
# every workspace in the system to anyone.
@router.get("")
def list_my_workspaces(current_user: dict = Depends(get_current_user)):
    return get_user_workspaces(current_user["id"])


# Create — whoever creates a workspace is automatically its admin.
# This is the normal entry point into having any role at all; nothing
# else needs to touch workspace_members by hand from here on.
@router.post("")
def post_workspace(
    payload: WorkspaceCreate,
    current_user: dict = Depends(get_current_user)
):
    workspace_id = create_workspace(payload.name, payload.type)

    add_workspace_member(workspace_id, current_user["id"], role="admin")

    return {
        "id": workspace_id,
        "name": payload.name,
        "type": payload.type,
        "role": "admin"
    }


# Delete — an admin can delete the entire workspace they administer.
@router.delete("/{workspace_id}")
def remove_workspace(
    workspace_id: int,
    _: dict = Depends(require_workspace_role("admin"))
):
    deleted = delete_workspace(workspace_id)

    if not deleted:
        raise HTTPException(
            status_code=404,
            detail="Workspace not found"
        )

    return {"message": "Workspace deleted"}


# Members — admin only, scoped to that workspace.
@router.get("/{workspace_id}/members")
def get_members(
    workspace_id: int,
    _: dict = Depends(require_workspace_role("admin"))
):
    return get_workspace_members(workspace_id)


# Add a member by email. The user must already have an account (they sign
# up themselves) — this just grants them a role in this workspace.
@router.post("/{workspace_id}/members")
def post_member(
    workspace_id: int,
    payload: MemberAdd,
    _: dict = Depends(require_workspace_role("admin"))
):
    if payload.role not in ("admin", "user"):
        raise HTTPException(
            status_code=400,
            detail="role must be 'admin' or 'user'"
        )

    user = get_user_by_email(payload.email)

    if user is None:
        raise HTTPException(
            status_code=404,
            detail="No account with that email yet — they need to sign up first"
        )

    add_workspace_member(workspace_id, user["id"], role=payload.role)

    return {
        "message": f"{payload.email} added as {payload.role}"
    }


# Change an existing member's role.
@router.patch("/{workspace_id}/members/{user_id}")
def patch_member_role(
    workspace_id: int,
    user_id: int,
    payload: MemberRoleUpdate,
    caller: dict = Depends(require_workspace_role("admin"))
):
    if payload.role not in ("admin", "user"):
        raise HTTPException(
            status_code=400,
            detail="role must be 'admin' or 'user'"
        )

    if user_id == caller["user"]["id"] and payload.role != "admin":
        raise HTTPException(
            status_code=400,
            detail="You can't demote yourself out of admin — have another admin do it"
        )

    if get_workspace_role(workspace_id, user_id) is None:
        raise HTTPException(
            status_code=404,
            detail="That user isn't a member of this workspace"
        )

    add_workspace_member(workspace_id, user_id, role=payload.role)

    return {"message": "Role updated"}


# Remove a member entirely.
@router.delete("/{workspace_id}/members/{user_id}")
def delete_member(
    workspace_id: int,
    user_id: int,
    caller: dict = Depends(require_workspace_role("admin"))
):
    if user_id == caller["user"]["id"]:
        raise HTTPException(
            status_code=400,
            detail="You can't remove yourself — have another admin do it"
        )

    removed = remove_workspace_member(workspace_id, user_id)

    if not removed:
        raise HTTPException(
            status_code=404,
            detail="That user isn't a member of this workspace"
        )

    return {"message": "Member removed"}

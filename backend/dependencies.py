from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

from auth import decode_access_token
from crud.users import get_user_by_id, get_workspace_role

bearer_scheme = HTTPBearer(auto_error=False)


def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme)
):
    if credentials is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated"
        )

    user_id = decode_access_token(credentials.credentials)

    if user_id is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token"
        )

    user = get_user_by_id(user_id)

    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found"
        )

    return user


def require_workspace_role(*allowed_roles):
    """
    Dependency factory. Use on any route with a `workspace_id` path param:

        @router.post("/workspaces/{workspace_id}/statuses")
        def post_status(
            workspace_id: int,
            status: StatusCreate,
            _: dict = Depends(require_workspace_role("admin"))
        ):
            ...

    Checks the caller's role in THAT workspace specifically — the same
    user can be admin in one workspace and a plain user in another.
    """
    def checker(
        workspace_id: int,
        current_user: dict = Depends(get_current_user)
    ):
        role = get_workspace_role(workspace_id, current_user["id"])

        if role is None:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not a member of this workspace"
            )

        if role not in allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Requires one of roles {allowed_roles}, you have '{role}'"
            )

        return {"user": current_user, "role": role}

    return checker

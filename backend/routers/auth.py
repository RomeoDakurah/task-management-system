from fastapi import APIRouter, HTTPException, Depends, status

from schemas import UserSignup, UserLogin, TokenResponse, UserResponse
from auth import hash_password, verify_password, create_access_token
from crud.users import create_user, get_user_by_email, get_user_workspaces
from dependencies import get_current_user

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/signup", response_model=TokenResponse)
def signup(payload: UserSignup):

    if get_user_by_email(payload.email) is not None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="An account with this email already exists"
        )

    password_hash = hash_password(payload.password)

    user_id = create_user(
        payload.name,
        payload.email,
        password_hash
    )

    token = create_access_token(user_id)

    return TokenResponse(
        access_token=token,
        user=UserResponse(
            id=user_id,
            name=payload.name,
            email=payload.email
        )
    )


@router.post("/login", response_model=TokenResponse)
def login(payload: UserLogin):

    user = get_user_by_email(payload.email)

    if user is None or not user["password_hash"] or not verify_password(
        payload.password,
        user["password_hash"]
    ):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )

    token = create_access_token(user["id"])

    return TokenResponse(
        access_token=token,
        user=UserResponse(
            id=user["id"],
            name=user["name"],
            email=user["email"]
        )
    )


@router.get("/me", response_model=UserResponse)
def me(current_user: dict = Depends(get_current_user)):
    return current_user


@router.get("/me/workspaces")
def my_workspaces(current_user: dict = Depends(get_current_user)):
    """Every workspace this user belongs to, and their role in each."""
    return get_user_workspaces(current_user["id"])

from pydantic import BaseModel
from typing import Optional
from enum import Enum
from datetime import datetime

class Task(BaseModel):
    workspace_id: int
    title: str
    description: str
    category_id: int
    group_id: Optional[int] = None
    priority_id: int
    due_date: Optional[datetime] = None

class TaskUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    category_id: Optional[int] = None
    group_id: Optional[int] = None
    status_id: Optional[int] = None
    priority_id: Optional[int] = None
    due_date: Optional[datetime] = None

class TaskResponse(BaseModel):
    id: int
    title: str
    description: str
    status_id: int
    status: str
    priority_id: int
    priority: str
    created_at: str
    completed_at: Optional[str] = None
    accepted_at: Optional[str] = None
    category_id: Optional[int] = None
    category: Optional[str] = None
    group_id: Optional[int] = None
    group: Optional[str] = None
    due_date: Optional[str] = None
    assigned_to: Optional[int] = None
    created_by: Optional[int] = None

class ConfigCreate(BaseModel):
    name: str


class UserSignup(BaseModel):
    name: str
    email: str
    password: str


class UserLogin(BaseModel):
    email: str
    password: str


class UserResponse(BaseModel):
    id: int
    name: str
    email: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse


class WorkspaceMembershipResponse(BaseModel):
    id: int
    name: str
    type: str
    role: str


class MemberRoleUpdate(BaseModel):
    role: str  # 'admin' | 'user'


class TaskAssign(BaseModel):
    assigned_to: int


class WorkspaceCreate(BaseModel):
    name: str
    type: str


class MemberAdd(BaseModel):
    email: str
    role: str = "user"  # 'admin' | 'user'


class GroupCreate(BaseModel):
    name: str
    type: str


class StatusCreate(BaseModel):
    name: str
    is_completed: bool = False
    is_cancelled: bool = False
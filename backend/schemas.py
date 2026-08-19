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
    status: str
    priority: str
    created_at: str
    completed_at: Optional[str] = None
    category: Optional[str] = None
    group: Optional[str] = None
    due_date: Optional[str] = None

class ConfigCreate(BaseModel):
    name: str


class GroupCreate(BaseModel):
    name: str
    type: str


class StatusCreate(BaseModel):
    name: str
    is_completed: bool = False
    is_cancelled: bool = False
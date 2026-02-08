from typing import Optional
from datetime import datetime
from sqlmodel import SQLModel, Field

class AdminUser(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    username: str = Field(unique=True, index=True)
    hashed_password: str
    role: str = "admin"
    is_active: bool = True
    created_at: datetime = Field(default_factory=datetime.utcnow)

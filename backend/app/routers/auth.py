from fastapi import APIRouter, HTTPException, Depends
from sqlmodel import Session
from pydantic import BaseModel
from app.db import get_session
from app.auth import verify_password, create_access_token, get_admin_by_username, get_current_admin
from app.models.admin import AdminUser

router = APIRouter(prefix="/auth", tags=["Auth"])

class LoginRequest(BaseModel):
    username: str
    password: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"

class AdminMeResponse(BaseModel):
    id: int
    username: str
    role: str

@router.post("/login", response_model=TokenResponse)
def login(request: LoginRequest, session: Session = Depends(get_session)):
    admin = get_admin_by_username(session, request.username)
    if not admin:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    if not verify_password(request.password, admin.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    if not admin.is_active:
        raise HTTPException(status_code=403, detail="Account disabled")

    token = create_access_token(data={"sub": admin.username, "role": admin.role})
    return {"access_token": token, "token_type": "bearer"}

@router.get("/me", response_model=AdminMeResponse)
def get_me(admin: AdminUser = Depends(get_current_admin)):
    return AdminMeResponse(id=admin.id, username=admin.username, role=admin.role)

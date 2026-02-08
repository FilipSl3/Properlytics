from datetime import datetime, timedelta
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import JWTError, jwt
import bcrypt
from sqlmodel import Session, select
from app.db import get_engine, DATABASE_URL
from app.models.admin import AdminUser

SECRET_KEY = "properlytics-secret-key-change-in-production"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 8

security = HTTPBearer()

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return bcrypt.checkpw(plain_password.encode('utf-8'), hashed_password.encode('utf-8'))

def get_password_hash(password: str) -> str:
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(password.encode('utf-8'), salt)
    return hashed.decode('utf-8')

def create_access_token(data: dict) -> str:
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

def get_admin_by_username(session: Session, username: str):
    stmt = select(AdminUser).where(AdminUser.username == username)
    return session.exec(stmt).first()

def get_current_admin(
    credentials: HTTPAuthorizationCredentials = Depends(security)
) -> AdminUser:
    token = credentials.credentials
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username_raw = payload.get("sub")
        if username_raw is None:
            raise HTTPException(status_code=401, detail="Invalid token: missing subject")
        username = str(username_raw)
    except JWTError as e:
        raise HTTPException(status_code=401, detail=f"Invalid token: {str(e)}")

    engine = get_engine()
    with Session(engine) as session:
        admin = get_admin_by_username(session, username)
        if admin is None:
            raise HTTPException(status_code=401, detail="Admin not found")
        if not admin.is_active:
            raise HTTPException(status_code=403, detail="Account disabled")
        return admin

def require_admin(admin: AdminUser = Depends(get_current_admin)) -> AdminUser:
    if admin.role not in ["admin", "superadmin"]:
        raise HTTPException(status_code=403, detail="Insufficient permissions")
    return admin

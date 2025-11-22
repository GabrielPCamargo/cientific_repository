from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.schemas.auth import LoginData, Token
from app.database import get_db
from app.core.security import create_access_token, ACCESS_TOKEN_EXPIRE_MINUTES
from app.crud.user import authenticate_user

router = APIRouter()

@router.post("/login", response_model=Token)
def login(data: LoginData, db: Session = Depends(get_db)):
    user = authenticate_user(db, data.email, data.password)

    if not user:
        raise HTTPException(status_code=401, detail="Email ou senha inválidos")

    token = create_access_token(
        {"sub": str(user.id)}
    )

    return {"access_token": token, "token_type": "bearer"}

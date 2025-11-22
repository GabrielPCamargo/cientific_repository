from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer
from jose import jwt, JWTError

from app.core.security import SECRET_KEY, ALGORITHM
from app.models.user import User
from app.database import get_db
from sqlalchemy.orm import Session

bearer_scheme = HTTPBearer()

def get_current_user(credentials = Depends(bearer_scheme), db: Session = Depends(get_db)):
    
    token = credentials.credentials
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: int = payload.get("sub")

        if user_id is None:
            raise HTTPException(status_code=401, detail="Invalid token")

    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")

    user = db.query(User).filter(User.id == user_id).first()

    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    
    return user

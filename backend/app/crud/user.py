from sqlalchemy.orm import Session
from app.models.user import User
from app.schemas.user import UserCreate
from app.core.security import hash_password

def create_user(db: Session, data: UserCreate):
    # verify if course already exists
    existing = db.query(User).filter(User.email == data.email).first()
    if existing:
        return None
    
    new_user = User(
        name=data.name,
        email=data.email,
        password_hash=hash_password(data.password),
        course_id=data.course_id
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user

from sqlalchemy.orm import Session
from app.models.course import Course
from app.schemas.course import CourseCreate

def create_course(db: Session, data: CourseCreate):
    # verify if course already exists
    existing = db.query(Course).filter(Course.name == data.name).first()
    if existing:
        return None
    
    new_course = Course(name=data.name)
    db.add(new_course)
    db.commit()
    db.refresh(new_course)
    return new_course

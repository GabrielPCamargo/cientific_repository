from sqlalchemy.orm import Session
from app.models.event import Event
from app.schemas.event import EventCreate

def create_event(db: Session, data: EventCreate):
    # verify if event already exists
    existing = db.query(Event).filter(Event.code == data.code).first()
    if existing:
        return None
    
    new_event = Event(
        name=data.name,
        code=data.code
    )
    db.add(new_event)
    db.commit()
    db.refresh(new_event)
    return new_event

def get_all_events(db: Session):
    return db.query(Event).all()

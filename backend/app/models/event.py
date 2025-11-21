from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base

class Event(Base):
    __tablename__ = "events"

    id = Column(Integer, primary_key=True)
    code = Column(String, unique=True, nullable=False)  # "LATS"
    name = Column(String, nullable=False)               # "Latin American Test Symposium"

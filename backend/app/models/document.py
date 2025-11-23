from sqlalchemy import Column, Integer, String, ForeignKey, Text
from sqlalchemy.orm import relationship
from app.database import Base

class Document(Base):
    __tablename__ = "documents"

    id = Column(Integer, primary_key=True, index=True)

    title = Column(String, nullable=False)
    abstract = Column(Text, nullable=True)
    
    type = Column(String, nullable=False)  # "event", "symposium", "periodical", etc.
    field = Column(String, nullable=True)  # area / field of study
    
    event_id = Column(Integer, ForeignKey("events.id"))
    event = relationship("Event")

    
    publish_year = Column(Integer, nullable=False)

    course_id = Column(Integer, ForeignKey("courses.id"), nullable=True)
    course = relationship("Course")

    advisor_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    advisor = relationship("User")

    file_url = Column(String, nullable=False)

    # relationships
    authors = relationship("DocumentAuthor", cascade="all, delete-orphan")
    keywords = relationship("DocumentKeyword", cascade="all, delete-orphan")

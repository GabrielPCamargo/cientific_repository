from sqlalchemy import Column, Integer, String, ForeignKey
from app.database import Base

class DocumentAuthor(Base):
    __tablename__ = "document_authors"

    id = Column(Integer, primary_key=True)

    document_id = Column(Integer, ForeignKey("documents.id", ondelete="CASCADE"))
    name = Column(String, nullable=False)
    email = Column(String, nullable=True)

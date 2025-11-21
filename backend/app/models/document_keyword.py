from sqlalchemy import Column, Integer, String, ForeignKey
from app.database import Base

class DocumentKeyword(Base):
    __tablename__ = "document_keywords"

    id = Column(Integer, primary_key=True)

    document_id = Column(Integer, ForeignKey("documents.id", ondelete="CASCADE"))
    keyword = Column(String, nullable=False)

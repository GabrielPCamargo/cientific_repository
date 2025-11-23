from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.schemas.auth import LoginData, Token
from app.database import get_db
from app.core.auth import get_current_user
from app.crud.user import authenticate_user
from app.schemas.document import DocumentCreate
from app.models.user import User
from app.models.document import Document
from app.models.document_author import DocumentAuthor
from app.models.document_keyword import DocumentKeyword
from app.schemas.document import DocumentResponse

router = APIRouter()

@router.get("/documents", response_model=list[DocumentResponse])
def get_all_documents(db: Session = Depends(get_db)):
    return db.query(Document).all()


@router.post("/documents")
def create_document(data: DocumentCreate, db: Session = Depends(get_db), user: User = Depends(get_current_user)):

    document = Document(
        title=data.title,
        abstract=data.abstract,
        type=data.type,
        field=data.field,
        publish_year=data.publish_year,
        event_id=data.event_id,
        course_id=data.course_id,
        advisor_id=data.advisor_id,
         file_url=data.file_url,
    )

    # Criar DocumentAuthor
    for a in data.authors:
        document.authors.append(
            DocumentAuthor(
                name=a.name,
                email=a.email
            )
        )

    # Criar DocumentKeyword
    for kw in data.keywords:
        document.keywords.append(
            DocumentKeyword(keyword=kw)
        )

    db.add(document)
    db.commit()
    db.refresh(document)

    return document

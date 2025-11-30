from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import exc, or_
from typing import List

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

@router.get("/documents/my-publications", response_model=list[DocumentResponse])
def get_user_documents(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    """Retorna apenas os documentos onde o usuário é o advisor"""
    return db.query(Document).options(
        joinedload(Document.authors),
        joinedload(Document.keywords),
        joinedload(Document.advisor),
        joinedload(Document.course),
        joinedload(Document.event)
    ).filter(Document.advisor_id == user.id).all()


def get_all_documents(db: Session = Depends(get_db)):
    return db.query(Document).options(
        joinedload(Document.authors),
        joinedload(Document.keywords),
        joinedload(Document.advisor),
        joinedload(Document.course),
        joinedload(Document.event)
    ).all()

@router.get("/documents", response_model=list[DocumentResponse])
def get_all_documents_filtered(
    q: str | None = None,
    type: List[str] = Query(default=[]),
    publish_year: List[int] = Query(default=[]),
    field: List[str] = Query(default=[]),
    keyword: List[str] = Query(default=[]),
    event_id: List[int] = Query(default=[]),
    limit: int = 100,
    offset: int = 0,
    db: Session = Depends(get_db)
):
    """Retorna documentos aplicando filtros opcionais via query params (suporta múltiplos valores)"""

    query = db.query(Document).options(
        joinedload(Document.authors),
        joinedload(Document.keywords),
        joinedload(Document.advisor),
        joinedload(Document.course),
        joinedload(Document.event)
    )

    if q:
        # procura por título ou nome de autor
        query = query.join(Document.authors, isouter=True).filter(
            or_(Document.title.ilike(f"%{q}%"), DocumentAuthor.name.ilike(f"%{q}%"))
        )

    if type:
        query = query.filter(Document.type.in_(type))

    if publish_year:
        query = query.filter(Document.publish_year.in_(publish_year))

    if field:
        # Para múltiplos campos, usa OR entre eles
        field_filters = [Document.field.ilike(f"%{f}%") for f in field]
        query = query.filter(or_(*field_filters))

    if keyword:
        # Para múltiplas keywords, usa OR entre elas
        keyword_filters = [DocumentKeyword.keyword.ilike(f"%{k}%") for k in keyword]
        query = query.join(Document.keywords, isouter=True).filter(or_(*keyword_filters))

    if event_id:
        query = query.filter(Document.event_id.in_(event_id))

    # Remove duplicatas e aplica limite e offset
    results = query.distinct().offset(offset).limit(limit).all()
    return results


@router.get("/documents/{document_id}", response_model=DocumentResponse)
def get_document_by_id(document_id: int, db: Session = Depends(get_db)):
    """Retorna os detalhes de um documento específico"""
    document = db.query(Document).options(
        joinedload(Document.authors),
        joinedload(Document.keywords),
        joinedload(Document.advisor),
        joinedload(Document.course),
        joinedload(Document.event)
    ).filter(Document.id == document_id).first()
    if not document:
        raise HTTPException(status_code=404, detail="Documento não encontrado")
    return document


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

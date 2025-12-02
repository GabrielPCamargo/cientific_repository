from pydantic import BaseModel
from typing import List, Optional
from .event import EventResponse
from .user import UserResponse
from .course import CourseResponse
from .author import AuthorResponse
from .keyword import KeywordResponse

class AuthorCreate(BaseModel):
    name: str
    email: Optional[str] = None

class KeywordCreate(BaseModel):
    keyword: str

class DocumentCreate(BaseModel):
    title: str
    abstract: Optional[str] = None
    type: str
    field: Optional[str] = None
    publish_year: int
    event_id: Optional[int] = None
    course_id: Optional[int] = None
    advisor_id: Optional[int] = None  # ID do orientador se for usuário do sistema
    advisor_name: Optional[str] = None  # Nome do orientador se não for usuário
    advisor_email: Optional[str] = None  # Email do orientador se não for usuário
    file_url: str

    authors: List[AuthorCreate]
    keywords: List[str]  # pode ser só uma lista de strings

    model_config = {
        "json_schema_extra": {
            "example": {
                "title": "Aplicações de Machine Learning na Engenharia",
                "abstract": "Este trabalho explora o uso de técnicas de machine learning aplicadas à engenharia civil e mecânica...",
                "type": "event",
                "field": "Engenharia",
                "publish_year": 2024,
                "event_id": 1,
                "course_id": 3,
                "advisor_id": 7,
                "file_url": "https://meu-minio.com/bucket/documentos/ml_engenharia.pdf",
                "authors": [
                    {"name": "João Silva", "email": "joao.silva@example.com"},
                    {"name": "Maria Souza", "email": "maria.souza@example.com"}
                ],
                "keywords": ["Machine Learning", "Engenharia", "Modelos Preditivos"]
            }
        }
    }

class DocumentResponse(BaseModel):
    id: int
    title: str
    abstract: Optional[str]
    type: str
    field: Optional[str]
    publish_year: int
    file_url: str

    event: Optional[EventResponse]
    course: Optional[CourseResponse]
    advisor: Optional[UserResponse]
    advisor_name: Optional[str]
    advisor_email: Optional[str]

    authors: List[AuthorResponse]
    keywords: List[KeywordResponse]

    class Config:
        orm_mode = True

class AuthorUpdate(BaseModel):
    name: str
    email: Optional[str] = None

class DocumentUpdate(BaseModel):
    title: Optional[str] = None
    abstract: Optional[str] = None
    type: Optional[str] = None
    field: Optional[str] = None
    publish_year: Optional[int] = None
    event_id: Optional[int] = None
    course_id: Optional[int] = None
    advisor_id: Optional[int] = None
    file_url: Optional[str] = None

    authors: Optional[List[AuthorUpdate]] = None
    keywords: Optional[List[str]] = None

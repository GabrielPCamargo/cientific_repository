from fastapi.middleware.cors import CORSMiddleware # type: ignore
from fastapi import FastAPI, UploadFile, File, Depends, HTTPException # type: ignore
from fastapi.responses import StreamingResponse
from app.minio_client import client, BUCKET
import uuid
import os
import io
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas.course import CourseCreate, CourseResponse
from app.crud.course import create_course, get_all_courses

from app.schemas.user import UserCreate, UserResponse
from app.crud.user import create_user
from app.core.auth import get_current_user
from app.models.user import User
from app.routes.auth import router as auth_router   # importa seu router
from app.routes.document import router as document_router   # importa seu router

from app.schemas.event import EventCreate, EventResponse
from app.crud.event import create_event, get_all_events

from app.models.document_keyword import DocumentKeyword
from app.schemas.keyword import KeywordResponse

from app.utils import get_public_url, slugify_filename

import app.models 

print("BUCKET =", os.getenv("MINIO_BUCKET"))

app = FastAPI(title="Portal de Produção Científica")

# Permite acesso do frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# registra o router de login
app.include_router(auth_router)
app.include_router(document_router)

@app.get("/")
def read_root():
    return {"message": "API do Portal Científico está funcionando!"}

@app.get("/me", response_model=UserResponse)
def get_current_user_info(user: User = Depends(get_current_user)):
    return user

@app.get("/event", response_model=list[EventResponse])
def get_all_events_route(db: Session = Depends(get_db)):
    events = get_all_events(db)
    return events


@app.get("/keywords", response_model=list[KeywordResponse])
def get_all_keywords(db: Session = Depends(get_db)):
    """Retorna todas as palavras-chave únicas cadastradas"""
    keywords = db.query(DocumentKeyword).distinct(DocumentKeyword.keyword).all()
    return keywords


@app.post("/event", response_model=EventResponse)
def create_course_route(data: EventCreate, db: Session = Depends(get_db)):
    event = create_event(db, data)
    if not event:
        raise HTTPException(status_code=400, detail="Event already exists")
    return event

@app.post("/course", response_model=CourseResponse)
def create_course_route(data: CourseCreate, db: Session = Depends(get_db)):
    course = create_course(db, data)
    if not course:
        raise HTTPException(status_code=400, detail="Course already exists")
    return course

@app.get("/course", response_model=list[CourseResponse])
def get_all_courses_route(db: Session = Depends(get_db)):
    courses = get_all_courses(db)
    return courses

@app.post("/user", response_model=UserResponse)
def create_user_route(data: UserCreate, db: Session = Depends(get_db)):
    user = create_user(db, data)
    if not user:
        raise HTTPException(status_code=400, detail="user already exists")
    return user

@app.post("/upload")
async def upload(file: UploadFile = File(...), user: User = Depends(get_current_user)):
    file_id = f"{uuid.uuid4()}-{slugify_filename(file.filename)}"

    # Determinar o content_type correto
    content_type = file.content_type or "application/octet-stream"
    
    client.put_object(
        BUCKET,
        file_id,
        file.file,
        length=-1,
        part_size=10 * 1024 * 1024,
        content_type=content_type,
    )

    #internal_url = client.presigned_get_object(BUCKET, file_id)

    # host interno que o MinIO usa no Docker
    return {
        "filename": file.filename,
        "id": file_id,
        "url": get_public_url(file_id),
    }


@app.get("/files/{file_id:path}")
async def serve_file(file_id: str):
    """Serve arquivos do MinIO com headers corretos para visualização no navegador"""
    try:
        response = client.get_object(BUCKET, file_id)
        data = response.read()
        response.close()
        response.release_conn()
        
        # Determinar content-type baseado na extensão
        content_type = "application/octet-stream"
        if file_id.lower().endswith(".pdf"):
            content_type = "application/pdf"
        elif file_id.lower().endswith((".jpg", ".jpeg")):
            content_type = "image/jpeg"
        elif file_id.lower().endswith(".png"):
            content_type = "image/png"
        
        return StreamingResponse(
            io.BytesIO(data),
            media_type=content_type,
            headers={
                "Content-Disposition": f"inline; filename={file_id.split('/')[-1]}",
                "Cache-Control": "public, max-age=3600"
            }
        )
    except Exception as e:
        raise HTTPException(status_code=404, detail=f"Arquivo não encontrado: {str(e)}")


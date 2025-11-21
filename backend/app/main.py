from fastapi.middleware.cors import CORSMiddleware # type: ignore
from fastapi import FastAPI, UploadFile, File, Depends, HTTPException # type: ignore
from app.minio_client import client, BUCKET
import uuid
import os
import re
import unicodedata
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas.course import CourseCreate, CourseResponse
from app.crud.course import create_course

print("BUCKET =", os.getenv("MINIO_BUCKET"))

PUBLIC_URL = os.getenv("PUBLIC_MINIO_URL_REPOSITORY", "http://localhost:9000/cientific-repository")

def get_public_url(object_name: str) -> str:
    return f"{PUBLIC_URL.rstrip('/')}/{object_name}"

def slugify_filename(filename: str) -> str:
    # 1. Normaliza para ASCII (remove acentos: ç -> c, é -> e)
    filename = unicodedata.normalize('NFKD', filename).encode('ascii', 'ignore').decode('ascii')
    
    # 2. Remove tudo que NÃO for letra, número, ponto ou hífen
    # (Isso evita ataques de diretório como ../)
    filename = re.sub(r'[^\w\s.-]', '', filename)
    
    # 3. Troca espaços (e underscores se quiser) por hifens
    filename = re.sub(r'[-\s]+', '-', filename).strip('-_')
    
    return filename.lower() # Opcional: deixa tudo minúsculo

app = FastAPI(title="Portal de Produção Científica")

# Permite acesso do frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"message": "API do Portal Científico está funcionando!"}

@app.get('/documents')

@app.post('/user')

@app.post("/course", response_model=CourseResponse)
def create_course_route(data: CourseCreate, db: Session = Depends(get_db)):
    course = create_course(db, data)
    if not course:
        raise HTTPException(status_code=400, detail="Course already exists")
    return course


@app.post("/upload")
async def upload(file: UploadFile = File(...)):
    file_id = f"{uuid.uuid4()}-{slugify_filename(file.filename)}"

    client.put_object(
        BUCKET,
        file_id,
        file.file,
        length=-1,
        part_size=10 * 1024 * 1024,
    )

    #internal_url = client.presigned_get_object(BUCKET, file_id)

    # host interno que o MinIO usa no Docker
    return {
        "filename": file.filename,
        "id": file_id,
        "url": get_public_url(file_id),
    }


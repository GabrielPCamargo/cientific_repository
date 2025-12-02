import re
import unicodedata
import os

PUBLIC_URL = os.getenv("PUBLIC_MINIO_URL_REPOSITORY", "http://localhost:9000/cientific-repository")

def get_public_url(object_name: str) -> str:
    """Retorna a URL pública de um objeto no MinIO."""
    return f"{PUBLIC_URL.rstrip('/')}/{object_name}"

def slugify_filename(filename: str) -> str:
    """Converte o nome do arquivo para um formato seguro (slug)."""
    # 1. Normaliza para ASCII (remove acentos: ç -> c, é -> e)
    filename = unicodedata.normalize('NFKD', filename).encode('ascii', 'ignore').decode('ascii')
    
    # 2. Remove tudo que NÃO for letra, número, ponto ou hífen
    # (Isso evita ataques de diretório como ../)
    filename = re.sub(r'[^\w\s.-]', '', filename)
    
    # 3. Troca espaços (e underscores se quiser) por hifens
    filename = re.sub(r'[-\s]+', '-', filename).strip('-_')
    
    return filename.lower()

from minio import Minio
from dotenv import load_dotenv
import os


# Obtém variáveis de ambiente
endpoint = os.getenv("MINIO_ENDPOINT")
access_key = os.getenv("MINIO_ACCESS_KEY")
secret_key = os.getenv("MINIO_SECRET_KEY")
bucket = os.getenv("MINIO_BUCKET")

# Remove o http:// ou https:// para o MinIO aceitar
clean_endpoint = (
    endpoint.replace("http://", "").replace("https://", "")
)

# Cria o cliente MinIO
client = Minio(
    clean_endpoint,
    access_key=access_key,
    secret_key=secret_key,
    secure=False  # não usa HTTPS dentro do docker
)

BUCKET = bucket

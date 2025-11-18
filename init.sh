# Cria alias
docker exec -it minio mc alias set local http://localhost:9000 minioadmin minioadmin

# Cria bucket e deixa público
docker exec -it minio mc mb local/cientific-repository --ignore-existing
# 3. COMANDO CERTO PARA DEIXAR O BUCKET 100% PÚBLICO (2024/2025)
docker exec -it minio mc anonymous set public local/cientific-repository
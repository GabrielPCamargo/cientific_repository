# Docker Compose — Common commands (detached examples)

Quick reference of frequently used `docker compose` commands and their detached variants.

## Basic lifecycle
- Start services (detached)
```bash
docker compose up -d
```
- Start services (foreground)
```bash
docker compose up
```
- Stop and remove containers, networks, volumes (graceful)
```bash
docker compose down
```
- Stop services (keep containers)
```bash
docker compose stop
```
- Start stopped services
```bash
docker compose start
```
- Restart services
```bash
docker compose restart
```

## Build / pull / create
- Build images defined in compose file
```bash
docker compose build
```
- Pull images
```bash
docker compose pull
```
- Create containers without starting
```bash
docker compose create
```

## One-off / interactive / detached run
- Run one-off command interactively
```bash
docker compose run SERVICE COMMAND
```
- Run one-off command in detached mode
```bash
docker compose run -d SERVICE COMMAND
```

## Logs / attach / exec
- Follow logs (after running detached)
```bash
docker compose logs -f
```
- Attach to a running container (single service)
```bash
docker compose attach SERVICE
```
- Execute command in a running service container
```bash
docker compose exec SERVICE COMMAND
```

## Inspect / manage
- List containers for the project
```bash
docker compose ps
```
- Remove stopped service containers
```bash
docker compose rm
```
- Force remove without prompt
```bash
docker compose rm -f
```
- Show combined compose config
```bash
docker compose config
```
- Show version
```bash
docker compose version
```

## Common flags / examples
- Specify compose file(s):
```bash
docker compose -f docker-compose.yml -f docker-compose.override.yml up -d
```
- Set project name:
```bash
docker compose -p myproject up -d
```
- Recreate containers without caching:
```bash
docker compose up -d --build --force-recreate
```

Use `man docker-compose` or `docker compose --help` for full command details.

For error in backend related to bucket creation run
```bash
    ./init.sh
```

## Migrations

É necessário importar todos os modelos no alembic/.env

Entrar no bash do container backend

```bash
    docker exec -it backend bash
```

Gerar migration com nome "create users table"

```bash
    alembic revision --autogenerate -m "create users table"
```
Atualizar banco de dados:

```bash
    alembic upgrade head
```

Para sair do exec do container:

ctrl + d

Para verificar o banco de dados:


```bash
    docker exec -it db bash
    psql -U postgres -d mydb -c "\dt"
    
```
Para ver o conteúdo de uma tabela individual
Isso mostrará as colunas id, name, email, tipos de dados (integer, varchar) e chaves primárias.

```bash
psql -U postgres -d mydb -c "\d users" 
```

Para ver tudo que tem na tabela users

```bash
psql -U postgres -d mydb -c "SELECT * FROM users;" 
```





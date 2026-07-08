## part 1
docker --version

docker info

docker pull hello-world

docker images

docker run hello-world

docker pull ubuntu

docker run -it ubuntu

docker ps

docker ps -a

docker stop <container_id>

docker rm <container_id>

docker rmi <image_name>



## part 2



# 🐳 Day 11 - Docker Commands Cheat Sheet

## What is Docker?

Docker is a platform that packages an application along with all its dependencies into a **Container**, so it runs the same everywhere.

```
Developer Machine
        │
        ▼
    Docker Image
        │
        ▼
 Docker Container
        │
        ▼
 Runs Anywhere
```

---

# Docker Terminologies

| Term | Meaning |
|------|---------|
| Docker Engine | Software that runs containers |
| Docker Image | Blueprint or Template of an application |
| Docker Container | Running instance of an Image |
| Dockerfile | Recipe to build an Image |
| Docker Hub | Online repository of Docker Images |
| Docker Compose | Runs multiple containers together |

---

# 1. Check Docker Version

```bash
docker --version
```

### Purpose

Checks whether Docker is installed.

Example Output

```text
Docker version 28.x.x
```

---

# 2. Docker Information

```bash
docker info
```

### Purpose

Displays

- Docker Engine
- Images
- Containers
- Storage
- Networks

---

# 3. Login to Docker Hub

```bash
docker login
```

### Purpose

Authenticate with Docker Hub.

---

# 4. Logout

```bash
docker logout
```

---

# 5. Search Images

```bash
docker search nginx
```

### Purpose

Search Docker Hub for images.

Example

```bash
docker search postgres
```

```bash
docker search python
```

---

# 6. Download Image

```bash
docker pull hello-world
```

### Purpose

Downloads image from Docker Hub.

Example

```bash
docker pull ubuntu
```

```bash
docker pull nginx
```

```bash
docker pull postgres
```

---

# 7. List Images

```bash
docker images
```

### Purpose

Displays all downloaded images.

Example Output

```text
REPOSITORY      TAG

ubuntu          latest

postgres        latest

nginx           latest
```

---

# 8. Delete Image

```bash
docker rmi image_name
```

Example

```bash
docker rmi ubuntu
```

---

# 9. Run Container

```bash
docker run hello-world
```

### Purpose

Creates and starts a container.

---

# 10. Run Interactive Container

```bash
docker run -it ubuntu
```

### Purpose

Starts Ubuntu terminal.

Example

```text
root@container:/#
```

Exit

```bash
exit
```

---

# 11. Run Detached Container

```bash
docker run -d nginx
```

### Purpose

Runs container in background.

---

# 12. Run Container with Port Mapping

```bash
docker run -p 8000:8000 talentspark-api
```

### Purpose

Maps

```
Laptop Port

↓

Container Port
```

Syntax

```bash
docker run -p HOST_PORT:CONTAINER_PORT image_name
```

---

# 13. Give Container Name

```bash
docker run --name myapp nginx
```

Instead of random name.

---

# 14. List Running Containers

```bash
docker ps
```

Shows

Only Running Containers.

---

# 15. List All Containers

```bash
docker ps -a
```

Shows

Running + Stopped Containers.

---

# 16. Stop Container

```bash
docker stop container_id
```

Example

```bash
docker stop 1d34ab56
```

---

# 17. Start Container

```bash
docker start container_id
```

---

# 18. Restart Container

```bash
docker restart container_id
```

---

# 19. Remove Container

```bash
docker rm container_id
```

Example

```bash
docker rm 1d34ab56
```

---

# 20. Force Remove Running Container

```bash
docker rm -f container_id
```

---

# 21. View Logs

```bash
docker logs container_id
```

Example

```bash
docker logs talentspark-api
```

Useful for debugging.

---

# 22. Enter Running Container

```bash
docker exec -it container_id bash
```

Example

```bash
docker exec -it talentspark-api bash
```

Useful Commands

```bash
pwd
```

```bash
ls
```

```bash
cd app
```

Exit

```bash
exit
```

---

# 23. Copy File Into Container

```bash
docker cp file.txt container_id:/app
```

---

# 24. Copy File From Container

```bash
docker cp container_id:/app/output.txt .
```

---

# Dockerfile Commands

---

## FROM

```dockerfile
FROM python:3.12-slim
```

Purpose

Base Image.

---

## WORKDIR

```dockerfile
WORKDIR /app
```

Purpose

Sets working directory.

---

## COPY

```dockerfile
COPY . .
```

Purpose

Copies project.

---

## RUN

```dockerfile
RUN pip install -r requirements.txt
```

Purpose

Runs command while building image.

---

## EXPOSE

```dockerfile
EXPOSE 8000
```

Purpose

Documents which port the application uses.

---

## CMD

```dockerfile
CMD ["uvicorn","app.main:app","--host","0.0.0.0","--port","8000"]
```

Purpose

Starts application.

---

# Build Docker Image

```bash
docker build -t talentspark-api .
```

### Purpose

Creates Docker Image from Dockerfile.

Syntax

```bash
docker build -t image_name .
```

---

# Run FastAPI Container

```bash
docker run -p 8000:8000 talentspark-api
```

Open

```
http://localhost:8000/docs
```

---

# Docker Compose Commands

---

## Start All Services

```bash
docker compose up
```

Runs

- Backend
- Frontend

---

## Build and Start

```bash
docker compose up --build
```

Rebuilds images before starting.

---

## Detached Mode

```bash
docker compose up -d
```

Runs in background.

---

## Stop Services

```bash
docker compose down
```

Stops all containers.

---

## Restart Services

```bash
docker compose restart
```

---

## View Logs

```bash
docker compose logs
```

---

## View Running Containers

```bash
docker compose ps
```

---

## Rebuild Image

```bash
docker compose build
```

---

# Clean Docker System

## Remove Stopped Containers

```bash
docker container prune
```

---

## Remove Unused Images

```bash
docker image prune
```

---

## Remove Everything Unused

```bash
docker system prune
```

---

## Remove Everything Including Images

```bash
docker system prune -a
```

---

# TalentSpark Workflow

## Build Backend

```bash
docker build -t talentspark-api .
```

---

## Run Backend

```bash
docker run -p 8000:8000 talentspark-api
```

---

## Check Running Containers

```bash
docker ps
```

---

## View Logs

```bash
docker logs <container_id>
```

---

## Enter Container

```bash
docker exec -it <container_id> bash
```

---

## Stop Container

```bash
docker stop <container_id>
```

---

# Complete Docker Lifecycle

```
Dockerfile

        │

        ▼

docker build

        │

        ▼

Docker Image

        │

        ▼

docker run

        │

        ▼

Docker Container

        │

        ▼

Application Running

        │

        ▼

docker stop

        │

        ▼

Container Stopped
```

---

# Commands to Remember

```bash
docker --version

docker info

docker pull ubuntu

docker images

docker run hello-world

docker run -it ubuntu

docker run -d nginx

docker ps

docker ps -a

docker stop <container_id>

docker start <container_id>

docker restart <container_id>

docker rm <container_id>

docker logs <container_id>

docker exec -it <container_id> bash

docker build -t talentspark-api .

docker compose up

docker compose up --build

docker compose up -d

docker compose down

docker compose logs

docker system prune
```

## laptop1

# Build the image
docker build -t <your-dockerhub-username>/myapp:latest .

# Login to Docker Hub
docker login

# Push the image
docker push <your-dockerhub-username>/myapp:latest


## laptop2

# Login (only needed if the image is private)
docker login

# Download the image
docker pull <your-dockerhub-username>/myapp:latest

# Run it
docker run -p 8000:8000 <your-dockerhub-username>/myapp:latest
docker run --env-file .env -p 8000:8000 <your-dockerhub-username>/myapp:latest
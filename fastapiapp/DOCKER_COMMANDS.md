# 📋 Complete Docker & Docker Compose Commands Reference

This is a comprehensive reference sheet for all Docker CLI and Docker Compose commands. Bookmark this file to quickly find the exact command you need during development and deployment.

---

## 📦 1. Docker Image Commands
Images are the read-only blueprints of your containers.

| Command | Description | Example / Usage |
| :--- | :--- | :--- |
| `docker build` | Build an image from a Dockerfile in the current directory. | `docker build -t myapp:1.0 .` |
| `docker build --build-arg` | Build an image injecting build-time variables. | `docker build --build-arg VITE_API_URL=http://api.com -t frontend .` |
| `docker images` | List all locally cached Docker images. | `docker images` |
| `docker rmi` | Remove one or more local images. | `docker rmi myapp:1.0` |
| `docker tag` | Create a tag pointing to an existing image. | `docker tag myapp:1.0 username/myapp:latest` |
| `docker pull` | Pull an image from Docker Hub or a private registry. | `docker pull postgres:15-alpine` |
| `docker push` | Push an image to Docker Hub or a private registry. | `docker push username/myapp:latest` |
| `docker history` | Show the history of an image (layers, sizes). | `docker history myapp:1.0` |

---

## 🚀 2. Docker Container Lifecycle Commands
Containers are the live running instances of images.

| Command | Description | Example / Usage |
| :--- | :--- | :--- |
| `docker run` | Create and start a new container from an image. | `docker run -d -p 8000:8000 --name my-app myapp:latest` |
| `docker start` | Start one or more stopped containers. | `docker start my-container-name` |
| `docker stop` | Gracefully stop a running container. | `docker stop my-container-name` |
| `docker restart` | Restart a running or stopped container. | `docker restart my-container-name` |
| `docker kill` | Forcefully kill a running container (sends SIGKILL). | `docker kill my-container-name` |
| `docker rm` | Remove one or more stopped containers. | `docker rm my-container-name` |
| `docker rm -f` | Forcefully remove a running container. | `docker rm -f my-container-name` |
| `docker rename` | Rename an existing container. | `docker rename old_name new_name` |

---

## 🔍 3. Inspection & Debugging Commands
Used for diagnosing issues and verifying container health.

| Command | Description | Example / Usage |
| :--- | :--- | :--- |
| `docker ps` | List all running containers. | `docker ps` |
| `docker ps -a` | List all containers (running, stopped, exited). | `docker ps -a` |
| `docker logs` | View the output logs of a container. | `docker logs my-container-name` |
| `docker logs -f` | Follow/stream container logs in real time. | `docker logs -f my-container-name` |
| `docker logs --tail N`| Show only the last N lines of logs. | `docker logs --tail 100 my-container-name` |
| `docker exec -it` | Open an interactive terminal session inside a running container. | `docker exec -it fastapiapp-backend bash` (or `sh`) |
| `docker inspect` | Return low-level configuration details of a container/image (JSON). | `docker inspect fastapiapp-backend` |
| `docker top` | Display the running processes of a container. | `docker top fastapiapp-backend` |
| `docker stats` | Stream live CPU, memory, network, and disk I/O usage stats. | `docker stats` |
| `docker cp` | Copy files/folders between a container and the host filesystem. | `docker cp host_file.txt my-container:/app/container_file.txt` |
| `docker port` | List port mappings or show the host port mapped to a container port. | `docker port fastapiapp-backend` |

---

## 🎛️ 4. Docker Compose Commands
Docker Compose handles orchestration of multi-container systems. Run these commands from the directory containing `docker-compose.yml`.

| Command | Description | Example / Usage |
| :--- | :--- | :--- |
| `docker compose up` | Build, (re)create, start, and attach to containers for all services. | `docker compose up` |
| `docker compose up -d` | Start containers in the background (detached mode). | `docker compose up -d` |
| `docker compose up --build` | Force rebuild images before starting containers. | `docker compose up -d --build` |
| `docker compose down` | Stop and remove containers, networks, images, and volumes. | `docker compose down` |
| `docker compose down -v` | Stop containers and delete all named volumes (wipes database). | `docker compose down -v` |
| `docker compose ps` | List all containers managed by this compose file. | `docker compose ps` |
| `docker compose logs` | Stream logs for all services combined. | `docker compose logs -f` |
| `docker compose logs <service>`| Stream logs for a specific service. | `docker compose logs -f backend` |
| `docker compose exec` | Run a terminal command inside a compose service container. | `docker compose exec backend alembic upgrade head` |
| `docker compose restart` | Restart compose services. | `docker compose restart backend` |
| `docker compose build` | Build or rebuild services defined in the compose file. | `docker compose build` |
| `docker compose config` | Validate and view the resolved configuration in YAML format. | `docker compose config` |

---

## 💾 5. Volume & Network Commands
Volumes persist data; networks connect containers.

| Command | Description | Example / Usage |
| :--- | :--- | :--- |
| `docker volume ls` | List all local Docker volumes. | `docker volume ls` |
| `docker volume create` | Create a new independent storage volume. | `docker volume create my_custom_data` |
| `docker volume inspect`| Display detailed info about a volume. | `docker volume inspect postgres_data` |
| `docker volume rm` | Remove an unused volume. | `docker volume rm volume_name` |
| `docker volume prune` | Delete all unused local volumes. | `docker volume prune` |
| `docker network ls` | List all Docker networks. | `docker network ls` |
| `docker network create`| Create a new network (usually driver type bridge). | `docker network create my_bridge_net` |
| `docker network inspect`| View network config and connected containers. | `docker network inspect host_network` |
| `docker network rm` | Remove a network. | `docker network rm my_bridge_net` |
| `docker network prune` | Delete all unused networks. | `docker network prune` |

---

## 🧹 6. System Cleanup Commands
Docker cache can occupy significant disk space over time. Use these commands to clean up.

| Command | Description | Usage |
| :--- | :--- | :--- |
| `docker system df` | Show Docker disk space usage. | `docker system df` |
| `docker system prune` | Delete stopped containers, unused networks, and dangling images. | `docker system prune` |
| `docker system prune -a` | **Deep Clean**: Delete all stopped containers, unused networks, and ALL unused images. | `docker system prune -a` |
| `docker system prune -a --volumes` | **Complete Wipe**: Same as above, but also deletes all unused storage volumes. | `docker system prune -a --volumes` |

---

## 💡 7. Common Development Cheat Sheet / Scenarios

### Running a database in a container (One-off)
```bash
docker run --name local-postgres -e POSTGRES_PASSWORD=password -e POSTGRES_DB=testdb -p 5432:5432 -d postgres:15-alpine
```

### Inspecting database tables from host CLI
```bash
docker exec -it fastapiapp-db psql -U postgres -d student_db -c "\dt"
```

### Resetting your local database volume in Compose
If your migrations got corrupted and you want a clean database:
```bash
# Shutdown stack and delete volume
docker compose down -v

# Restart stack
docker compose up -d --build
```

### Debugging Backend startup crashes
If your backend container immediately exits, view container logs or run container interactively:
```bash
# View last logs
docker logs fastapiapp-backend

# Override default entrypoint to open a shell and check dependencies manually
docker run -it --entrypoint sh fastapiapp-backend
```
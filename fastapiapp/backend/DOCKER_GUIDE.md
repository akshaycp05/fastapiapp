# Docker & Docker Compose — Complete Guide (Windows & Linux) 🐳

## What is Docker? (Explain Like I'm 5)

Imagine you are a chef. You create a perfect recipe for a cake. You send the recipe to your friend. 
But your friend’s cake tastes terrible. Why?
- They used a different type of oven.
- Their flour was different.
- Their measuring cups were metric; yours were imperial.

**Docker solves this "works on my machine" problem.**

Instead of sending just the recipe, Docker packages the **recipe**, the **exact ingredients**, the **measuring cups**, and the **oven itself** into a single sealed box. Your friend just presses "start," and the oven bakes the identical cake.

- **Dockerfile** → The blueprint/recipe (instructions to build the environment).
- **Image** → The packaged box containing the oven + ingredients (a snapshot of the application state).
- **Container** → The actual oven running and baking the cake (a running instance of the image).
- **Docker Compose** → A kitchen manager. It coordinates multiple chefs (containers) working together (e.g., Backend Chef + Frontend Chef + Database Chef).

---

## The Local Development Architecture

When you run `docker-compose up`, here is how your containers interact:

```
                  ┌──────────────────────────────┐
                  │      YOUR WEB BROWSER        │
                  │   (runs on host machine)     │
                  └──────────────┬───────────────┘
                                 │
         Visits http://localhost:3000   Calls http://localhost:8000
                                 │               │
                                 ▼               ▼
 ┌─────────────────────────────────────────────────────────────────────────┐
 │ DOCKER COMPOSE NETWORK                                                  │
 │                                                                         │
 │  ┌──────────────────────┐           ┌────────────────────────────────┐  │
 │  │  frontend container  │           │       backend container        │  │
 │  │      (Nginx)         │           │           (FastAPI)            │  │
 │  │  Exposed: 3000       │           │   Exposed: 8000                │  │
 │  └──────────────────────┘           └───────────────┬────────────────┘  │
 │                                                     │                   │
 │                                           Connects via host "db"        │
 │                                                     │                   │
 │                                                     ▼                   │
 │                                         ┌───────────────────────────┐   │
 │                                         │      db container         │   │
 │                                         │      (PostgreSQL)         │   │
 │                                         │      Exposed: 5432        │   │
 │                                         └───────────────────────────┘   │
 └─────────────────────────────────────────────────────────────────────────┘
```

---

## Detailed Dockerfile Explanations

### 1. Backend Dockerfile (`backend/Dockerfile`)

Here is the exact code in your [backend/Dockerfile](file:///home/sriram/Sriram_repos/fastapiapp/backend/Dockerfile):

| Command | What It Does | Why We Use It |
| :--- | :--- | :--- |
| `FROM python:3.11-slim` | Uses the official lightweight Python 3.11 image. | Minimizes image size (only includes essential OS packages). |
| `ENV PYTHONDONTWRITEBYTECODE=1` | Prevents Python from writing `.pyc` files. | Keeps the container clean of unnecessary binary cache files. |
| `ENV PYTHONUNBUFFERED=1` | Forces stdout and stderr streams to be unbuffered. | Ensures logs are output immediately to the terminal. |
| `WORKDIR /app` | Sets the working directory inside the container to `/app`. | Groups all application files in one standardized path. |
| `RUN apt-get update && apt-get install...` | Installs build tools and postgres client dependencies. | Required to build certain database packages like `psycopg2`. |
| `COPY requirements.txt .` | Copies only the requirements file first. | Leverages Docker's caching mechanism (avoids reinstalling packages if requirements don't change). |
| `RUN pip install ... -r requirements.txt` | Installs all Python dependencies. | Installs FastAPI, SQLAlchemy, asyncpg, etc. inside the container. |
| `COPY . .` | Copies the rest of the backend files into `/app`. | Copies the code files last so that edits don't trigger rebuilding packages. |
| `EXPOSE 8000` | Informs Docker that the container listens on port 8000. | Documents the application's runtime port. |
| `CMD ["uvicorn", "app.main:app", ...]` | Starts the FastAPI application. | Runs the uvicorn server bound to all interfaces (`0.0.0.0`) on port 8000. |

### 2. Frontend Dockerfile (`frontend/talentspark/Dockerfile`)

Here is the exact code in your [frontend/talentspark/Dockerfile](file:///home/sriram/Sriram_repos/fastapiapp/frontend/talentspark/Dockerfile):

| Command | What It Does | Why We Use It |
| :--- | :--- | :--- |
| **Stage 1: Build** | | |
| `FROM node:20-alpine AS build` | Uses Node.js 20 on Alpine Linux. | Lightweight Node environment to compile TS and React. |
| `WORKDIR /app` | Sets working directory to `/app`. | Standard work location. |
| `COPY package*.json ./` | Copies dependency definitions. | Leverages caching for `node_modules`. |
| `RUN npm ci` | Installs exact versions from `package-lock.json`. | Faster, reproducible, clean dependency install. |
| `COPY . .` | Copies React source files. | Prepares code for build step. |
| `ARG VITE_API_URL` | Declares a build-time argument. | Allows injecting the backend API URL. |
| `ENV VITE_API_URL=${VITE_API_URL}` | Sets environment variable for compile step. | Vite embeds `import.meta.env.VITE_API_URL` during build. |
| `RUN npm run build` | Runs the compilation (`tsc && vite build`). | Compiles code into a static HTML/JS/CSS bundle in `/app/dist`. |
| **Stage 2: Serve** | | |
| `FROM nginx:alpine` | Uses the lightweight Nginx web server. | Static files are served much faster and more securely by Nginx than Node. |
| `COPY --from=build /app/dist...` | Copies build folder from Stage 1 to Nginx HTML folder. | Puts the compiled static React app where Nginx can serve it. |
| `RUN echo 'server { ... }' > ...` | Sets up Nginx single page application routing. | Forces Nginx to redirect all sub-routes to `index.html` (crucial for React Router). |
| `EXPOSE 80` | Informs Docker Nginx is running on port 80. | Standard HTTP port inside the container. |
| `CMD ["nginx", "-g", "daemon off;"]` | Starts Nginx in the foreground. | Keeps the container running. |

---

## Docker Compose Breakdown (`docker-compose.yml`)

Your [docker-compose.yml](file:///home/sriram/Sriram_repos/fastapiapp/docker-compose.yml) configures the services:

### 1. Database Service (`db`)
- **Image**: `postgres:15-alpine` - lightweight PostgreSQL database.
- **Port Mapping**: `"5432:5432"` - exposes database to your host machine (handy if you want to connect using tools like DBeaver or run local scripts).
- **Healthcheck**: Verifies that PostgreSQL is fully started up and ready to accept connections before other services start.
- **Volume**: `postgres_data` persists database tables and records even when containers are stopped/removed.

### 2. Backend Service (`backend`)
- **Build**: Compiles `/backend` folder.
- **Environment**:
  - `DATABASE_URL`: Set to `postgresql+asyncpg://postgres:password@db:5432/student_db`. Docker automatically resolves the hostname `db` to the database container's internal IP.
- **Depends On**: Waits for the `db` service healthcheck to pass before starting.
- **Extra Hosts**: Maps `host.docker.internal` to the host gateway, allowing the container to access local services (like a running local Ollama instance on port 11434).

### 3. Frontend Service (`frontend`)
- **Build**: Compiles `/frontend/talentspark` using the build argument `VITE_API_URL=http://localhost:8000` (pointing your browser to the exposed backend port).
- **Ports**: Maps host port `3000` to Nginx container port `80` (you access the UI via `http://localhost:3000`).

---

## Operating System Setup Instructions

### 🍏 Linux Setup (Ubuntu / Debian / CentOS)

#### 1. Install Docker & Docker Compose
Run the following commands in your terminal:
```bash
# Update package list and install prerequisites
sudo apt-get update
sudo apt-get install -y ca-certificates curl gnupg

# Add Docker’s official GPG key
sudo install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
sudo chmod a+r /etc/apt/keyrings/docker.gpg

# Set up repository
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
  $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | \
  sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# Install Docker Engine and Docker Compose
sudo apt-get update
sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
```

#### 2. Manage Docker as a Non-Root User (Crucial!)
To avoid typing `sudo` for every command, add your user to the `docker` group:
```bash
# Create the docker group (usually already exists)
sudo groupadd docker

# Add your user to the group
sudo usermod -aG docker $USER

# Activate changes (or log out and log back in)
newgrp docker
```

#### 3. Run the App
Navigate to your project root `/home/sriram/Sriram_repos/fastapiapp` and run:
```bash
# Build images and start all containers in the background
docker compose up -d --build

# View logs to verify startup
docker compose logs -f
```

---

### 🪟 Windows Setup (WSL 2)

#### 1. Install WSL 2 (Windows Subsystem for Linux)
Open **PowerShell** as Administrator and run:
```powershell
wsl --install
```
*Note: Restart your computer if prompted.*

#### 2. Install Docker Desktop
1. Download **Docker Desktop for Windows** from the official website.
2. Run the installer and ensure the **"Use WSL 2 instead of Hyper-V"** option is checked.
3. Finish the installation and start Docker Desktop.
4. Go to **Settings > Resources > WSL Integration**, and enable integration for your default WSL distribution (e.g., Ubuntu).

#### 3. Run the App
Open your WSL terminal or PowerShell in your project root folder and run:
```bash
# Build and run containers
docker compose up -d --build

# Stop the application
docker compose down
```

---

## Useful Docker CLI Commands Reference

| Command | What it does |
| :--- | :--- |
| `docker compose up -d --build` | Builds/rebuilds images and starts containers in detached mode. |
| `docker compose down` | Stops and removes all containers, networks, and volumes. |
| `docker compose logs -f <service>` | Streams logs from a specific container (e.g. `backend`). |
| `docker compose ps` | Lists all running containers for the project. |
| `docker compose exec backend bash` | Opens a terminal session *inside* the running backend container. |
| `docker system prune -a --volumes` | **Clean up**: Deletes all cached builds, unused images, and stopped containers. |
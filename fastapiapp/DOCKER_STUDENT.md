# 🐳 Complete Docker & AWS Elastic Beanstalk Student Guide

Welcome to the ultimate guide on containerization and cloud deployment! This document is designed to take you from a complete beginner to confidently running a full-stack application (FastAPI backend + React frontend + PostgreSQL database) locally and deploying it live on AWS Elastic Beanstalk.

---

## 📌 Section 1: Conceptual Foundations

### 1. What is Docker?
In traditional development, you often encounter the **"Works on My Machine"** syndrome. A program runs perfectly on the developer's computer but crashes when deployed to production. This happens because of differences in:
* Operating Systems (Windows vs. macOS vs. Linux)
* Installed libraries and package versions
* System-level configurations and environment variables

**Docker** solves this by packaging your application along with all of its dependencies, configurations, system tools, and runtime into a single, standardized unit called a **Container**. Wherever Docker is installed, your container will run exactly the same way.

---

### 2. How Docker Works Under the Hood
Docker is not a virtual machine. It runs natively on the Linux kernel and utilizes special OS-level virtualization features to achieve isolation.

```
┌────────────────────────────────────────────────────────┐
│                   DOCKER ARCHITECTURE                  │
│                                                        │
│   ┌────────────────────────────────────────────────┐   │
│   │               Docker Client (CLI)              │   │
│   └───────────────────────┬────────────────────────┘   │
│                           │ REST API Calls             │
│                           ▼                            │
│   ┌────────────────────────────────────────────────┐   │
│   │           Docker Daemon (dockerd Engine)       │   │
│   │ ┌────────────────────────────────────────────┐ │   │
│   │ │                 Images                     │ │   │
│   │ └────────────────────────────────────────────┘ │   │
│   │ ┌───────────────┐ ┌───────────────┐ ┌────────┐ │   │
│   │ │ Container 1   │ │ Container 2   │ │ ...    │ │   │
│   │ └───────────────┘ └───────────────┘ └────────┘ │   │
│   └───────────────────────┬────────────────────────┘   │
│                           │                            │
│ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ┼ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═│
│                           ▼                            │
│   ┌────────────────────────────────────────────────┐   │
│   │              Host OS Kernel (Linux)            │   │
│   │  (Namespaces  •  Control Groups (cgroups)  •  │   │
│   │  Union File System (UnionFS))                  │   │
│   └────────────────────────────────────────────────┘   │
└────────────────────────────────────────────────────────┘
```

The Docker Engine runs as a client-server application consisting of:
1. **Docker Daemon (`dockerd`)**: A persistent background process that manages images, containers, networks, and storage volumes.
2. **Docker API**: A REST API interface that allows external programs and CLI commands to talk to the Daemon.
3. **Docker CLI (`docker`)**: The terminal interface used by developers to run commands.

#### Core Linux Technologies Used by Docker:
* **Namespaces**: Provide isolation. Each container runs in its own namespace and cannot see or access processes, network interfaces, or files outside of it.
  * *PID namespace*: Isolates processes.
  * *NET namespace*: Isolates network interfaces.
  * *MNT namespace*: Isolates file system mount points.
  * *IPC namespace*: Isolates system resources.
* **Control Groups (cgroups)**: Control resource allocation. They ensure that a single container doesn't consume all the host's RAM, CPU, or I/O bandwidth.
* **Union File System (UnionFS)**: Allows file systems to be layered. Docker images are built as a stack of read-only layers. When a container is started, a thin writeable layer (container layer) is added on top. This makes image creation extremely fast and saves disk space.

---

### 3. Difference Between Docker Containers and Virtual Machines
The primary difference is that **Virtual Machines virtualize hardware**, while **Containers virtualize the Operating System**.

```
      ┌─────────────────────────┐             ┌─────────────────────────┐
      │     VIRTUAL MACHINES    │             │    DOCKER CONTAINERS    │
      ├───────────┬─────────────┤             ├───────────┬─────────────┤
      │   App A   │    App B    │             │   App A   │    App B    │
      ├───────────┼─────────────┤             ├───────────┼─────────────┤
      │ Libs/Deps │  Libs/Deps  │             │ Libs/Deps │  Libs/Deps  │
      ├───────────┼─────────────┤             ├───────────┴─────────────┤
      │ Guest OS  │  Guest OS   │             │      Docker Engine      │
      ├───────────┴─────────────┤             ├─────────────────────────┤
      │       Hypervisor        │             │    Host OS (Kernel)     │
      ├─────────────────────────┤             ├─────────────────────────┤
      │    Host OS / Hardware   │             │   Physical Hardware     │
      └─────────────────────────┘             └─────────────────────────┘
```

Here is a detailed comparison:

| Feature | Virtual Machine (VM) | Docker Container |
| :--- | :--- | :--- |
| **OS Kernel** | Each VM has its own Guest OS and kernel. | All containers share the Host OS kernel. |
| **Size** | Large (gigabytes), as it includes a full OS. | Small (megabytes), containing only app dependencies. |
| **Boot Time** | Slow (minutes) because the entire OS must boot. | Fast (milliseconds to seconds) because it's just a process. |
| **Resource Efficiency**| Low (high memory and CPU overhead per VM). | High (uses only resources the app process needs). |
| **Isolation** | Strong (hardware-level virtualization). | Strong, but slightly less than VM (kernel-level namespaces). |
| **Hypervisor** | Required (VMware, VirtualBox, Hyper-V). | Not required (uses Docker Engine). |

---

## ⚙️ Section 2: Installation and Setup

### 🍏 1. Linux Setup (Ubuntu/Debian)
Follow these steps to install Docker Engine natively on Linux:

#### Step 1: Install Prerequisites & Setup Repository
```bash
# Update local packages
sudo apt-get update

# Install certificates and curl
sudo apt-get install -y ca-certificates curl gnupg

# Add Docker's official GPG security key
sudo install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
sudo chmod a+r /etc/apt/keyrings/docker.gpg

# Add the repository to Apt sources
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
  $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | \
  sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
```

#### Step 2: Install Docker Engine & Compose Plugin
```bash
sudo apt-get update
sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
```

#### Step 3: Run Docker as a Non-Root User (Crucial!)
By default, the Docker daemon binds to a Unix socket owned by `root`. To avoid using `sudo` for every docker command:
```bash
# Create the docker system group (if not already created)
sudo groupadd docker

# Add your current user to the docker group
sudo usermod -aG docker $USER

# Apply the new group membership (or log out and log back in)
newgrp docker

# Test installation
docker run hello-world
```

---

### 🪟 2. Windows Setup (WSL 2)
Windows relies on **Windows Subsystem for Linux (WSL 2)** to run Linux containers.

#### Step 1: Install WSL 2
Open **PowerShell** or **Command Prompt** as Administrator and run:
```powershell
wsl --install
```
*Note: Restart your computer after the command completes.*

#### Step 2: Install Docker Desktop
1. Download the installer from the [Docker Desktop Windows Page](https://www.docker.com/products/docker-desktop/).
2. Run the installer and check **"Use WSL 2 instead of Hyper-V"** (recommended).
3. Follow the wizard, reboot if prompted, and launch Docker Desktop.
4. Open **Settings** (gear icon) -> **Resources** -> **WSL Integration**.
5. Enable integration for your installed Linux distribution (e.g., Ubuntu).

> [!WARNING]
> **Windows Line Ending Gotcha (CRLF vs LF)**:
> Windows uses `\r\n` (CRLF) for newlines, while Linux uses `\n` (LF). When editing files in Windows, shell scripts or backend entry points can get corrupted with CRLF characters.
> **Fix**: Configure Git on Windows to keep LF endings:
> ```bash
> git config --global core.autocrlf input
> ```

---

## 🧩 Section 3: Core Docker Concepts Deep-Dive

---

### 1. What is a Docker Image? (The Blueprint)
A **Docker Image** is a read-only, read-only template containing the source code, libraries, dependencies, tools, and other files needed for an application to run. 

#### A. Layered Architecture (UnionFS)
Docker images are constructed using a series of read-only layers. Each layer represents a instruction (like `RUN` or `COPY`) in the `Dockerfile`.
* When you modify a file in your project and rebuild, Docker only rebuilds the modified layer and subsequent layers. This is called **Build Caching**.
* Layers are stacked on top of each other. The Union File System (UnionFS) combines these layers into a single, unified view, making them appear as a normal filesystem.

#### B. Base vs. Parent Images
* **Base Image**: An image that has no parent layer (e.g., `FROM scratch` or basic OS images like `alpine`).
* **Parent Image**: An image that your image is built upon (e.g., `FROM python:3.11-slim` or `FROM node:20-alpine`).

---

### 2. What is a Docker Container? (The Process)
A **Docker Container** is a runtime instance of a Docker Image. If an image is a **Class** in Object-Oriented Programming, a container is an **Object** (an active instance).

#### A. The Writeable Layer
When you start a container from an image, Docker adds a thin, writeable layer (the **Container Layer**) on top of the stack of read-only image layers.
* Any changes made to the running container—such as writing new files, modifying existing files, or deleting files—are written *only* to this writeable layer.
* If the container is deleted, this writeable layer is destroyed, and the data is lost (unless persisted via **Volumes**). The underlying image remains completely unchanged.

#### B. Isolation & Process-Only Nature
A container is not a full operating system; it is just a isolated process running on the host machine. It thinks it is a separate OS because of Linux namespaces (which isolate networks, PIDs, and filesystems), but it is governed by the host kernel.

#### C. Container Lifecycle States
1. **Created**: The container has been initialized from an image but hasn't started yet.
2. **Running**: The container process is actively executing on the host.
3. **Paused**: The processes inside the container have been temporarily suspended using CPU limits.
4. **Stopped**: The main process has exited (either gracefully with code `0` or via SIGTERM/SIGKILL).
5. **Exited**: The container is dead and no longer using memory, but its configuration and writeable layer still occupy disk space until removed (`docker rm`).

---

### 3. How to Write a Dockerfile (Step-by-Step)
A `Dockerfile` is a text document containing all the commands a user could call on the command line to assemble an image.

#### A. Core Instructions Breakdown

| Instruction | What it does | Purpose | Example |
| :--- | :--- | :--- | :--- |
| `FROM` | Defines the parent image. | Sets the base operating system & runtime environment. Must be the first instruction. | `FROM python:3.11-slim` |
| `WORKDIR` | Sets the active directory inside the container. | All subsequent commands (`RUN`, `COPY`, `CMD`) execute here. | `WORKDIR /app` |
| `COPY` | Copies files from the host machine to the container. | Brings source code, package files, and dependencies inside the image. | `COPY requirements.txt .` |
| `ADD` | Similar to COPY, but can extract tar files or download URLs. | **Best practice**: Use `COPY` instead unless you need URL downloads or archive auto-extraction. | `ADD archive.tar.gz /app` |
| `RUN` | Executes terminal commands *during the build process*. | Installs packages, builds code, or compiles drivers. Creates a new image layer. | `RUN pip install -r reqs.txt` |
| `ENV` | Sets persistent environment variables. | Configures system behavior or application variables. | `ENV PYTHONUNBUFFERED=1` |
| `ARG` | Defines build-time variables. | Injected during build using `--build-arg`, not available when running. | `ARG VITE_API_URL` |
| `EXPOSE` | Documents the runtime network port. | Tells users (and tools like Elastic Beanstalk) which port the container listens on. | `EXPOSE 8000` |
| `VOLUME` | Creates a mount point for data persistence. | Tells Docker to map a folder to a host volume to prevent data loss. | `VOLUME ["/data"]` |
| `CMD` | Defines the default command to execute *when starting* the container. | Starts the application. Can be overridden by CLI arguments. | `CMD ["python", "app.py"]` |
| `ENTRYPOINT` | Defines the main executable of the container. | Standardizes what the container runs. Arguments are appended to it. | `ENTRYPOINT ["uvicorn"]` |

#### B. The Difference Between CMD and ENTRYPOINT
* **`CMD`**: Specifies default arguments for a container. It can be easily overridden. If you run `docker run myimage bash`, the `bash` shell completely replaces whatever was in the `CMD`.
* **`ENTRYPOINT`**: Defines a command that cannot be overridden by CLI run parameters. CLI arguments are instead appended as parameters.
* **Combined Pattern**: Use `ENTRYPOINT` to define the binary (e.g., `["python"]`) and `CMD` to define the default file (e.g., `["main.py"]`). Running `docker run myimage script.py` overrides only the file parameter.

#### C. Rule of Thumb for Dockerfile Caching
Docker builds files line-by-line from top to bottom. If it detects that a line (and the files it touches) has not changed, it uses the cached layer. If it detects a change, it invalidates the cache for that line **and all lines below it**.
* **Bad Practice**: Copying all source code before installing packages:
  ```dockerfile
  COPY . .
  RUN pip install -r requirements.txt # Triggers reinstall on ANY minor code edit!
  ```
* **Good Practice**: Copy package manifests, install them, then copy the rest of the code:
  ```dockerfile
  COPY requirements.txt .
  RUN pip install -r requirements.txt # Only runs if requirements.txt changes
  COPY . .                            # Copies code (fast layer)
  ```

---

### 4. Pros & Cons of Docker

Before moving to the hands-on sections, here is a balanced comparison of the benefits and limitations of utilizing containerization.

#### 🟢 Pros (Advantages)
1. **Consistency ("Works on My Machine" Elimination)**: Docker guarantees that an application runs identically in development, testing, staging, and production environments.
2. **Resource Efficiency**: Since containers share the host OS kernel instead of running a guest OS hypervisor, they consume drastically less memory and CPU than virtual machines.
3. **Rapid Deployment and Startup**: Containers boot in milliseconds since they do not need to load a full OS kernel.
4. **Microservice Architecture Alignment**: Easily split monolithic applications into separate, isolated services (e.g., frontend, backend, caching layers, DBs) communicating over private virtual networks.
5. **Infrastructure as Code**: Dockerfiles and Docker Compose files are text-based, meaning they can be version-controlled in Git alongside application source code.

#### 🔴 Cons (Disadvantages)
1. **Learning Curve**: Requires understanding concepts like virtual networking, mount points, volume storage, multi-stage builds, and process isolation.
2. **Shared Kernel Security Vulnerabilities**: Because containers share the host kernel, if a container compromises the kernel (kernel panic, root privilege escalation), the host and other containers could also be affected.
3. **Native OS Limitations**: You cannot run native Windows binaries inside a Linux container, or vice-versa. Running Windows containers requires a Windows host; running Linux containers on macOS/Windows requires a lightweight VM layer (like WSL 2 or hyperkit).
4. **Storage Overhead**: Cached layers, intermediate build caches, and unused dangling images can quickly accumulate and consume gigabytes of disk space on the host machine.
5. **Data Persistence Complexity**: Because container filesystems are ephemeral, developers must explicitly configure volumes, bindings, or cloud storage (like S3) to prevent data loss.

---

---

## 🛠️ Section 4: Hands-On Focus — Dockerizing a Full-Stack App

We will walk through the Docker configurations for a stack consisting of:
* **Backend**: FastAPI (Python)
* **Frontend**: React (Vite + TypeScript)
* **Database**: PostgreSQL

---

### 1. Backend Dockerfile (`backend/Dockerfile`)
Here is the production-ready [backend/Dockerfile](file:///home/sriram/Sriram_repos/fastapiapp/backend/Dockerfile):

```dockerfile
# 1. Base Image selection: slim version for reduced footprint
FROM python:3.11-slim

# 2. Environment Variables:
# PYTHONDONTWRITEBYTECODE=1 prevents Python from writing .pyc files to disk
# PYTHONUNBUFFERED=1 ensures application logs are printed immediately to stdout
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# 3. Set Working Directory inside the container filesystem
WORKDIR /app

# 4. Install build dependencies required for PostgreSQL (libpq-dev) and compiling packages
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# 5. Dependency Caching: Copy requirements first and install them
COPY requirements.txt .
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# 6. Copy the rest of the application files
COPY . .

# 7. Document the container runtime port
EXPOSE 8000

# 8. Start the FastAPI server using Uvicorn
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

---

### 2. Frontend Dockerfile (`frontend/talentspark/Dockerfile`)
For React apps, we use a **Multi-Stage Build**. This allows us to compile the static JS/CSS assets using Node.js and then discard the heavy Node build environment, copying only the compiled static assets into a lightweight **Nginx web server** to serve them.

Here is the [frontend/talentspark/Dockerfile](file:///home/sriram/Sriram_repos/fastapiapp/frontend/talentspark/Dockerfile):

```dockerfile
# ==========================================
# STAGE 1: Build React App using Node.js
# ==========================================
FROM node:20-alpine AS build

WORKDIR /app

# Copy package descriptors first to cache npm dependencies installation
COPY package.json package-lock.json ./
RUN npm ci

# Copy React codebase
COPY . .

# Declare Build Arguments (Injected at build time, e.g. from docker-compose or CI/CD)
ARG VITE_API_URL
ENV VITE_API_URL=${VITE_API_URL}

# Compile TypeScript and build static assets into the '/app/dist' folder
RUN npm run build

# ==========================================
# STAGE 2: Serve compiled static files with Nginx
# ==========================================
FROM nginx:alpine

# Copy the compiled production assets from the 'build' stage to Nginx web root
COPY --from=build /app/dist /usr/share/nginx/html

# Overwrite Nginx default configuration to handle client-side routing (Vite Router / SPA)
RUN echo 'server { \
    listen 80; \
    location / { \
        root /usr/share/nginx/html; \
        index index.html index.htm; \
        try_files $uri $uri/ /index.html; \
    } \
}' > /etc/nginx/conf.d/default.conf

EXPOSE 80

# Run Nginx in the foreground to keep the container active
CMD ["nginx", "-g", "daemon off;"]
```

---

### 3. Local Orchestration with `docker-compose.yml`
Docker Compose maps out how our backend, frontend, and PostgreSQL container network together.

Here is the root [docker-compose.yml](file:///home/sriram/Sriram_repos/fastapiapp/docker-compose.yml):

```yaml
version: '3.8'

services:
  # Database Service
  db:
    image: postgres:15-alpine
    container_name: fastapiapp-db
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: password
      POSTGRES_DB: student_db
    ports:
      - "5433:5432"  # Maps host port 5433 to container port 5432 (avoids conflict if host already has postgres)
    volumes:
      - postgres_data:/var/lib/postgresql/data  # Persists database files on local host
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres -d student_db"]
      interval: 5s
      timeout: 5s
      retries: 5

  # FastAPI Backend Service
  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    container_name: fastapiapp-backend
    environment:
      - DATABASE_URL=postgresql+asyncpg://postgres:password@db:5432/student_db  # Note: Hostname is 'db', matching service name
      - SECRET_KEY=my_secret_key
      - ALGORITHM=HS256
      - OLLAMA_HOST=host.docker.internal:11434
    ports:
      - "8000:8000"
    depends_on:
      db:
        condition: service_healthy  # Backend starts ONLY when PostgreSQL is ready to receive connections
    extra_hosts:
      - "host.docker.internal:host-gateway"  # Allows backend to reach services running on the host system (like local Ollama)

  # React Frontend Service
  frontend:
    build:
      context: ./frontend/talentspark
      dockerfile: Dockerfile
      args:
        - VITE_API_URL=http://localhost:8000  # Injected build argument (tells React where the backend API resides)
    container_name: talentspark-frontend
    ports:
      - "3000:80"  # Maps host port 3000 to Nginx port 80
    depends_on:
      - backend

volumes:
  postgres_data:  # Declares volume to persist data across container life cycles
```

---

## ☁️ Section 5: Deploying to AWS Elastic Beanstalk

AWS Elastic Beanstalk is a Platform-as-a-Service (PaaS) that handles resource provisioning, load balancing, auto-scaling, and health monitoring.

```
                  ┌──────────────────────────────────────────────┐
                  │                 AWS ROUTE 53                 │
                  └──────────────────────┬───────────────────────┘
                                         │
                                         ▼
                  ┌──────────────────────────────────────────────┐
                  │          APPLICATION LOAD BALANCER           │
                  └──────────────────────┬───────────────────────┘
                                         │
                    Routes port 80 traffic to EC2 target group
                                         │
                                         ▼
            ┌──────────────────────────────────────────────────────────┐
            │                 AWS EC2 INSTANCE (T3.MICRO)              │
            │                                                          │
            │   ┌──────────────────────────────────────────────────┐   │
            │   │               Docker Daemon Engine               │   │
            │   │                                                  │   │
            │   │  ┌──────────────────┐      ┌──────────────────┐  │   │
            │   │  │    Backend       │      │    Frontend      │  │   │
            │   │  │  (FastAPI:8000)  │      │   (Nginx:80)     │  │   │
            │   └─────────┬────────┘      └──────────────────┘  │   │
            │   └────────────┼─────────────────────────────────────┘   │
            └────────────────┼─────────────────────────────────────────┘
                             │
                             │ Connects via IAM & SSL
                             ▼
            ┌─────────────────────────────────┐
            │          AWS RDS (Postgres)     │
            │   • DB persistence              │
            └─────────────────────────────────┘
```

### 1. Database Architecture in Production
> [!IMPORTANT]
> **DO NOT** host your database inside a container on the same server in production. Containers are ephemeral; if the server restarts or scales out, your database files will be wiped out or out of sync.
> **Solution**: Use **AWS RDS (Relational Database Service)** or a managed Postgres provider like **Supabase**.

---

### 2. Environment Variables & Secrets Management
Do not push your `.env` secrets file or write hardcoded passwords in your Dockerfiles. AWS Elastic Beanstalk allows secure environment property configuration:

1. Under **Elastic Beanstalk Console**, go to **Environments** -> Select your environment.
2. Navigate to **Configuration** on the left menu -> Find **Updates, monitoring, and logging** (or **Software**) -> Click **Edit**.
3. Under **Environment properties**, add the following keys and values:
   * `DATABASE_URL` (Pointing to AWS RDS or Supabase)
   * `SECRET_KEY` (Your JWT private sign key)
   * `AWS_ACCESS_KEY_ID` & `AWS_SECRET_ACCESS_KEY`
   * `AWS_STORAGE_BUCKET_NAME`
4. Click **Apply**. Elastic Beanstalk securely injects these environment properties into your container shell at startup.

---

### 3. File Storage Setup: Amazon S3
Since Docker container storage is wiped clean during code updates or system crashes, you must save files (like student resumes) externally in **Amazon S3 (Simple Storage Service)**.

#### Step 1: Create an S3 Bucket
1. Open the **Amazon S3 Console** and click **Create bucket**.
2. Give it a unique name (e.g., `student-resumes-bucket-2026`).
3. Keep **Block all public access** checked for security.

#### Step 2: Configure IAM User
1. Open the **AWS IAM Console** -> Click **Users** -> **Create user**.
2. Attach the policy: `AmazonS3FullAccess` (or write a custom policy restricted to your bucket).
3. Complete creation, click on the user -> **Security credentials** -> **Create access key**.
4. Save the **Access Key ID** and **Secret Access Key**.

#### Step 3: Implement S3 in FastAPI (`backend/app/utils/s3_storage.py`)
```python
import os
import boto3
from botocore.exceptions import NoCredentialsError

class S3Storage:
    def __init__(self):
        # Read from injected environment variables
        self.s3 = boto3.client(
            's3',
            aws_access_key_id=os.getenv('AWS_ACCESS_KEY_ID'),
            aws_secret_access_key=os.getenv('AWS_SECRET_ACCESS_KEY'),
            region_name=os.getenv('AWS_REGION', 'us-east-1')
        )
        self.bucket_name = os.getenv('AWS_STORAGE_BUCKET_NAME')

    def upload_file(self, file_obj, object_name: str) -> str:
        """Uploads a file to the S3 bucket and returns its public URL"""
        try:
            self.s3.upload_fileobj(file_obj, self.bucket_name, object_name)
            return f"https://{self.bucket_name}.s3.amazonaws.com/{object_name}"
        except NoCredentialsError:
            raise Exception("AWS credentials not found or invalid.")
        except Exception as e:
            raise Exception(f"S3 Upload failed: {str(e)}")
```

---

### 4. Deploying Live to Elastic Beanstalk
Elastic Beanstalk platforms running on Amazon Linux 2023 support direct deployment of Docker-Compose configuration files.

#### Step 1: Create Production Compose File (`docker-compose-prod.yml`)
Create this file in the root of your project:
```yaml
version: '3.8'

services:
  backend:
    image: <your-dockerhub-username>/fastapiapp-backend:latest
    ports:
      - "80:8000"  # Expose backend on port 80 to the Internet
    environment:
      - DATABASE_URL=${DATABASE_URL}
      - SECRET_KEY=${SECRET_KEY}
      - ALGORITHM=${ALGORITHM}
      - QDRANT_URL=${QDRANT_URL}
      - QDRANT_API_KEY=${QDRANT_API_KEY}
      - GROQ_API_KEY=${GROQ_API_KEY}
      - AWS_ACCESS_KEY_ID=${AWS_ACCESS_KEY_ID}
      - AWS_SECRET_ACCESS_KEY=${AWS_SECRET_ACCESS_KEY}
      - AWS_STORAGE_BUCKET_NAME=${AWS_STORAGE_BUCKET_NAME}

  frontend:
    image: <your-dockerhub-username>/talentspark-frontend:latest
    ports:
      - "8080:80"  # Expose frontend on port 8080 (or vice-versa depending on routing requirements)
```

#### Step 2: Build & Push Images to Docker Hub
```bash
# Log in to Docker Hub via CLI
docker login

# Build backend and frontend images
docker build -t <your-dockerhub-username>/fastapiapp-backend:latest ./backend
docker build -t <your-dockerhub-username>/talentspark-frontend:latest --build-arg VITE_API_URL=http://<your-beanstalk-url>.elasticbeanstalk.com ./frontend/talentspark

# Push the images
docker push <your-dockerhub-username>/fastapiapp-backend:latest
docker push <your-dockerhub-username>/talentspark-frontend:latest
```

#### Step 3: Deploy to Elastic Beanstalk Console
1. Search for **Elastic Beanstalk** in the AWS console and click **Create Application**.
2. Set Environment Tier: **Web server environment**.
3. Choose **Docker** as the platform, running on **64bit Amazon Linux 2023**.
4. In **Application Code**, select **Upload your code** and upload your `docker-compose-prod.yml` file.
5. In the **Configure more options** step:
   * Select **Single instance** (free tier).
   * Fill in your secret Environment properties.
6. Click **Submit**. In a few minutes, you will receive a live public URL (e.g. `http://talentspark-env.elasticbeanstalk.com`) where your full-stack app is operational!
# AWS Elastic Beanstalk & Free Hosting Deployment Guide 🚀

This guide explains how to take your Docker-configured application and deploy it live to the internet. We will focus on **AWS Free Tier** deployment first, and then list **100% free hosting alternatives** (like Render, Supabase, and Qdrant Cloud) so you don't spend a single cent.

---

## AWS Free Tier Overview — How to Stay Free 💸

AWS offers a **12-Month Free Tier** for new accounts. To ensure your deployment remains completely free, make sure you select the exact resources below:

| AWS Service | Free Tier Limit (Monthly) | Deployment Usage |
| :--- | :--- | :--- |
| **Elastic Beanstalk / EC2** | 750 hours of `t2.micro` or `t3.micro` instances | Runs your FastAPI backend + React frontend container. |
| **Amazon RDS** | 750 hours of `db.t3.micro` (PostgreSQL) | Runs your relational database (instead of containerized DB). |
| **Amazon S3** | 5 GB of standard storage | Used to store resume files or static attachments. |
| **Application Load Balancer** | 15 LCUs (Load Balancer capacity units) | Routes traffic to your instances (optional, DNS is free). |

---

## Step 1: AWS RDS (PostgreSQL) Free Setup

For a live app, you shouldn't run PostgreSQL in a Docker container on the same server, because if the server restarts, your data is lost. Instead, use AWS RDS:

1. Sign in to your [AWS Management Console](https://aws.amazon.com/).
2. Search for **RDS** and click **Create Database**.
3. Choose **Standard create** → **PostgreSQL**.
4. Under **Templates**, select **Free Tier** (this restricts your instance type to `db.t3.micro` or `db.t2.micro` and disables expensive features).
5. Set your DB instance identifier (e.g., `talentspark-db`), Master username (e.g., `postgres`), and Master password.
6. Under **Connectivity**, enable **Public Access** (if you want to test from your local computer; disable it in production for security).
7. Create the database. Once available, copy the **Endpoint** URL.
8. Your new database connection URL will look like:
   `postgresql://postgres:your_password@your-endpoint.amazonaws.com:5432/postgres`

---

## Step 2: Preparing Docker for AWS Elastic Beanstalk

AWS Elastic Beanstalk supports **Docker Compose** deployments directly. You can upload a zip file containing your configuration, and Beanstalk will run the containers on your EC2 instance.

For AWS Elastic Beanstalk, we modify the compose file slightly to remove the local `db` service (since we are using AWS RDS) and configure public routing.

### Create `docker-compose-prod.yml` in your project root:

Create a file named `docker-compose-prod.yml` containing:
```yaml
version: '3.8'

services:
  backend:
    image: <your-dockerhub-username>/fastapiapp-backend:latest
    ports:
      - "80:8000"
    environment:
      - DATABASE_URL=${DATABASE_URL}
      - SECRET_KEY=${SECRET_KEY}
      - ALGORITHM=${ALGORITHM}
      - QDRANT_URL=${QDRANT_URL}
      - QDRANT_API_KEY=${QDRANT_API_KEY}
      - OPENAI_API_KEY=${OPENAI_API_KEY}
      - GEMINIAPIKEY=${GEMINIAPIKEY}
      - GROQ_API_KEY=${GROQ_API_KEY}

  frontend:
    image: <your-dockerhub-username>/talentspark-frontend:latest
    ports:
      - "8080:80"
```

> [!TIP]
> **Why use Docker Hub?** 
> Elastic Beanstalk needs to pull your container images from a registry. You can create a free account at [Docker Hub](https://hub.docker.com/) and push your built images there before deploying.

### Push your images to Docker Hub:
```bash
# Log in to Docker Hub
docker login

# Build production backend image
docker build -t <your-dockerhub-username>/fastapiapp-backend:latest ./backend

# Build production frontend image (replace API URL with your AWS environment URL)
docker build -t <your-dockerhub-username>/talentspark-frontend:latest \
  --build-arg VITE_API_URL=http://your-beanstalk-env.elasticbeanstalk.com ./frontend/talentspark

# Push to registry
docker push <your-dockerhub-username>/fastapiapp-backend:latest
docker push <your-dockerhub-username>/talentspark-frontend:latest
```

---

## Step 3: Deploying to AWS Elastic Beanstalk

1. Open the **Elastic Beanstalk Console**.
2. Click **Create Application**.
3. Choose **Web server environment**.
4. Set application name: `talentspark`.
5. Under **Platform**, select:
   - **Platform**: **Docker**
   - **Platform branch**: **Docker running on 64bit Amazon Linux 2023**
6. Under **Application code**, select **Upload your code** and upload your `docker-compose-prod.yml` file.
7. Click **Configure more options**.
   - Under **Software > Environment properties**, enter your secrets and configuration variables:
     - `DATABASE_URL` = `postgresql+asyncpg://postgres:password@rds-endpoint:5432/dbname`
     - `SECRET_KEY` = `your_secret_key`
     - `QDRANT_URL` = `your_qdrant_cloud_url`
     - `QDRANT_API_KEY` = `your_qdrant_api_key`
     - `GROQ_API_KEY` = `your_groq_api_key`
8. Click **Create app**. AWS will spin up a `t3.micro` EC2 instance, install Docker, pull your Docker Hub images, configure security groups, and serve your app.

---

## Step 4: S3 Bucket Setup for File Storage (Resumes)

If users upload resumes, you must store them in an S3 bucket (local files in a container disappear when the container restarts).

1. Search for **S3** in the AWS Console and click **Create bucket**.
2. Set a globally unique name: `talentspark-resumes-bucket`.
3. Keep **Block all public access** checked (safer).
4. Update your backend code to upload files using `boto3` instead of saving to local paths.
5. In AWS, create an IAM user with `AmazonS3FullAccess` permission, generate an access key, and pass it to your backend containers:
   - `AWS_ACCESS_KEY_ID`
   - `AWS_SECRET_ACCESS_KEY`
   - `AWS_S3_BUCKET_NAME` = `talentspark-resumes-bucket`

---

## 100% Free Deployment Alternatives (No Card Charges) 🌟

If you want to deploy without entering a credit card or risk running into AWS bills, you can use these **free hosting platforms**:

### 1. Database: Supabase (Free Tier)
- **Status**: **Free forever** for 2 projects.
- **What it gives**: Full PostgreSQL database hosted in AWS ap-south-1.
- **Your configuration**: You are already using this in your local `.env`!
  `DATABASE_URL="postgres://postgres.youruser:yourpassword@aws-1-ap-south-1.pooler.supabase.com:6543"`
  *(Remember to change the schema to `postgresql+asyncpg://` in your application variables).*

### 2. Vector DB: Qdrant Cloud (Free Tier)
- **Status**: **Free forever** (no credit card needed).
- **What it gives**: 1 cluster, 1GB RAM, 4GB Storage, 20k vectors.
- **Your configuration**: You are already using this!
  - `QDRANT_URL` = `https://your-cluster-id.aws.cloud.qdrant.io`
  - `QDRANT_API_KEY` = `your-api-key`

### 3. Backend: Render (Free Web Service)
- **Status**: **Free tier** available.
- **What to do**:
  1. Create a free account at [Render](https://render.com/).
  2. Click **New +** → **Web Service**.
  3. Connect your GitHub repository.
  4. Select **Docker** as the runtime.
  5. Specify the Dockerfile path: `backend/Dockerfile`.
  6. Add your Environment variables (like `DATABASE_URL`, `GROQ_API_KEY`, etc.) in the dashboard.
  7. Render will build and deploy your backend container. It will give you a public URL (e.g., `https://talentspark-backend.onrender.com`).
  *Note: Free instances spin down after 15 minutes of inactivity, causing a 50-second delay on the first request.*

### 4. Frontend: Render / Vercel (Free Static Site)
- **Status**: **Free forever** with unlimited bandwidth.
- **What to do (using Render)**:
  1. Click **New +** → **Static Site**.
  2. Connect your GitHub repository.
  3. Set build command: `npm run build` (make sure to specify working directory `frontend/talentspark` in settings).
  4. Set publish directory: `dist`.
  5. Add Environment Variable: `VITE_API_URL` set to your live Render backend URL (`https://talentspark-backend.onrender.com`).
  6. Click deploy. It will give you a public URL (e.g., `https://talentspark.onrender.com`).
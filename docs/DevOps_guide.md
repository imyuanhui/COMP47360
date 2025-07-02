## Install Docker and Docker Compose

Before setting up the environment, you need to install **Docker** and **Docker Compose**. Here are the installation instructions for both:

### **Step 1: Install Docker**

1. Go to the official Docker website: [Docker Download](https://www.docker.com/get-started)
2. Choose your operating system (Windows, macOS, or Linux) and follow the installation instructions.
3. After installation, verify the Docker installation by running this command in your terminal:

   ```bash
   docker --version
   ```

   This should print the version of Docker installed on your machine.

### **Step 2: Install Docker Compose**

Docker Compose is a tool that helps in defining and running multi-container Docker applications. Follow these steps to install it:

1. **For macOS and Linux**: Docker Compose comes pre-installed with Docker Desktop.
2. **For Windows**: Docker Compose is also bundled with Docker Desktop for Windows.

After installation, verify Docker Compose installation by running:

```bash
docker-compose --version
```

This should print the version of Docker Compose.

---

## Local Development - Frontend locally + Backend in Docker

This setup allows you to run the backend, database, and ML service in Docker containers, while keeping the frontend running locally with full hot-reload support.

#### **Step 0: build docker images**

You only need to do this the **first time** However, if you change backend code or rebuild containers, remember to rerun this command:

```bash
cd COMP47360
docker-compose -f docker/docker-compose.dev.yml up -d --build
```

This rebuilds the backend, database, and ML service images.

#### **Step 1: Start Backend, Database, and ML Service (Docker)**

```bash
cd COMP47360
docker-compose -f docker/docker-compose.dev.yml up -d
```

This command starts:

- PostgreSQL database
- Backend Spring Boot service
- Flask ML service

#### **Step 2: Run Frontend Locally**

```bash
cd frontend/apps/web
npm install
npm run dev
```

The frontend will run locally (usually on port `5173`) with hot-reload.

In your frontend API requests, make sure to use the following addresses:

```
http://localhost:8080/api/...   # Backend API
http://localhost:5000/...       # Flask ML service (if needed)
```

This allows your locally running frontend to communicate with the backend and ML services running inside Docker.

#### **Step 3: stop the containers**

```
docker-compose -f docker-compose.dev.yml down
```

---

## Local Deployment - all in Docker(Frontend, Backend, Database, ML service all containerized)

This setup allows you to run the entire system — frontend, backend, database, and ML service — fully inside Docker containers for local deployment or production-like testing.

#### **Step 1: Build Docker Images (Recommended First Time or After Code Changes)**

```bash
docker-compose -f docker/docker-compose.yml build --no-cache
docker-compose -f docker/docker-compose.yml up -d
```

This will:

- Build and start the PostgreSQL database
- Build and start the backend Spring Boot service
- Build and start the Flask ML service
- Build the frontend, package it with Nginx, and serve it on port `80`

#### **Step 2: Start Services (If Already Built)**

If the images are already built and you just want to start the containers:

```bash
docker-compose -f docker/docker-compose.yml up -d
```

#### **Access Information**

- **Frontend (Web App)**: [http://localhost:80](http://localhost:80) — accessible from your host machine
- **Backend API**: Accessible only within Docker containers at `http://backend:8080`
- **ML Service**: Accessible only within Docker containers at `http://flask-ml:5000`

⚠️ The backend and ML service ports are **not exposed to the host machine**, meaning you cannot directly access `http://localhost:8080` or `http://localhost:5000` from your browser or Postman. These services can only be accessed by other containers within the same Docker network using the container names as hostnames.

---

## Remote Server Deployment - all in Docker(environment variables,api key, ports, HTTPS)

- to be continued

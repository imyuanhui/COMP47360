# 🚧 SmartTrip NYC – Development Branch

This is the **main development branch** for SmartTrip NYC.

All new features, bug fixes, styling updates, and experimental changes should be made in branches derived from `dev`, and merged back via Pull Requests.

---

## 📚 Documentation

The full project documentation, including features, architecture, tech stack, deployment, and contributors is maintained in the `master` branch.

👉 **View the production README here**:  
[📖 master/README.md](https://github.com/imyuanhui/COMP47360/blob/master/README.md)

---

## 📦 Development Workflow

Follow the standard Git flow:

```bash
# Start from latest dev
git checkout dev
git pull origin dev

# Create your working branch
git checkout -b feature/your-feature-name

# After changes
git add .
git commit -m "feat: add new itinerary filter"
git push origin feature/your-feature-name
```

---

## 🧪 Local Development Setup

You can run the full project locally in two ways:

### Option 1: Run all services via docker (recommended)

- Modify `docker/.env-example` to include your API keys and rename it to `.env`.
- Modify `frontend/apps/web/.env-example` to include your google map api and rename it to `.env`.

#### 1. Clone the Repository

```bash
git clone https://github.com/imyuanhui/COMP47360.git
cd COMP47360
git checkout dev
```

#### 2. Start All Services

```bash
docker-compose -f docker/docker-compose.dev.yml up -d --build
```

This will spin up:

- Spring Boot backend
- Flask ML API (Python)
- PostgreSQL database
- Pre-configured volumes and networks

#### 3. Frontend Development

```bash
cd frontend/apps/web
npm install
npm run dev
```

Once running, the frontend will be available at:
http://localhost:5173

#### 4. Initialize Database (Docker)

After PostgreSQL starts in the container,import initial data using:

```bash
# copy the data file to the postgreSQL container
cd backend/database_intialization
docker cp zones.csv smarttrip-postgres:/tmp/zones.csv
docker cp places.csv smarttrip-postgres:/tmp/places.csv
```

Then enter the container and run import commands:

```bash
docker exec -it smarttrip-postgres psql -U postgres -d smart-trip
```

Inside the psql shell:

```bash
# insert the data
copy zones(zone_id, central_lat, central_lon, zone_name)
FROM '/tmp/zones.csv'
DELIMITER ','
CSV HEADER;

copy places(place_id, category,estimated_duration, lat, lon, place_name, zone_id )
FROM '/tmp/places.csv'
DELIMITER ','
CSV HEADER;
```

⚠️ Ensure the tables zones and places already exist. These commands only insert data, table schemas should be created by your Spring Boot backend.

### Option 2: Manual Run (Spring Boot + Flask + Frontend separately)

- Modify `backend/smarttrip/.env-example` with your API keys and rename it to `.env`.
- Modify `frontend/apps/web/.env-example` to include your google map api and rename it to `.env`.

#### 1. Run Flask ML API

```bash
cd backend/flask-model-api
conda activate your-env
python app.py
```

Service will be available at:
http://localhost:5000

#### 2. Run Spring Boot Backend

```bash
cd backend/smarttrip
./gradlew bootRun
```

Runs at:
http://localhost:8080

Ensure your `application.properties` or `.env` correctly point to the springboot service.

#### 3. Run React Frontend

```bash
cd frontend/apps/web
npm install
npm run dev
```

Frontend will run at:
http://localhost:5173

#### 4. Initialize Database(Manual)

Connect to PostgreSQL and run:

```bash
psql -U postgres -d smart-trip
```

Then inside the psql shell，run the following to insert initial data into the existing tables:

```sql
\copy zones(zone_id, central_lat, central_lon, zone_name) FROM 'backend/database_initialization/zones.csv' DELIMITER ',' CSV HEADER;

\copy places(place_id, category,estimated_duration, lat, lon, place_name, zone_id) FROM 'backend/database_initialization/places.csv' DELIMITER ',' CSV HEADER;

```

Ensure the tables `zones` and `places` already exist (created by your Java backend).
Also make sure the CSV file paths are accessible from your current terminal and match the column structure exactly.

#### ⚠️ Configuration Notes

When running services separately, make sure they talk to each other through correct localhost ports.

Example Spring Boot `.env` setting:

```env
ML_SERVICE_URL=http://127.0.0.1:5000
```

If you previously used Docker hostnames like http://flask-ml:5000, replace them with http://127.0.0.1:5000 when running services manually.

---

## Developer Notes

- Do not commit directly to `dev` or `master`
- All changes must go through pull requests with review
- Keep commits small, meaningful, and well-named
- Never commit API keys or secrets

Thanks for contributing to SmartTrip NYC!
We’re building something smart — together 🗽✨

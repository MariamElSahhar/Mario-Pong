# Usage
## Running on Docker
1. Run `make docker-up` in root
2. Access backend on `http://localhost:8000/`
3. Access frontend on `https://localhost:80/`
### Accessing Via Network
- The IP address of your machine is also printed by the backend container.
- Other devices on the same network can access the website through your IP address: `http://<your-ip>:8000/` for the backend and `https://<your-ip>:80/` for the frontend.

## Running Locally
### Frontend
1. Install `http-server` through npm or brew (or some other way)
2. Run `make run-frontend`
3. Access through `http://127.0.0.1:80/`
### Backend and Database
1. Make you activate a Python environment and install the packages in `requirements.txt`
2. Run `make run-db`. This runs the PostgreSQL container and maps the database to ``data/`` in the repository. `data/` is in `.gitignore` and won't be uploaded to Git.
3. Run `make run-backend`
4. Backend API is available through `http://127.0.0.1:8000/`

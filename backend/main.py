import os
from fastapi import FastAPI
from routers import tasks, config, auth, workspaces
from database import create_tables
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()
create_tables()

# Allowed origins come from an env var so the same image/deployment can be
# pointed at different frontends (local dev vs. the Azure Static Web App /
# App Service URL) without a code change. Falls back to the Vite dev
# server so local development keeps working unmodified.
_default_origins = (
    "http://localhost:5173,"
    "http://127.0.0.1:5173,"
    "https://witty-island-07ad2100f.5.azurestaticapps.net"
)

allowed_origins = [
    origin.strip()
    for origin in os.environ.get("CORS_ALLOWED_ORIGINS", _default_origins).split(",")
    if origin.strip()
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def home():
    return {
        "message": "TaskFlow API is running"
    }

app.include_router(auth.router)
app.include_router(workspaces.router)
app.include_router(tasks.router)
app.include_router(config.router)
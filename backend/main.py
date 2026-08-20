from fastapi import FastAPI
from routers import tasks, config, auth, workspaces
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
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
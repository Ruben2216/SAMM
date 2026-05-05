from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from src.domain import models
from src.infrastructure.database import engine
from src.api import citas_router

from src.application.scheduler import iniciar_scheduler

@asynccontextmanager
async def lifespan(app: FastAPI):
    iniciar_scheduler()
    yield

app = FastAPI(title="Appointments Service", version="1.0.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

models.Base.metadata.create_all(bind=engine)

app.include_router(citas_router.router)

@app.get("/health")
def health_check():
    return {"status": "ok", "service": "appointments-service"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8004)
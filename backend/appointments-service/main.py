from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# 1. Importamos TU código magistral
from src.domain import models
from src.infrastructure.database import engine
from src.api import citas_router

app = FastAPI(title="Appointments Service", version="1.0.0")

# Configurar CORS (Código de Fabiola)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 2. La magia que crea tus tablas en PostgreSQL automáticamente
models.Base.metadata.create_all(bind=engine)

# 3. Le enchufamos tus rutas de citas a la app de Fabiola
app.include_router(citas_router.router)

# El endpoint de salud que dejó Fabiola
@app.get("/health")
def health_check():
    return {"status": "ok", "service": "appointments-service"}

if __name__ == "__main__":
    import uvicorn
    # ¡Cambiado al puerto 8004 como dictó Fabiola!
    uvicorn.run(app, host="0.0.0.0", port=8004)
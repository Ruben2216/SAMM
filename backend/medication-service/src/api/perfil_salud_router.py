from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from src.infrastructure.database import get_db
from src.domain import models, schemas

router = APIRouter(prefix="/perfil-salud", tags=["Perfil de Salud"])


# 1. GET - Obtener perfil de salud de un usuario
@router.get("/usuario/{id_usuario}", response_model=schemas.PerfilSaludResponse)
def obtener_perfil_salud(id_usuario: int, db: Session = Depends(get_db)):
    perfil = db.query(models.PerfilSalud).filter(
        models.PerfilSalud.Id_Usuario == id_usuario
    ).first()

    if not perfil:
        # Retornar un perfil vacío (sin datos) en vez de 404
        return schemas.PerfilSaludResponse(Id_Usuario=id_usuario)

    return perfil


# 2. PUT - Crear o actualizar perfil de salud (upsert)
@router.put("/usuario/{id_usuario}", response_model=schemas.PerfilSaludResponse)
def actualizar_perfil_salud(
    id_usuario: int,
    datos: schemas.PerfilSaludUpdate,
    db: Session = Depends(get_db),
):
    perfil = db.query(models.PerfilSalud).filter(
        models.PerfilSalud.Id_Usuario == id_usuario
    ).first()

    if perfil:
        # Actualizar campos existentes
        perfil.Tipo_Sangre = datos.Tipo_Sangre
        perfil.Alergias = datos.Alergias
        perfil.Peso = datos.Peso
        perfil.Edad = datos.Edad
        perfil.Condicion_Medica = datos.Condicion_Medica
        perfil.Telefono = datos.Telefono
    else:
        # Crear nuevo perfil
        perfil = models.PerfilSalud(
            Id_Usuario=id_usuario,
            Tipo_Sangre=datos.Tipo_Sangre,
            Alergias=datos.Alergias,
            Peso=datos.Peso,
            Edad=datos.Edad,
            Condicion_Medica=datos.Condicion_Medica,
            Telefono=datos.Telefono,
        )
        db.add(perfil)

    db.commit()
    db.refresh(perfil)
    return perfil

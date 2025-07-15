from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from pydantic import BaseModel
from shared.models import Producto as ModeloProducto
from shared.db import get_engine, get_session, init_db
import json
import os

# Base de datos de este nodo
engine = get_engine("nodo1.db")  # Cambiar a nodo2.db en el otro nodo
SessionLocal = get_session(engine)
init_db(engine)

app = FastAPI()

# CORS habilitado para el frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # permitir desde cualquier origen
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Modelo para agregar productos si se desea


class Producto(BaseModel):
    nombre: str
    descripcion: str
    cantidad: int

# Obtener inventario actual


@app.get("/inventario/")
def inventario():
    db: Session = SessionLocal()
    productos = db.query(ModeloProducto).all()
    return [
        {
            "nombre": p.nombre,
            "descripcion": p.descripcion,
            "cantidad": p.cantidad
        }
        for p in productos
    ]

# Hacer pedido


@app.post("/pedido/")
def pedido(nombre: str, cantidad: int, request: Request):
    db: Session = SessionLocal()
    producto = db.query(ModeloProducto).filter_by(nombre=nombre).first()
    if not producto or producto.cantidad < cantidad:
        raise HTTPException(
            status_code=400, detail="Producto no disponible o cantidad insuficiente")
    producto.cantidad -= cantidad
    db.commit()
    return {"status": "entregado", "desde": "nodo_local", "producto": nombre}

# Sincronizar desde archivo JSON


@app.post("/admin/sincronizar")
def sincronizar_inventario():
    db: Session = SessionLocal()
    path = os.path.join(os.path.dirname(__file__), "inventario.json")
    try:
        with open(path, "r", encoding="utf-8") as f:
            productos = json.load(f)

        db.query(ModeloProducto).delete()

        for p in productos:
            nuevo = ModeloProducto(**p)
            db.add(nuevo)

        db.commit()
        return {"message": "Inventario sincronizado con éxito desde el JSON"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Cargar automáticamente inventario al iniciar el servidor


@app.on_event("startup")
def startup():
    sincronizar_inventario()

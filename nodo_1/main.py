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

# Modelo para pedidos


class PedidoRequest(BaseModel):
    producto: str
    cantidad: int
    organizacion: str

# Función para actualizar JSON desde BD


def actualizar_json_desde_bd():
    """Actualiza el archivo JSON con los datos actuales de la BD"""
    db: Session = SessionLocal()
    try:
        productos = db.query(ModeloProducto).all()
        productos_json = [
            {
                "nombre": p.nombre,
                "descripcion": p.descripcion,
                "cantidad": p.cantidad
            }
            for p in productos
        ]

        path = os.path.join(os.path.dirname(__file__), "inventario.json")
        with open(path, "w", encoding="utf-8") as f:
            json.dump(productos_json, f, ensure_ascii=False, indent=4)

        return True
    except Exception as e:
        print(f"Error actualizando JSON: {e}")
        return False
    finally:
        db.close()

# Obtener inventario actual


@app.get("/inventario/")
def inventario():
    db: Session = SessionLocal()
    try:
        productos = db.query(ModeloProducto).all()
        return [
            {
                "nombre": p.nombre,
                "descripcion": p.descripcion,
                "cantidad": p.cantidad
            }
            for p in productos
        ]
    finally:
        db.close()

# Hacer pedido - CORREGIDO


@app.post("/pedido/")
def pedido(pedido_data: PedidoRequest):
    db: Session = SessionLocal()
    try:
        # Buscar el producto
        producto = db.query(ModeloProducto).filter_by(
            nombre=pedido_data.producto).first()

        if not producto:
            raise HTTPException(
                status_code=404,
                detail=f"Producto '{pedido_data.producto}' no encontrado"
            )

        if producto.cantidad < pedido_data.cantidad:
            raise HTTPException(
                status_code=400,
                detail=f"Cantidad insuficiente. Disponible: {producto.cantidad}, Solicitado: {pedido_data.cantidad}"
            )

        # Actualizar cantidad en BD
        producto.cantidad -= pedido_data.cantidad
        db.commit()

        # ¡IMPORTANTE! Actualizar el archivo JSON
        json_actualizado = actualizar_json_desde_bd()

        return {
            "status": "entregado",
            "desde": "nodo_local",
            "producto": pedido_data.producto,
            "cantidad_entregada": pedido_data.cantidad,
            "cantidad_restante": producto.cantidad,
            "json_actualizado": json_actualizado
        }

    except HTTPException:
        db.rollback()
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Error interno: {str(e)}")
    finally:
        db.close()

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
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        db.close()

# Endpoint para forzar actualización del JSON


@app.post("/admin/actualizar-json")
def forzar_actualizacion_json():
    """Endpoint para forzar la actualización del JSON desde la BD"""
    if actualizar_json_desde_bd():
        return {"message": "JSON actualizado exitosamente desde la BD"}
    else:
        raise HTTPException(status_code=500, detail="Error al actualizar JSON")

# Cargar automáticamente inventario al iniciar el servidor


@app.on_event("startup")
def startup():
    sincronizar_inventario()

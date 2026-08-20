import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from ia import consultar_ia

app = FastAPI(
    title="API de Chatbot Web",
    version="1.0.0",
)

# Configuración CORS para permitir conexiones desde tu sitio web
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class MensajeUsuario(BaseModel):
    mensaje: str

@app.post("/api/chat", tags=["Chat"])
def api_chat(datos: MensajeUsuario):
    if not datos.mensaje.strip():
        return {"ok": False, "error": "El mensaje no puede estar vacío."}
    
    try:
        respuesta = consultar_ia(datos.mensaje.strip())
        return {"ok": True, "respuesta": respuesta}
    except Exception as e:
        return {"ok": False, "error": "Error interno al consultar la IA."}
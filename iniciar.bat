@echo off
title Sistema distribuido SD-FINAL
color 0A

echo ========================================
echo ACTIVANDO ENTORNO Y LANZANDO NODOS
echo ========================================

REM Ruta al entorno virtual
set VENV_PATH=venv\Scripts\activate

REM ====================
REM Lanzar NODO 1
REM ====================
start cmd /k "call %VENV_PATH% && uvicorn nodo_1.main:app --reload --port 8000"

REM ====================
REM Lanzar NODO 2
REM ====================
start cmd /k "call %VENV_PATH% && uvicorn nodo_2.main:app --reload --port 8001"

REM ====================
REM Lanzar servidor frontend
REM ====================
start cmd /k "cd frontend && python -m http.server 8080"

REM ====================
REM Abrir navegador
REM ====================
start "" http://localhost:8080/

echo ========================================
echo TODO LANZADO. Puedes cerrar esta ventana.
echo ========================================
pause

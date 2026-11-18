@echo off
REM Semillin Run con servidor local (liga en linea de prueba). Requiere Node.js.
cd /d "%~dp0"
if not exist node_modules (call npm install)
start "" http://localhost:8000/
node server.js

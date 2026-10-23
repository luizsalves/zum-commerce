@echo off
REM Inicia a vitrine e o painel (http://localhost:5173 e http://localhost:5173/admin)
cd /d "%~dp0frontend"
if not exist node_modules (
  echo Instalando dependencias...
  call npm install
)
call npm run dev

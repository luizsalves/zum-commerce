@echo off
REM Inicia a API em C# (http://localhost:8080). Espera o repositorio zum-commerce-api ao lado deste.
set API=%~dp0..\zum-commerce-api\backend\src\Core.Web
if not exist "%API%" (
  echo Nao encontrei %API%
  echo Coloque o repositorio zum-commerce-api na mesma pasta que o zum-commerce.
  pause
  exit /b 1
)
cd /d "%API%"
dotnet run

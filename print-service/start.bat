@echo off
title AVA Coffee Print Service
echo ==================================================
echo AVA COFFEE - K80 THERMAL PRINT SERVER
echo ==================================================
echo checking node_modules folder...

if not exist node_modules (
  echo Folder node_modules not found. Installing dependencies...
  call npm install
)

echo.
echo Starting AVA Coffee Print Server...
node server.js
pause

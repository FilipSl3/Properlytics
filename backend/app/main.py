# backend/main.py
from fastapi import FastAPI

# Inicjalizacja aplikacji FastAPI
app = FastAPI(title="Properlytics API")

# Definicja prostego endpointu 'root'
@app.get("/")
def read_root():
    return {"status": "Backend jest aktywny!"}

# Definicja endpointu testowego
@app.get("/api/v1/status")
def get_api_status():
    return {"message": "API działa poprawnie", "version": "v1"}
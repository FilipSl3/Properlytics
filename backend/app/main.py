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

# mockup

from app.models.house import HouseInput
from app.models.flat import FlatInput
from app.models.plot import PlotInput

@app.post("/predict/house")
def predict_house(data: HouseInput):
    return {"predicted_price": 123456, "type": "house"}

@app.post("/predict/flat")
def predict_flat(data: FlatInput):
    return {"predicted_price": 234567, "type": "flat" }


@app.post("/predict/plot")
def predict_plot(data: PlotInput):
    return {"predicted_price": 345678, "type": "plot"}
# backend/main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi import HTTPException

from ml.model_loader import load_models
from app.models.house import HouseInput
from app.models.flat import FlatInput
from app.models.plot import PlotInput

import pandas as pd
from ml.model_loader import ModelRegistry

# Inicjalizacja aplikacji FastAPI
app = FastAPI(title="Properlytics API")

@app.on_event("startup")
def startup_event():
    load_models()

origins = [
    "http://localhost:5173", 
    "http://127.0.0.1:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Definicja prostego endpointu 'root'
@app.get("/")
def read_root():
    return {"status": "Backend jest aktywny!"}

# Definicja endpointu testowego
@app.get("/api/v1/status")
def get_api_status():
    return {"message": "API działa poprawnie", "version": "v1"}

from app.models.house import HouseInput
from app.models.flat import FlatInput
from app.models.plot import PlotInput

@app.post("/predict/house")
def predict_house(data: HouseInput):
    model = ModelRegistry.house_model

    if model is None:
        raise HTTPException(
            status_code=503,
            detail="Model HOUSE nie jest jeszcze dostępny"
        )

    input_df = pd.DataFrame([data.dict()])
    prediction = model.predict(input_df)[0]

    return {
        "predicted_price": round(float(prediction), 2),
        "type": "house"
    }


@app.post("/predict/flat")
def predict_flat(data: FlatInput):
    model = ModelRegistry.flat_model

    if model is None:
        raise HTTPException(
            status_code=503,
            detail="Model FLAT nie jest jeszcze dostępny"
        )

    input_df = pd.DataFrame([data.dict()])
    prediction = model.predict(input_df)[0]

    return {
        "predicted_price": round(float(prediction), 2),
        "type": "flat"
    }


@app.post("/predict/plot")
def predict_plot(data: PlotInput):
    model = ModelRegistry.plot_model

    if model is None:
        raise HTTPException(
            status_code=503,
            detail="Model PLOT nie jest jeszcze dostępny"
        )

    input_df = pd.DataFrame([data.dict()])
    prediction = model.predict(input_df)[0]

    return {
        "predicted_price": round(float(prediction), 2),
        "type": "plot"
    }
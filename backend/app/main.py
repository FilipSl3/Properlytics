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
app = FastAPI(
    title="Properlytics API",
    description="API do predykcji cen nieruchomości (domy, mieszkania, działki).",
    version="1.0.0"
)

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
from ml.model_loader import ModelRegistry
from ml.input_adapter import (
    adapt_house_input,
    adapt_flat_input,
    adapt_plot_input,
)
from app.models.response import PredictionResponse
import shap

TOP_N_SHAP = 15


def clean_feature_name(name: str) -> str:
    return (
        name.replace("num__", "")
            .replace("cat__", "")
            .replace("_", " ")
            .strip()
    )


def compute_prediction_and_shap(pipeline, input_df):
    prediction = pipeline.predict(input_df)[0]

    if not hasattr(pipeline, "named_steps"):
        return round(float(prediction), 2), {}

    preprocessor = pipeline.named_steps.get("preprocessing")
    model = pipeline.named_steps.get("model")

    if model is None or not hasattr(model, "estimators_"):
        return round(float(prediction), 2), {}

    X_transformed = preprocessor.transform(input_df)

    if hasattr(X_transformed, "toarray"):
        X_transformed = X_transformed.toarray()

    feature_names = preprocessor.get_feature_names_out()

    explainer = shap.TreeExplainer(model)
    shap_values = explainer.shap_values(X_transformed)[0]

    shap_dict = {
        clean_feature_name(feature_names[i]): round(float(shap_values[i]), 2)
        for i in range(len(feature_names))
    }

    shap_top = dict(
        sorted(
            shap_dict.items(),
            key=lambda x: abs(x[1]),
            reverse=True
        )[:TOP_N_SHAP]
    )

    return round(float(prediction), 2), shap_top

@app.post(
    "/predict/house",
    response_model=PredictionResponse,
    summary="Predykcja ceny domu",
    description="Zwraca przewidywaną cenę domu oraz najważniejsze cechy wpływające na predykcję (SHAP)."
)
def predict_house(data: HouseInput):
    pipeline = ModelRegistry.house_model
    if pipeline is None:
        raise HTTPException(status_code=503, detail="House model not loaded")

    input_df = adapt_house_input(data)

    try:
        cena, shap_values = compute_prediction_and_shap(pipeline, input_df)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

    return {
        "cena": cena,
        "shap_values": shap_values,
        "type": "house"
    }

@app.post(
    "/predict/flat",
    response_model=PredictionResponse,
    summary="Predykcja ceny mieszkania",
    description="Zwraca przewidywaną cenę mieszkania oraz najważniejsze cechy wpływające na predykcję (SHAP)."
)
def predict_flat(data: FlatInput):
    pipeline = ModelRegistry.flat_model
    if pipeline is None:
        raise HTTPException(status_code=503, detail="Flat model not loaded")

    input_df = adapt_flat_input(data)

    try:
        cena, shap_values = compute_prediction_and_shap(pipeline, input_df)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

    return {
        "cena": cena,
        "shap_values": shap_values,
        "type": "flat"
    }

@app.post(
    "/predict/plot",
    response_model=PredictionResponse,
    summary="Predykcja ceny działki",
    description="Zwraca przewidywaną cenę działki oraz najważniejsze cechy wpływające na predykcję (SHAP)."
)
def predict_plot(data: PlotInput):
    pipeline = ModelRegistry.plot_model
    if pipeline is None:
        raise HTTPException(status_code=503, detail="Plot model not loaded")

    input_df = adapt_plot_input(data)

    try:
        cena, shap_values = compute_prediction_and_shap(pipeline, input_df)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

    return {
        "cena": cena,
        "shap_values": shap_values,
        "type": "plot"
    }

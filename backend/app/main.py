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
import warnings

warnings.filterwarnings("ignore", category=UserWarning, module="sklearn")

# Inicjalizacja aplikacji FastAPI
app = FastAPI(
    title="Properlytics API",
    description="API do predykcji cen nieruchomości (domy, mieszkania, działki).",
    version="1.0.0"
)

@app.on_event("startup")
def startup_event():
    load_models()

    try:
        model = ModelRegistry.flat_model
        if model and hasattr(model, 'named_steps') and 'model' in model.named_steps:
            model.named_steps['model'].n_jobs = 1
            print("Model FLAT przestawiony na tryb API (n_jobs=1)")
    except Exception as e:
        print(f"Nie udało się przestawić n_jobs: {e}")

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

    margin = 0.05
    price_min = round(cena * (1 - margin), 2)
    price_max = round(cena * (1 + margin), 2)

    return {
        "cena": cena,
        "price_min": price_min,
        "price_max": price_max,
        "shap_values": shap_values,
        "type": "house"
    }

@app.post(
    "/predict/flat",
    summary="Predykcja ceny mieszkania",
    description="Zwraca przewidywaną cenę mieszkania oraz najważniejsze cechy wpływające na predykcję (SHAP)."
)
def predict_flat(data: FlatInput):
    model = ModelRegistry.flat_model
    if model is None:
        raise HTTPException(status_code=503, detail="Flat model not loaded")

    input_data = data.dict()
    input_df = pd.DataFrame([input_data])

    # Mapowanie nazw kolumn
    rename_dict = {
        "year": "year_built",
        "totalFloors": "floors_in_building",
        "buildType": "building_type",
        "material": "building_material",
        "constructionStatus": "finishing",
        "hasLift": "elevator",
        "hasOutdoor": "balcony/garden",
        "hasParking": "parking",
        "province": "region"
    }
    input_df = input_df.rename(columns=rename_dict)

    input_df["city"] = input_df["city"].str.lower()

    current_floor_int = input_data["floor"]
    if current_floor_int > 10:
        input_df["floor"] = "higher_10"
    else:
        input_df["floor"] = str(current_floor_int)

    # Mapowanie wartości
    value_translation_map = {
        # Ogrzewanie
        "district": "urban",
        "gas": "gas",
        "electric": "electrical",
        "boiler": "boiler_room",

        # Rynek
        "primary": "PRIMARY",
        "secondary": "SECONDARY",

        # Typ budynku
        "block": "block",
        "tenement": "tenement",
        "apartment": "apartment",
        "house": "house",

        # Materiał
        "brick": "brick",
        "concrete_plate": "concrete_plate",
        "concrete": "concrete",
        "silikat": "silikat",
        "breezeblock": "breezeblock",

        # Wykończenie
        "ready_to_use": "ready_to_use",
        "to_completion": "to_completion",
        "to_renovation": "to_renovation",

        # Miasta
        "Warszawa": "warszawa", "Kraków": "krakow", "Wrocław": "wroclaw",
        "Poznań": "poznan", "Gdańsk": "gdansk", "Łódź": "lodz", "Rzeszów": "rzeszow"
    }

    cols_to_translate = ["heating", "market", "building_type", "building_material", "finishing"]
    for col in cols_to_translate:
        if col in input_df.columns:
            val = input_df.iloc[0][col]
            if val in value_translation_map:
                input_df.at[0, col] = value_translation_map[val]

    for col in ["elevator", "balcony/garden", "parking"]:
        if col in input_df.columns:
            input_df[col] = input_df[col].astype(int)

    # 2. OBLICZENIA GŁÓWNE
    try:
        cena, shap_values = compute_prediction_and_shap(model, input_df)
        base_prediction = cena
    except Exception as e:
        print(f"Błąd predykcji: {e}")
        print("Dane wejściowe do modelu:", input_df.to_dict(orient="records"))
        raise HTTPException(status_code=500, detail=f"Błąd modelu: {str(e)}")

    # 3. Logika Porównawcza (Components Logic)
    components = []

    def check_diff(col_name, target_val, label_text):
        if col_name not in input_df.columns:
            return

        temp_df = input_df.copy()
        temp_df.at[0, col_name] = target_val

        try:
            new_price = model.predict(temp_df)[0]
            diff = base_prediction - new_price

            # Rejestrujemy każdą zmianę większą niż 50 zł
            if abs(diff) > 0:
                components.append({
                    "name": label_text,
                    "value": round(diff, 2)
                })
        except Exception:
            pass

    # OGRZEWANIE
    curr_heat = input_df.iloc[0]["heating"]
    if curr_heat == "urban":
        check_diff("heating", "electrical", "Ogrzewanie miejskie")
    elif curr_heat == "electrical":
        check_diff("heating", "urban", "Ogrzewanie elektryczne")
    else:
        check_diff("heating", "urban", "Ogrzewanie")

    # RYNEK
    curr_market = input_df.iloc[0]["market"]
    if curr_market == "PRIMARY":
        check_diff("market", "SECONDARY", "Rynek pierwotny")
    else:
        check_diff("market", "PRIMARY", "Rynek wtórny")

    # STAN
    curr_fin = input_df.iloc[0]["finishing"]
    if curr_fin == "ready_to_use":
        check_diff("finishing", "to_renovation", "Stan: pod klucz")
    elif curr_fin == "to_renovation":
        check_diff("finishing", "ready_to_use", "Stan: do remontu")
    else:
        check_diff("finishing", "ready_to_use", "Stan deweloperski")

    # MATERIAŁ
    curr_mat = input_df.iloc[0]["building_material"]

    mat_pl_names = {
        "brick": "Cegła",
        "concrete": "Beton",
        "silikat": "Silikat",
        "breezeblock": "Pustak",
        "concrete_plate": "Wielka Płyta",
        "other": "Inny"
    }

    label_mat = mat_pl_names.get(curr_mat, curr_mat)

    if curr_mat == "concrete_plate":
        # Wielką płytę porównujemy do Cegły
        check_diff("building_material", "brick", "Materiał: Wielka Płyta")

    else:
        # Mamy (Cegła, Pustak, Żelbet), porównujemy do Wielkiej Płyty
        check_diff("building_material", "concrete_plate", f"Materiał: {label_mat}")

    # PIĘTRO
    curr_floor_str = input_df.iloc[0]["floor"]
    has_elevator = input_df.iloc[0]["elevator"]

    optimal_floors = ["1", "2", "3"]

    if curr_floor_str == "0":
        # Porównujemy Parter do 3 piętra
        check_diff("floor", "3", "Położenie: Parter")

    elif curr_floor_str in optimal_floors:
        # 1-3 porównujemy do Parteru
        check_diff("floor", "0", f"Piętro {curr_floor_str} (vs Parter)")

    elif curr_floor_str in [str(i) for i in range(4, 11)]:
        if has_elevator == 0:
            # Jeśli nie ma windy, wysokie piętro to porównujemy do 1 piętra (które jest lepsze bez windy)
            check_diff("floor", "1", f"Piętro {curr_floor_str} bez windy")
        else:
            # Jeśli jest winda, wysokie piętro to porównujemy do Parteru
            check_diff("floor", "0", f"Piętro {curr_floor_str} (z widokiem)")

    elif curr_floor_str == "higher_10":
        # Mieszkania > 10 piętra porównujemy do "zwykłego" 3. piętra
        check_diff("floor", "3", "Apartament na szczycie (>10p)")

    # TYP BUDYNKU
    curr_type = input_df.iloc[0]["building_type"]

    if curr_type == "apartment":
        check_diff("building_type", "block", "Typ: Apartamentowiec")  # Zysk względem bloku

    elif curr_type == "tenement":
        check_diff("building_type", "block", "Typ: Kamienica")  # Różnica względem bloku

    elif curr_type == "house":
        check_diff("building_type", "block", "Typ: Dom wielorodzinny")  # Różnica względem bloku

    elif curr_type == "block":
        check_diff("building_type", "apartment", "Typ: Blok (vs Apartament)")  # Różnica względem apartamentowca

    # ROK BUDOWY
    curr_year = input_df.iloc[0]["year_built"]

    # 1. Przypisanie etykiety "Epoki" dla lepszego zrozumienia
    if curr_year < 1945:
        era_label = "Kamienica/Przedwojenne"
    elif 1945 <= curr_year <= 1989:
        era_label = "Budownictwo PRL"
    elif 1990 <= curr_year <= 2012:
        era_label = "Lata 90/2000"
    else:
        era_label = "Nowe Budownictwo"

    # Granica nowoczesności
    is_modern = curr_year > 2012

    if is_modern:
        # Mamy nowe mieszkanie i porównujemy do roku 1980
        check_diff("year_built", 1980, f"Rok: {int(curr_year)} ({era_label})")
    else:
        # Mamy starsze mieszkanie i porównujemy do roku 2024
        check_diff("year_built", 2024, f"Rok: {int(curr_year)} ({era_label})")

    # Winda, Balkon/Taras/Ogród, Parking
    if input_df.iloc[0]["elevator"] == 1:
        check_diff("elevator", 0, "Winda")

    if input_df.iloc[0]["balcony/garden"] == 1:
        check_diff("balcony/garden", 0, "Balkon/Taras/Ogród")

    if input_df.iloc[0]["parking"] == 1:
        check_diff("parking", 0, "Miejsce parkingowe")

    components.sort(key=lambda x: abs(x['value']), reverse=True)

    margin = 0.05
    return {
        "cena": cena,
        "shap_values": shap_values,
        "type": "flat",
        "predicted_price": round(float(base_prediction), 2),
        "price_min": round(float(base_prediction * (1 - margin)), 2),
        "price_max": round(float(base_prediction * (1 + margin)), 2),
        "components": components
    }

@app.post(
    "/predict/plot",
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

    margin = 0.10
    price_min = round(cena * (1 - margin), 2)
    price_max = round(cena * (1 + margin), 2)

    return {
        "cena": cena,
        "price_min": price_min,
        "price_max": price_max,
        "shap_values": shap_values,
        "type": "plot"
    }

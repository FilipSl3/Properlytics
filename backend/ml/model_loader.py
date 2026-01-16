import joblib
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent
MODEL_DIR = BASE_DIR / "models"

class ModelRegistry:
    house_model = None
    flat_model = None
    plot_model = None

def load_models():
    print(f"Szukam modeli w folderze: {MODEL_DIR}")
    try:
        ModelRegistry.house_model = joblib.load(MODEL_DIR / "house.joblib")
        ModelRegistry.flat_model = joblib.load(MODEL_DIR / "flat.joblib")
        ModelRegistry.plot_model = joblib.load(MODEL_DIR / "plot.joblib")

    try:
        # 1. Mieszkanie
        flat_path = MODEL_DIR / "flat.joblib"
        if flat_path.exists():
            ModelRegistry.flat_model = joblib.load(flat_path)
            print("Model FLAT załadowany.")
        else:
            print(f"Brak pliku: {flat_path}")

        # 2. Dom
        house_path = MODEL_DIR / "house.joblib"
        if house_path.exists():
            ModelRegistry.house_model = joblib.load(house_path)
            print("Model HOUSE załadowany.")

        # 3. Działka
        plot_path = MODEL_DIR / "plot.joblib"
        if plot_path.exists():
            ModelRegistry.plot_model = joblib.load(plot_path)
            print("Model PLOT załadowany.")

    except Exception as e:
        print("Błąd ładowania modeli:", e)
        raise e

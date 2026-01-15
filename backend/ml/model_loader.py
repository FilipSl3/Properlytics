import joblib
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent
MODEL_DIR = BASE_DIR / "ml_models"

class ModelRegistry:
    house_model = None
    flat_model = None
    plot_model = None

def load_models():
    try:
        # ModelRegistry.house_model = joblib.load(MODEL_DIR / "house_model.joblib")
        # ModelRegistry.flat_model = joblib.load(MODEL_DIR / "flat_model.joblib")
        # ModelRegistry.plot_model = joblib.load(MODEL_DIR / "plot_model.joblib")

        print("Zaldowane poprawnie")

    except Exception as e:
        print("Błąd ładowania modeli:", e)
        raise e

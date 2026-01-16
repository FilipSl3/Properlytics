from pydantic import BaseModel
from typing import Dict


class PredictionResponse(BaseModel):
    cena: float
    shap_values: Dict[str, float]
    type: str

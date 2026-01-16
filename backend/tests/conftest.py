import pytest
from fastapi.testclient import TestClient
from app.main import app
from ml.model_loader import ModelRegistry
import numpy as np

class DummyModel:
    def predict(self, X):
        return np.array([123456.78])

@pytest.fixture(scope="session", autouse=True)
def mock_models():
    ModelRegistry.house_model = DummyModel()
    ModelRegistry.flat_model = DummyModel()
    ModelRegistry.plot_model = DummyModel()

@pytest.fixture(scope="session")
def client():
    return TestClient(app)

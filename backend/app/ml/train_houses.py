import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.impute import SimpleImputer
from sklearn.preprocessing import OneHotEncoder
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
import joblib
import json
import os

DATA_PATH = "/data/clean_domy.csv"
MODEL_PATH = "models/house.joblib"
REPORT_PATH = "reports/houses_metrics.json"

os.makedirs("models", exist_ok=True)
os.makedirs("reports", exist_ok=True)

df = pd.read_csv(DATA_PATH)
X = df.drop(columns=["price", "link"])
y = df["price"]

X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42
)

categorical = X.select_dtypes(include=["object"]).columns
numerical = X.select_dtypes(exclude=["object"]).columns

numeric_transformer = Pipeline([
    ("imputer", SimpleImputer(strategy="median"))
])

categorical_transformer = Pipeline([
    ("imputer", SimpleImputer(strategy="most_frequent")),
    ("onehot", OneHotEncoder(handle_unknown="ignore"))
])

preprocessor = ColumnTransformer(
    transformers=[
        ("num", numeric_transformer, numerical),
        ("cat", categorical_transformer, categorical)
    ]
)

model = RandomForestRegressor(
    n_estimators=400,
    max_depth=30,
    min_samples_leaf=1,
    random_state=42,
    n_jobs=-1
)

pipe = Pipeline([
    ("preprocessing", preprocessor),
    ("model", model)
])

pipe.fit(X_train, y_train)

y_pred = pipe.predict(X_test)
mae = mean_absolute_error(y_test, y_pred)
rmse = np.sqrt(mean_squared_error(y_test, y_pred))
r2 = r2_score(y_test, y_pred)

metrics = {"MAE": float(mae), "RMSE": float(rmse), "R2": float(r2)}

with open(REPORT_PATH, "w") as f:
    json.dump(metrics, f, indent=4)

joblib.dump(pipe, MODEL_PATH)

print("House model trained")
print(metrics)

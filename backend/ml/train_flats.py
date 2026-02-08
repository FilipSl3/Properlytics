import pandas as pd
import numpy as np
import os
import json
import joblib

from sqlalchemy import create_engine

from sklearn.model_selection import train_test_split
from sklearn.impute import SimpleImputer
from sklearn.preprocessing import OneHotEncoder
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score


DATA_PATH = "/data/clean_mieszkania.csv"
MODEL_PATH = "models/flat.joblib"
REPORT_PATH = "reports/flats_metrics.json"

os.makedirs("models", exist_ok=True)
os.makedirs("reports", exist_ok=True)

DB_URL = os.getenv("DATABASE_URL")


ALLOWED_COLUMNS = [
    "area",
    "rooms",
    "floor",
    "floors_in_building",
    "year_built",
    "building_type",
    "building_material",
    "heating",
    "market",
    "finishing",
    "elevator",
    "balcony/garden",
    "parking",
    "city",
    "district",
    "region",
    "price"
]


def load_flats_from_db(db_url: str) -> pd.DataFrame:
    if not db_url:
        return pd.DataFrame()

    engine = create_engine(db_url)

    query = """
        SELECT *
        FROM flatlisting
        WHERE is_active = true
    """

    df = pd.read_sql(query, engine)
    df = df.drop(columns=["id", "is_active", "created_at"], errors="ignore")
    return df


df_csv = pd.read_csv(DATA_PATH)
df_db = load_flats_from_db(DB_URL)

print("CSV shape:", df_csv.shape)
print("DB shape:", df_db.shape)

df = pd.concat([df_csv, df_db], ignore_index=True)
df = df[[c for c in ALLOWED_COLUMNS if c in df.columns]]

df = df.dropna(subset=["price"])

X = df.drop(columns=["price"])
y = df["price"]

X_train, X_test, y_train, y_test = train_test_split(
    X,
    y,
    test_size=0.2,
    random_state=42
)

categorical = X.select_dtypes(include=["object", "string"]).columns
numerical = X.select_dtypes(exclude=["object", "string"]).columns

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
    random_state=42,
    n_jobs=-1
)

pipe = Pipeline([
    ("preprocessing", preprocessor),
    ("model", model)
])

pipe.fit(X_train, y_train)

y_pred = pipe.predict(X_test)

metrics = {
    "MAE": float(mean_absolute_error(y_test, y_pred)),
    "RMSE": float(np.sqrt(mean_squared_error(y_test, y_pred))),
    "R2": float(r2_score(y_test, y_pred))
}

with open(REPORT_PATH, "w") as f:
    json.dump(metrics, f, indent=4)

joblib.dump(pipe, MODEL_PATH)

print("FLAT model trained and saved.")
print(metrics)

import pandas as pd
import numpy as np

def clean_price(x):
    if pd.isna(x):
        return np.nan
    x = str(x).replace("zł", "").replace(" ", "").replace(",", ".")
    return pd.to_numeric(x, errors="coerce")

def clean_area(x):
    if pd.isna(x):
        return np.nan
    x = str(x).replace("m²", "").replace("m2", "").replace(" ", "").replace(",", ".")
    return pd.to_numeric(x, errors="coerce")


def clean_rooms(x):
    try:
        return float(str(x).split()[0])
    except:
        return np.nan

COLUMN_MAP = {
    "Cena": "price",
    "Powierzchnia": "area",
    "Powierzchnia domu": "area",
    "Powierzchnia działki": "plot_area",
    "Liczba pokoi": "rooms",
    "Rok budowy": "year_built",
    "Miejscowość": "city",
    "Dzielnica": "district",
    "Województwo": "region",
    "Rodzaj zabudowy": "building_type",
    "Stan wykończenia": "finishing",
    "Materiał budynku": "building_material",
    "Pokrycie dachu": "roof_type",
    "Garaż": "garage",
    "Piwnica": "basement",
    "Ogrodzenie": "fenced",
    "Gaz": "gas",
    "Woda": "water",
    "Prąd": "electricity",
    "Kanalizacja": "sewage",
    "Dojazd utwardzony": "paved_road",
    "Typ działki": "plot_type",
    "Położenie": "location",
    "Piętro": "floor",
    "Liczba pięter w budynku": "floors_in_building",
    "Liczba pięter": "floors_in_building",
    "Miejsce parkingowe": "parking",
    "Rynek": "market",
    "Ogrzewanie": "heating",
    "Rodzaj ogrzewania": "heating",
    "Winda": "elevator",
    "Balkon": "balcony",
    "Balkon/Ogród": "balcony/garden",
}

def rename_columns(df):
    rename_dict = {col: COLUMN_MAP[col] for col in df.columns if col in COLUMN_MAP}
    return df.rename(columns=rename_dict)


def clean_domy():
    df = pd.read_csv("otodom_domy.csv")

    df["Cena"] = df["Cena"].apply(clean_price)
    df["Powierzchnia domu"] = df["Powierzchnia domu"].apply(clean_area)
    df["Liczba pokoi"] = df["Liczba pokoi"].apply(clean_rooms)

    df = df.dropna(subset=["Cena", "Powierzchnia domu"])
    df["Liczba pokoi"] = df["Liczba pokoi"].fillna(df["Liczba pokoi"].median())

    df = rename_columns(df)

    df.to_csv("clean_domy.csv", index=False)
    print("Zapisano clean_domy.csv")


def clean_mieszkania():
    df = pd.read_csv("otodom_mieszkania.csv")

    df["Cena"] = df["Cena"].apply(clean_price)
    df["Powierzchnia"] = df["Powierzchnia"].apply(clean_area)
    df["Liczba pokoi"] = df["Liczba pokoi"].apply(clean_rooms)

    df = df.dropna(subset=["Cena", "Powierzchnia"])
    df["Liczba pokoi"] = df["Liczba pokoi"].fillna(df["Liczba pokoi"].median())

    df = rename_columns(df)

    df.to_csv("clean_mieszkania.csv", index=False)
    print("Zapisano clean_mieszkania.csv")


def clean_dzialki():
    df = pd.read_csv("otodom_dzialki.csv")

    df["Cena"] = df["Cena"].apply(clean_price)
    df["Powierzchnia"] = df["Powierzchnia"].apply(clean_area)

    df = df.dropna(subset=["Cena", "Powierzchnia"])

    df = rename_columns(df)

    df.to_csv("clean_dzialki.csv", index=False)
    print("Zapisano clean_dzialki.csv")


def main():
    clean_domy()
    clean_mieszkania()
    clean_dzialki()

if __name__ == "__main__":
    main()

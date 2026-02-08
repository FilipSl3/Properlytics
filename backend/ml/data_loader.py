import pandas as pd
from sqlalchemy import create_engine

def load_flats_from_db(db_url: str) -> pd.DataFrame:
    engine = create_engine(db_url)

    query = """
        SELECT *
        FROM flat_listings
        WHERE is_active = true
    """

    df = pd.read_sql(query, engine)


    df = df.drop(
        columns=["id", "is_active", "created_at"],
        errors="ignore"
    )

    return df

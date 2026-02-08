import pandas as pd


def adapt_flat_input(data) -> pd.DataFrame:
    return pd.DataFrame([{
        "area": data.area,
        "rooms": data.rooms,
        "floor": data.floor,
        "floors_in_building": data.totalFloors,
        "year_built": data.year,

        "building_type": data.buildType,
        "building_material": data.material,
        "heating": data.heating,
        "market": data.market,
        "finishing": data.constructionStatus,

        "elevator": data.hasLift,
        "balcony/garden": data.hasOutdoor,
        "parking": data.hasParking,

        "city": data.city,
        "district": data.district if data.district else "unknown",
        "region": data.province,
    }])


def adapt_house_input(data) -> pd.DataFrame:
    return pd.DataFrame([{
        "area": data.areaHouse,
        "plot_area": data.areaPlot,
        "rooms": data.rooms,
        "floors": data.floors,
        "year_built": data.year,

        "building_type": data.buildType,
        "building_material": data.material,
        "heating": data.heatingType,
        "finishing": data.constructionStatus,
        "parking": data.hasGarage,

        "city": data.city,
        "district": "unknown",
        "region": data.province,
    }])


def adapt_plot_input(data) -> pd.DataFrame:
    return pd.DataFrame([{
        "area": data.area,
        "plot_type": data.type,
        "purpose": data.locationType,
        "access_road": data.isHardAccess,
        "utilities": "unknown",

        "city": data.city,
        "district": "unknown",
        "region": data.province,
    }])

import pandas as pd

def adapt_house_input(data) -> pd.DataFrame:
    if data.floors == 0:
        floors_cat = "ground_floor"
    elif data.floors == 1:
        floors_cat = "one_floor"
    elif data.floors == 2:
        floors_cat = "two_floors"
    elif data.floors > 2:
        floors_cat = "more"
    else:
        floors_cat = "one_floor"

    return pd.DataFrame([{
        "area": data.areaHouse,
        "plot_area": data.areaPlot,

        "rooms": data.rooms,
        "floors_in_building": floors_cat,
        "year_built": data.year,

        "building_type": data.buildType,
        "finishing": data.constructionStatus,
        "market": data.market,
        "building_material": data.material,
        "roof_type": data.roofType,

        "garage": data.hasGarage,
        "basement": data.hasBasement,
        "gas": data.hasGas,
        "sewage": data.hasSewerage,
        "paved_road": data.isHardAccess,

        "fenced": 1 if data.fenceType else 0,
        "heating": data.heatingType if data.heatingType else "unknown",

        "city": data.city,
        "region": data.province,
    }])

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

def adapt_plot_input(data) -> pd.DataFrame:
    return pd.DataFrame([{
        "area": data.area,

        "plot_type": data.type,
        "location": data.locationType,

        "electricity": data.hasElectricity,
        "water": data.hasWater,
        "gas": data.hasGas,
        "sewage": data.hasSewerage,
        "paved_road": data.isHardAccess,
        "fenced": data.hasFence,

        "city": data.city,
        "region": data.province,
    }])


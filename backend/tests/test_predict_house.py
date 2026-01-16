def test_predict_house_success(client):
    payload = {
        "areaHouse": 120,
        "areaPlot": 600,
        "rooms": 4,
        "floors": 2,
        "year": 2010,

        "buildType": "detached",
        "constructionStatus": "ready_to_use",
        "market": "secondary",
        "material": "brick",
        "roofType": "tile",

        "hasGarage": 1,
        "hasBasement": 0,
        "hasGas": 1,
        "hasSewerage": 1,
        "isHardAccess": 0,

        "fenceType": "",
        "heatingType": "",

        "city": "warszawa",
        "province": "mazowieckie"
    }

    response = client.post("/predict/house", json=payload)

    assert response.status_code == 200

    body = response.json()
    assert "cena" in body
    assert "shap_values" in body
    assert body["type"] == "house"

def test_predict_house_missing_field(client):
    payload = {
        "areaHouse": 120
    }

    response = client.post("/predict/house", json=payload)

    assert response.status_code == 422

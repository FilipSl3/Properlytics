def test_predict_flat_success(client):
    payload = {
        "area": 55,
        "rooms": 2,
        "floor": 3,
        "totalFloors": 5,
        "year": 2015,

        "buildType": "block",
        "material": "brick",
        "heating": "gas",
        "market": "secondary",
        "constructionStatus": "ready_to_use",

        "hasLift": 1,
        "hasOutdoor": 0,
        "hasParking": 1,

        "city": "krakow",
        "district": "",
        "province": "malopolskie"
    }

    response = client.post("/predict/flat", json=payload)

    assert response.status_code == 200
    body = response.json()

    assert "cena" in body
    assert "shap_values" in body
    assert body["type"] == "flat"

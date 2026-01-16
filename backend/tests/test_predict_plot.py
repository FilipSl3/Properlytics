def test_predict_plot_success(client):
    payload = {
        "area": 1000,

        "type": "building",
        "locationType": "suburban",

        "hasElectricity": 1,
        "hasWater": 1,
        "hasGas": 0,
        "hasSewerage": 1,
        "isHardAccess": 0,
        "hasFence": 1,

        "city": "poznan",
        "province": "wielkopolskie"
    }

    response = client.post("/predict/plot", json=payload)

    assert response.status_code == 200
    body = response.json()

    assert "cena" in body
    assert "shap_values" in body
    assert body["type"] == "plot"

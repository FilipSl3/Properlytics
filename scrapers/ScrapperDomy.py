import requests
from bs4 import BeautifulSoup
import json
import csv
import time

BASE_URL = "https://www.otodom.pl/pl/wyniki/sprzedaz/dom/cala-polska"
HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
                  "AppleWebKit/537.36 (KHTML, like Gecko) "
                  "Chrome/116.0.0.0 Safari/537.36"
}
OUTPUT_FILE = "otodom_domy.csv"


def get_listing_urls(page=1):
    params = {"page": page}
    response = requests.get(BASE_URL, headers=HEADERS, params=params)
    if response.status_code != 200:
        print(f"Błąd pobierania strony {page}: {response.status_code}")
        return []
    soup = BeautifulSoup(response.content, "html.parser")
    links = [a['href'] for a in soup.select("a[href*='/oferta/']")]
    links = list(set(links))
    full_links = [link if link.startswith("http") else "https://www.otodom.pl" + link for link in links]
    return full_links


def parse_listing(url):
    try:
        response = requests.get(url, headers=HEADERS)
        if response.status_code != 200:
            return None

        soup = BeautifulSoup(response.content, "html.parser")
        script_tag = soup.find("script", id="__NEXT_DATA__", type="application/json")
        if not script_tag:
            return None

        data_json = json.loads(script_tag.string)
        ad = data_json['props']['pageProps']['ad']
        target = ad.get("target", {})

        # Helper
        def get_val(key, default=""):
            val = target.get(key, default)
            if isinstance(val, list) and len(val) > 0:
                return val[0]
            if val is None:
                return default
            return val

        # Cena
        price = ad.get("Price")
        if not price:
            price = target.get("Price")
        if not price:
            area = target.get("Area")
            price_per_m = target.get("Price_per_m")
            if area and price_per_m:
                try:
                    price = float(area) * float(price_per_m)
                except:
                    price = None
        if not price:
            return None

        features_list = [x.lower() for x in ad.get("features", [])]
        media_types = [x.lower() for x in target.get("Media_types", [])]
        extras_types = [x.lower() for x in target.get("Extras_types", [])]

        # Garaż / Piwnica
        has_garage = 1 if any(
            x in features_list for x in ["garaż", "miejsce parkingowe"]) or "garage" in extras_types else 0
        has_basement = 1 if "piwnica" in features_list or "basement" in extras_types else 0

        # Media
        has_gas = 1 if "gaz" in features_list or "gas" in media_types else 0
        has_sewerage = 1 if any(x in features_list for x in ["kanalizacja", "szambo"]) or any(
            x in media_types for x in ["sewage", "cesspool"]) else 0

        # Ogrodzenie
        fence_raw = target.get("Fence_types", [])
        fence_val = fence_raw[0] if fence_raw and len(fence_raw) > 0 else ""

        if not fence_val and any("ogrodzenie" in x for x in features_list):
            fence_val = "tak"

        # Dojazd
        access_raw = target.get("Access_types", [])
        is_hard_access = 0

        hard_surfaces_en = ["asphalt", "hard_surfaced", "concrete"]
        hard_surfaces_pl = ["asfalt", "utwardzony", "beton", "kostka", "asfaltowy"]

        if any(x in access_raw for x in hard_surfaces_en):
            is_hard_access = 1
        elif any(y in x for x in features_list for y in hard_surfaces_pl):
            is_hard_access = 1

        # Rodzaj Ogrzewania
        heating_raw = target.get("Heating_types", [])
        if not heating_raw:
            heating_raw = target.get("Heating", [])

        heating_val = heating_raw[0] if heating_raw and len(heating_raw) > 0 else ""

        result = {
            "link": url,
            "Cena": price,

            "Powierzchnia domu": target.get("Area", ""),
            "Powierzchnia działki": target.get("Terrain_area", ""),

            "Liczba pokoi": get_val("Rooms_num"),
            "Rodzaj zabudowy": get_val("Building_type"),
            "Stan wykończenia": get_val("Construction_status"),
            "Rynek": ad.get("market", ""),
            "Liczba pięter": get_val("Floors_num"),
            "Rok budowy": get_val("Build_year"),
            "Materiał budynku": get_val("Building_material"),
            "Pokrycie dachu": get_val("Roof_type"),

            "Garaż": has_garage,
            "Piwnica": has_basement,
            "Ogrodzenie": fence_val,
            "Gaz": has_gas,
            "Kanalizacja": has_sewerage,
            "Rodzaj ogrzewania": heating_val,
            "Dojazd utwardzony": is_hard_access,

            "Miejscowość": target.get("City", ""),
            "Województwo": target.get("Province", "")
        }
        return result

    except Exception as e:
        print(f"Nie udało się sparsować {url}: {e}")
        return None


def save_to_csv(data, filename=OUTPUT_FILE):
    if not data:
        print("Brak danych do zapisania.")
        return
    keys = data[0].keys()
    with open(filename, "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, keys)
        writer.writeheader()
        writer.writerows(data)
    print(f"Zapisano {len(data)} ogłoszeń do {filename}")


def main(pages=50):
    all_data = []
    for page in range(1, pages + 1):
        print(f"Pobieranie strony {page}...")
        urls = get_listing_urls(page)
        print(f"Znaleziono {len(urls)} ogłoszeń na stronie {page}")
        for idx, url in enumerate(urls, 1):
            print(f"Pobieranie ogłoszenia {idx}/{len(urls)}: {url}")
            data = parse_listing(url)
            if data:
                all_data.append(data)
            time.sleep(0.5)
    save_to_csv(all_data)


if __name__ == "__main__":
    main(pages=50)

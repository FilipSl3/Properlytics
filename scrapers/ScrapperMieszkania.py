import requests
from bs4 import BeautifulSoup
import json
import csv
import time

BASE_URL = "https://www.otodom.pl/pl/wyniki/sprzedaz/mieszkanie/cala-polska"
HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
                  "AppleWebKit/537.36 (KHTML, like Gecko) "
                  "Chrome/116.0.0.0 Safari/537.36"
}
OUTPUT_FILE = "otodom_mieszkania.csv"


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

        # Logika Pięter
        floor_raw = get_val("Floor_no")
        floor = ""
        if floor_raw:
            raw_str = str(floor_raw).lower()
            if "ground_floor" in raw_str:
                floor = 0
            elif "cellar" in raw_str:
                floor = -1
            elif "garret" in raw_str:
                floor = get_val("Building_floors_num")
            else:
                floor = raw_str.replace("floor_", "")

        # Cechy
        features_list = [x.lower() for x in ad.get("features", [])]
        has_lift = 1 if "winda" in features_list else 0
        has_outdoor = 1 if any(x in features_list for x in ["balkon", "taras", "ogródek"]) else 0
        has_parking = 1 if any(
            x in features_list for x in ["garaż", "miejsce parkingowe", "garaż/miejsce parkingowe"]) else 0

        district = ""

        location = ad.get("location", {})
        if location and isinstance(location, dict):
            dist_obj = location.get("district")
            if dist_obj and isinstance(dist_obj, dict):
                district = dist_obj.get("name", "")

        if not district:
            breadcrumbs = ad.get("breadcrumbs", [])
            city_name = target.get("City", "").lower()

            for i, item in enumerate(breadcrumbs):
                if item.get("label", "").lower() == city_name:
                    if i + 1 < len(breadcrumbs):
                        potential_district = breadcrumbs[i + 1].get("label", "")
                        district = potential_district
                    break

        result = {
            "link": url,
            "Cena": price,
            "Powierzchnia": target.get("Area", ""),
            "Liczba pokoi": get_val("Rooms_num"),
            "Piętro": floor,
            "Liczba pięter w budynku": get_val("Building_floors_num"),
            "Rok budowy": get_val("Build_year"),
            "Rodzaj zabudowy": get_val("Building_type"),
            "Materiał budynku": get_val("Building_material"),
            "Ogrzewanie": get_val("Heating"),
            "Rynek": ad.get("market", ""),
            "Stan wykończenia": get_val("Construction_status"),
            "Winda": has_lift,
            "Balkon/Ogród": has_outdoor,
            "Miejsce parkingowe": has_parking,
            "Miejscowość": target.get("City", ""),
            "Dzielnica": district,
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


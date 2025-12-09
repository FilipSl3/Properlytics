import requests
from bs4 import BeautifulSoup
import json
import csv
import time

BASE_URL = "https://www.otodom.pl/pl/wyniki/sprzedaz/dzialka/cala-polska"
HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
                  "AppleWebKit/537.36 (KHTML, like Gecko) "
                  "Chrome/116.0.0.0 Safari/537.36"
}
OUTPUT_FILE = "otodom_dzialki.csv"


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

        # Cechy
        features_list = [x.lower() for x in ad.get("features", [])]

        has_electricity = 1 if any(x in features_list for x in ["prąd", "elektryczność"]) else 0
        has_water = 1 if "woda" in features_list else 0
        has_gas = 1 if "gaz" in features_list else 0
        has_sewerage = 1 if any(x in features_list for x in ["kanalizacja", "szambo", "oczyszczalnia"]) else 0

        fence_data = target.get("Fence")

        has_fence = 0
        if fence_data and isinstance(fence_data, list) and len(fence_data) > 0:
            if "brak" not in [str(x).lower() for x in fence_data]:
                has_fence = 1
        elif "ogrodzenie" in features_list:
            has_fence = 1


        # Dojazd
        has_access_road = 1 if any(
            x in features_list for x in ["dojazd asfaltowy", "dojazd utwardzony", "asfalt", "kostka", "asfaltowy", "utwardzony"]) else 0


        result = {
            "link": url,
            "Cena": price,
            "Powierzchnia": target.get("Area", ""),
            "Typ działki": get_val("Type"),
            "Położenie": get_val("Location"),

            "Prąd": has_electricity,
            "Woda": has_water,
            "Gaz": has_gas,
            "Kanalizacja": has_sewerage,
            "Dojazd utwardzony": has_access_road,
            "Ogrodzenie": has_fence,

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

import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import api from "../../api";
import { useAuth } from "../../context/AuthContext";
import {
  LISTING_ENDPOINTS,
  formatPrice,
  parsePhotos,
  pickPrice,
  pickLocation,
  pickTitle,
} from "./listingUtils";

type ParamRow = { label: string; value: string };

function Param({ label, value }: ParamRow) {
  return (
    <div className="rounded-xl bg-gray-50 p-3 border border-gray-100">
      <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">{label}</div>
      <div className="font-semibold text-gray-900">{value}</div>
    </div>
  );
}

export default function HouseListingDetails() {
  const { id } = useParams();
  const { isAuthenticated, token } = useAuth();
  const [item, setItem] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  useEffect(() => {
    let alive = true;

    async function load() {
      try {
        setLoading(true);
        setErr("");
        const res = await api.get(`${LISTING_ENDPOINTS.houses}/${id}`);
        if (!alive) return;
        setItem(res.data);
      } catch {
        if (!alive) return;
        setErr("Nie udało się pobrać ogłoszenia domu.");
      } finally {
        if (alive) setLoading(false);
      }
    }

    if (id) load();
    return () => {
      alive = false;
    };
  }, [id]);

  const title = useMemo(() => pickTitle(item, "Dom na sprzedaż"), [item]);
  const location = useMemo(() => pickLocation(item), [item]);
  const price = useMemo(() => pickPrice(item), [item]);
  const photos = useMemo(
    () => parsePhotos(item?.photos_url || item?.photos || item?.photosUrls),
    [item]
  );

  
  const params: ParamRow[] = useMemo(() => {
    if (!item) return [];
    const rows: ParamRow[] = [];

    
    if (item.area != null) rows.push({ label: "Powierzchnia domu", value: `${item.area} m²` });
    if (item.plot_area != null) rows.push({ label: "Powierzchnia działki", value: `${item.plot_area} m²` });
    
    
    if (item.rooms != null) rows.push({ label: "Liczba pokoi", value: String(item.rooms) });
    if (item.floors != null) rows.push({ label: "Liczba pięter", value: String(item.floors) });

    
    const year = item.year ?? item.year_built;
    if (year != null) rows.push({ label: "Rok budowy", value: String(year) });

    
    const buildType = item.buildType ?? item.building_type;
    if (buildType) {
      const typeMap: Record<string, string> = {
        detached: "Wolnostojący",
        semi_detached: "Bliźniak",
        terraced: "Szeregowiec",
        farm: "Gospodarstwo",
        residence: "Rezydencja",
        house: "Dom jednorodzinny"
      };
      rows.push({ label: "Typ domu", value: typeMap[buildType] || buildType });
    }

    
    if (item.market) {
      const marketMap: Record<string, string> = {
        PRIMARY: "Pierwotny",
        SECONDARY: "Wtórny",
        primary: "Pierwotny",
        secondary: "Wtórny"
      };
      rows.push({ label: "Rynek", value: marketMap[item.market] || item.market });
    }

    
    const material = item.material ?? item.building_material;
    if (material) {
      const matMap: Record<string, string> = {
        brick: "Cegła",
        wood: "Drewno",
        breezeblock: "Pustak",
        concrete: "Beton",
        cellular_concrete: "Beton komórkowy",
        hydroton: "Keramzyt"
      };
      rows.push({ label: "Materiał", value: matMap[material] || material });
    }

    
    if (item.heating) {
      const heatMap: Record<string, string> = {
        gas: "Gazowe",
        coal: "Węglowe",
        electric: "Elektryczne",
        heat_pump: "Pompa ciepła",
        fireplace: "Kominkowe",
        biomass: "Biomasa",
        district: "Miejskie"
      };
      rows.push({ label: "Ogrzewanie", value: heatMap[item.heating] || item.heating });
    }

    
    const status = item.constructionStatus ?? item.finishing;
    if (status) {
      const statusMap: Record<string, string> = {
        ready_to_use: "Do zamieszkania",
        to_completion: "Do wykończenia",
        to_renovation: "Do remontu",
        raw_open: "Stan surowy otwarty",
        raw_closed: "Stan surowy zamknięty",
        finishing: "Stan deweloperski"
      };
      rows.push({ label: "Stan", value: statusMap[status] || status });
    }

    
    const garage = item.hasGarage ?? item.garage;
    if (garage != null) rows.push({ label: "Garaż", value: Number(garage) === 1 ? "Tak" : "Nie" });

    const garden = item.hasGarden ?? item.garden;
    if (garden != null) rows.push({ label: "Ogród", value: Number(garden) === 1 ? "Tak" : "Nie" });

    return rows;
  }, [item]);

  if (loading) return (
    <div className="flex justify-center items-center h-64 text-gray-500">
      <div className="animate-pulse">Ładowanie ogłoszenia...</div>
    </div>
  );
  
  if (err) return (
    <div className="p-8 text-center">
      <div className="text-red-600 font-bold text-xl mb-2">Wystąpił błąd</div>
      <p className="text-gray-600">{err}</p>
      <Link to="/ogloszenia/domy" className="text-blue-600 underline mt-4 block">Wróć do listy</Link>
    </div>
  );

  if (!item) return null;

  return (
    <div className="max-w-5xl mx-auto py-8 px-4 sm:px-6">
      <div className="mb-6">
        <Link to="/ogloszenia/domy" className="inline-flex items-center text-sm text-gray-500 hover:text-amber-600 transition-colors">
          ← Wróć do listy domów
        </Link>
      </div>

      <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
        
        <div className="relative bg-gray-100 aspect-video md:aspect-[21/9]">
          {photos[0] ? (
            <img 
              src={photos[0]} 
              alt={title} 
              className="w-full h-full object-cover" 
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-gray-400 bg-gray-50">
              <span className="text-4xl mb-2">🏠</span>
              <span>Brak zdjęcia domu</span>
            </div>
          )}
          
          
          <div className="absolute bottom-0 right-0 m-6 bg-white/95 backdrop-blur px-6 py-3 rounded-2xl shadow-lg border border-gray-200">
            <div className="text-xs text-gray-500 uppercase font-bold tracking-wider">Cena ofertowa</div>
            <div className="text-2xl md:text-3xl font-extrabold text-gray-900">
              {price != null ? formatPrice(price) : "Brak ceny"}
            </div>
          </div>
        </div>

        <div className="p-6 md:p-10">
          <div className="mb-8 border-b border-gray-100 pb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">{title}</h1>
            <div className="flex items-center text-gray-500 text-lg">
              📍 {location}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
           
            <div className="lg:col-span-2 space-y-8">
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  📝 Opis ogłoszenia
                </h3>
                {item.description ? (
                  <p className="text-gray-700 leading-relaxed whitespace-pre-line text-lg">
                    {String(item.description)}
                  </p>
                ) : (
                  <p className="text-gray-400 italic">Brak opisu.</p>
                )}
              </div>

              
              {params.length > 0 && (
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                    ⚙️ Szczegóły nieruchomości
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {params.map((p) => (
                      <Param key={p.label} label={p.label} value={p.value} />
                    ))}
                  </div>
                </div>
              )}
            </div>

            
            <div className="space-y-6">
              <div className="bg-amber-50 rounded-2xl p-6 border border-amber-100">
                <h3 className="text-gray-900 font-bold mb-1">Kontakt do sprzedającego</h3>
                <p className="text-sm text-gray-500 mb-4">Zainteresował Cię ten dom?</p>
                
                {item.phone_number ? (
                  <div className="flex items-center gap-3 bg-white p-4 rounded-xl shadow-sm border border-amber-200">
                    <div className="bg-green-100 p-2 rounded-full text-green-600">📞</div>
                    <div className="font-mono text-xl font-bold text-gray-900">
                      {String(item.phone_number)}
                    </div>
                  </div>
                ) : (
                  <div className="text-gray-500 text-sm">Numer ukryty</div>
                )}
              </div>

              {photos.length > 1 && (
                <div>
                  <h4 className="font-bold text-gray-900 mb-3">Galeria zdjęć</h4>
                  <div className="grid grid-cols-2 gap-2">
                    {photos.slice(1).map((p, idx) => (
                      <img
                        key={idx}
                        src={p}
                        alt={`Zdjęcie ${idx + 2}`}
                        className="rounded-lg border border-gray-200 object-cover aspect-square hover:opacity-90 transition cursor-pointer"
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {isAuthenticated && item && (
            <div className="mt-8 pt-6 border-t border-gray-200">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Panel Administratora</h3>
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => {
                    if (!confirm("Czy na pewno usunąć to ogłoszenie?")) return;
                    api.delete(`/admin/listings/house/${item.id}`, { headers: { Authorization: `Bearer ${token}` } })
                      .then(() => window.location.href = "/ogloszenia/domy")
                      .catch(err => alert(err.response?.data?.detail || "Błąd"));
                  }}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                >
                  🗑️ Usuń ogłoszenie
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
import { useState, useEffect } from 'react';
import api from '../api';

interface PredictionData {
  cena: number;
  price_min: number;
  price_max: number;
  shap_values: Record<string, number>;
}

const PROVINCES = [
  "Dolnośląskie", "Kujawsko-pomorskie", "Lubelskie", "Lubuskie", "Łódzkie",
  "Małopolskie", "Mazowieckie", "Opolskie", "Podkarpackie", "Podlaskie",
  "Pomorskie", "Śląskie", "Świętokrzyskie", "Warmińsko-mazurskie", "Wielkopolskie", "Zachodniopomorskie"
];

const CITY_TO_PROVINCE: Record<string, string> = {
  "warszawa": "Mazowieckie", "radom": "Mazowieckie", "płock": "Mazowieckie",
  "kraków": "Małopolskie", "tarnów": "Małopolskie",
  "łódź": "Łódzkie",
  "wrocław": "Dolnośląskie", "wałbrzych": "Dolnośląskie",
  "poznań": "Wielkopolskie",
  "gdańsk": "Pomorskie", "gdynia": "Pomorskie", "sopot": "Pomorskie",
  "szczecin": "Zachodniopomorskie",
  "bydgoszcz": "Kujawsko-pomorskie", "toruń": "Kujawsko-pomorskie",
  "lublin": "Lubelskie",
  "katowice": "Śląskie", "częstochowa": "Śląskie", "gliwice": "Śląskie",
  "białystok": "Podlaskie",
  "rzeszów": "Podkarpackie",
  "kielce": "Świętokrzyskie",
  "olsztyn": "Warmińsko-mazurskie",
  "opole": "Opolskie",
  "zielona góra": "Lubuskie", "gorzów wielkopolski": "Lubuskie"
};

export default function HouseForm() {
  const [formData, setFormData] = useState({
    areaHouse: '100',
    areaPlot: '300',
    rooms: '4',
    buildType: 'detached',
    constructionStatus: 'ready_to_use',
    market: 'secondary',
    floors: '1',
    year: '2000',
    material: 'brick',
    roofType: 'diagonal',
    city: 'Warszawa',
    province: 'Mazowieckie',

    hasGarage: false,
    hasBasement: false,
    hasGas: false,
    hasSewerage: false,
    isHardAccess: false,

    fenceType: 'wire',
    heatingType: 'gas',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [predictionData, setPredictionData] = useState<PredictionData | null>(null);
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  useEffect(() => {
    const cityLower = formData.city.trim().toLowerCase();
    if (CITY_TO_PROVINCE[cityLower]) {
      setFormData(prev => ({ ...prev, province: CITY_TO_PROVINCE[cityLower] }));
    }
  }, [formData.city]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
    if (predictionData) setPredictionData(null);
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    const currentYear = new Date().getFullYear();

    const areaH = Number(formData.areaHouse);
    const areaP = Number(formData.areaPlot);
    const rooms = Number(formData.rooms);
    const floors = Number(formData.floors);

    if (!formData.areaHouse || areaH < 15) {
      newErrors.areaHouse = "Dom musi mieć min. 15 m²";
    } else if (areaH > 1500) {
      newErrors.areaHouse = "Maksymalna powierzchnia to 1500 m²";
    }

    if (floors < 0) newErrors.floors = "Liczba pięter nie może być ujemna";
    if (floors > 4) newErrors.floors = "Maksymalnie 4 piętra dla domu jednorodzinnego";

    if (!formData.areaPlot || areaP < 1) {
      newErrors.areaPlot = "Wymagane";
    } else if (areaP > 200000) {
      newErrors.areaPlot = "Maksymalnie 200 000 m² (20 ha)";
    } else {
        const estimatedFootprint = areaH / (floors === 0 ? 1 : floors + 1);
        if (estimatedFootprint > areaP) {
            newErrors.areaPlot = "Działka jest mniejsza niż podstawa domu!";
        }
    }

    if (!formData.rooms || rooms < 1) {
      newErrors.rooms = "Min. 1 pokój";
    } else if (rooms > 30) {
      newErrors.rooms = "Maks. 30 pokoi";
    } else {
        if (areaH / rooms < 6) {
             newErrors.rooms = "Zbyt wiele pokoi na taki metraż";
        }
    }

    const year = Number(formData.year);
    if (!formData.year || year < 1800) newErrors.year = "Rok musi być > 1800";
    if (year > currentYear + 5) newErrors.year = `Max rok to ${currentYear + 5}`;

    if (!formData.city.trim()) newErrors.city = "Wymagane";
    if (!formData.province) newErrors.province = "Wymagane";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    setApiError(null);
    setPredictionData(null);

    const payload = {
      ...formData,
      areaHouse: Number(formData.areaHouse),
      areaPlot: Number(formData.areaPlot),
      rooms: Number(formData.rooms),
      floors: Number(formData.floors),
      year: Number(formData.year),
      hasGarage: formData.hasGarage,
      hasBasement: formData.hasBasement,
      hasGas: formData.hasGas,
      hasSewerage: formData.hasSewerage,
      isHardAccess: formData.isHardAccess,
    };

    try {
      const response = await api.post('/predict/house', payload);
      setPredictionData(response.data);
    } catch (err: any) {
      console.error("Błąd API:", err);
      if (err.response && err.response.status === 422) {
          setApiError("Błąd walidacji danych. Sprawdź poprawność formularza.");
      } else {
          setApiError("Wystąpił błąd podczas wyceny domu.");
      }
    } finally {
      setLoading(false);
    }
  };

  const getInputClass = (fieldName: string) => `
    w-full p-3 border rounded-lg outline-none transition bg-white
    ${errors[fieldName] 
      ? 'border-red-500 focus:ring-red-500' 
      : 'border-gray-300 focus:ring-emerald-500'}
  `;

  const labelClass = "block text-sm font-medium text-gray-700 mb-1";
  const checkboxContainerClass = "flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition cursor-pointer hover:border-emerald-200";

  return (
    <div className="max-w-4xl mx-auto py-8">
      <div className="bg-white shadow-2xl rounded-2xl p-8 border border-gray-100">
        <h2 className="text-3xl font-bold text-gray-900 mb-6 border-b pb-4 flex items-center gap-2">
          🏡 <span className="text-emerald-600">Wycena Domu</span>
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div>
              <label className={labelClass}>Powierzchnia Domu (m²)</label>
              <input type="number" name="areaHouse" value={formData.areaHouse} onChange={handleChange} className={getInputClass('areaHouse')} step="0.1" placeholder="np. 120" />
              {errors.areaHouse && <p className="text-red-500 text-xs mt-1">{errors.areaHouse}</p>}
            </div>
            <div>
              <label className={labelClass}>Powierzchnia Działki (m²)</label>
              <input type="number" name="areaPlot" value={formData.areaPlot} onChange={handleChange} className={getInputClass('areaPlot')} step="1" placeholder="np. 800" />
              {errors.areaPlot && <p className="text-red-500 text-xs mt-1">{errors.areaPlot}</p>}
            </div>
            <div>
              <label className={labelClass}>Liczba pokoi</label>
              <input type="number" name="rooms" value={formData.rooms} onChange={handleChange} className={getInputClass('rooms')} />
              {errors.rooms && <p className="text-red-500 text-xs mt-1">{errors.rooms}</p>}
            </div>
            <div>
              <label className={labelClass}>Rok budowy</label>
              <input type="number" name="year" value={formData.year} onChange={handleChange} className={getInputClass('year')} />
              {errors.year && <p className="text-red-500 text-xs mt-1">{errors.year}</p>}
            </div>
            <div>
              <label className={labelClass}>Liczba pięter</label>
              <input type="number" name="floors" value={formData.floors} onChange={handleChange} className={getInputClass('floors')} placeholder="0 = Parter" />
              {errors.floors && <p className="text-red-500 text-xs mt-1">{errors.floors}</p>}
            </div>
            <div>
              <label className={labelClass}>Rodzaj zabudowy</label>
              <select name="buildType" value={formData.buildType} onChange={handleChange} className={getInputClass('buildType')}>
                <option value="detached">Wolnostojący</option>
                <option value="semi_detached">Bliźniak</option>
                <option value="ribbon">Szeregowiec</option>
                <option value="manor">Dworek</option>
              </select>
            </div>
             <div>
              <label className={labelClass}>Stan wykończenia</label>
              <select name="constructionStatus" value={formData.constructionStatus} onChange={handleChange} className={getInputClass('constructionStatus')}>
                <option value="ready_to_use">Do zamieszkania</option>
                <option value="to_completion">Do wykończenia</option>
                <option value="to_renovation">Do remontu</option>
                <option value="unfinished_close">Stan surowy zamknięty</option>
              </select>
            </div>
             <div>
              <label className={labelClass}>Rynek</label>
              <select name="market" value={formData.market} onChange={handleChange} className={getInputClass('market')}>
                <option value="secondary">Wtórny</option>
                <option value="primary">Pierwotny</option>
              </select>
            </div>
            <div>
              <label className={labelClass}>Materiał budynku</label>
              <select name="material" value={formData.material} onChange={handleChange} className={getInputClass('material')}>
                <option value="brick">Cegła</option>
                <option value="wood">Drewno</option>
                <option value="breezeblock">Pustak</option>
                <option value="concrete">Beton</option>
                <option value="silikat">Silikat</option>
              </select>
            </div>
             <div>
              <label className={labelClass}>Rodzaj dachu</label>
              <select name="roofType" value={formData.roofType} onChange={handleChange} className={getInputClass('roofType')}>
                <option value="diagonal">Skośny</option>
                <option value="flat">Płaski</option>
                <option value="undulating">Inny / Falisty</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t">
            <div>
               <label className={labelClass}>Miejscowość</label>
               <input type="text" name="city" value={formData.city} onChange={handleChange} className={getInputClass('city')} placeholder="np. Warszawa" />
               {errors.city && <p className="text-red-500 text-xs mt-1">{errors.city}</p>}
            </div>
            <div>
               <label className={labelClass}>Województwo</label>
               <select name="province" value={formData.province} onChange={handleChange} className={getInputClass('province')}>
                 {PROVINCES.map(prov => (
                   <option key={prov} value={prov}>{prov}</option>
                 ))}
               </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t">
             <div>
               <label className={labelClass}>Rodzaj Ogrzewania</label>
               <select name="heatingType" value={formData.heatingType} onChange={handleChange} className={getInputClass('heatingType')}>
                 <option value="gas">Gazowe</option>
                 <option value="heat_pump">Pompa ciepła</option>
                 <option value="coal">Węglowe</option>
                 <option value="electric">Elektryczne</option>
                 <option value="fireplace">Kominek</option>
                 <option value="other">Inne / Brak danych</option>
               </select>
             </div>
             <div>
               <label className={labelClass}>Typ Ogrodzenia</label>
               <select name="fenceType" value={formData.fenceType} onChange={handleChange} className={getInputClass('fenceType')}>
                 <option value="">Brak / Nie wiem</option>
                 <option value="wire">Siatka</option>
                 <option value="metal">Metalowe</option>
                 <option value="brick">Murowane</option>
                 <option value="wood">Drewniane</option>
                 <option value="concrete">Betonowe</option>
                 <option value="mixed">Mieszane</option>
                 <option value="hedge">Żywopłot</option>
               </select>
             </div>
          </div>

          <div className="pt-4 border-t">
            <label className={labelClass}>Media i Udogodnienia</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 mt-2">
              <label className={checkboxContainerClass}>
                <input type="checkbox" name="hasGarage" checked={formData.hasGarage} onChange={handleChange} className="w-5 h-5 text-emerald-600 rounded focus:ring-emerald-500" />
                <span>Garaż / Miejsce postojowe</span>
              </label>
              <label className={checkboxContainerClass}>
                <input type="checkbox" name="hasBasement" checked={formData.hasBasement} onChange={handleChange} className="w-5 h-5 text-emerald-600 rounded focus:ring-emerald-500" />
                <span>Piwnica</span>
              </label>
              <label className={checkboxContainerClass}>
                <input type="checkbox" name="hasGas" checked={formData.hasGas} onChange={handleChange} className="w-5 h-5 text-emerald-600 rounded focus:ring-emerald-500" />
                <span>Gaz</span>
              </label>
               <label className={checkboxContainerClass}>
                <input type="checkbox" name="hasSewerage" checked={formData.hasSewerage} onChange={handleChange} className="w-5 h-5 text-emerald-600 rounded focus:ring-emerald-500" />
                <span>Kanalizacja / Szambo</span>
              </label>
              <label className={checkboxContainerClass}>
                <input type="checkbox" name="isHardAccess" checked={formData.isHardAccess} onChange={handleChange} className="w-5 h-5 text-emerald-600 rounded focus:ring-emerald-500" />
                <span>Dojazd utwardzony</span>
              </label>
            </div>
          </div>

          <div className="space-y-6 pt-6 border-t border-gray-100">
             {apiError && (
                <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-center font-medium">
                  ⚠️ {apiError}
                </div>
             )}

             {predictionData && !loading && (
                <div className="animate-fade-in space-y-6">
                  <div className="p-8 bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-2xl text-center shadow-md relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-2 bg-green-500"></div>
                    <p className="text-green-800 font-bold uppercase tracking-widest text-sm mb-3">
                      Szacowany Przedział Wartości
                    </p>
                    <div className="flex flex-col md:flex-row justify-center items-center gap-2 md:gap-4">
                        <span className="text-4xl md:text-5xl font-extrabold text-gray-900">
                          {predictionData.price_min.toLocaleString('pl-PL', { maximumFractionDigits: 0 })}
                        </span>
                        <span className="text-2xl text-gray-400 font-light">—</span>
                        <span className="text-4xl md:text-5xl font-extrabold text-green-700">
                          {predictionData.price_max.toLocaleString('pl-PL', { maximumFractionDigits: 0 })} zł
                        </span>
                    </div>
                  </div>

                  <div className="text-center text-xs text-gray-400">
                    Model wycenił nieruchomość na podstawie {Object.keys(predictionData.shap_values || {}).length} kluczowych cech.
                  </div>
                </div>
             )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full text-white font-bold py-4 rounded-xl shadow-lg text-lg transition
              ${loading 
                ? 'bg-gray-400 cursor-wait' 
                : 'bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 hover:-translate-y-0.5'
              }`}
          >
            {loading ? 'Obliczam wycenę...' : 'Oblicz Wycenę Domu'}
          </button>
        </form>
      </div>
    </div>
  );
}
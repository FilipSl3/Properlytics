'use client';

import { useState, useEffect } from 'react';
import api from '../api';
import FeatureImportanceChart from '../components/FeatureImportanceChart'; 

interface PredictionData {
  price_min: number;
  price_max: number;
  shap_values: Record<string, number>;
}

interface FormData {
  area: string | number;
  rooms: string | number;
  floor: string | number;
  totalFloors: string | number;
  year: string | number;
  buildType: string;
  material: string;
  heating: string;
  market: string;
  constructionStatus: string;
  city: string;
  district: string;
  province: string;
  hasLift: boolean;
  hasOutdoor: boolean;
  hasParking: boolean;
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

export default function FlatForm() {
  const [formData, setFormData] = useState<FormData>({
    area: '',
    rooms: '',
    floor: '',
    totalFloors: '',
    year: '',
    buildType: 'block',
    material: 'brick',
    heating: 'district',
    market: 'secondary',
    constructionStatus: 'ready_to_use',
    city: 'Warszawa',
    district: '',
    province: 'Mazowieckie',
    hasLift: false,
    hasOutdoor: false,
    hasParking: false,
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
    
    const isCheckbox = type === 'checkbox';
    const checked = isCheckbox ? (e.target as HTMLInputElement).checked : false;

    setFormData(prev => ({ 
      ...prev, 
      [name as keyof FormData]: isCheckbox ? checked : value 
    }));

    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
    if (predictionData) setPredictionData(null);
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    const currentYear = new Date().getFullYear();

    const area = Number(formData.area);
    if (!formData.area || area < 10) newErrors.area = "Min. 10 m²";
    if (area > 500) newErrors.area = "Max. 500 m²";

    const rooms = Number(formData.rooms);
    if (!formData.rooms || rooms < 1) newErrors.rooms = "Min. 1 pokój";
    if (rooms > 15) newErrors.rooms = "Max. 15 pokoi";

    const floor = Number(formData.floor);
    if (formData.floor === '' || floor < -1) newErrors.floor = "Min. -1 (piwnica)";
    if (floor > 50) newErrors.floor = "Max. 50 piętro";

    const totalFloors = Number(formData.totalFloors);
    if (formData.totalFloors === '' || totalFloors < 1) newErrors.totalFloors = "Min. 1 piętro";
    if (totalFloors > 50) newErrors.totalFloors = "Max. 50 pięter";
    if (floor > totalFloors) newErrors.floor = "Piętro nie może być wyższe niż budynek";

    const year = Number(formData.year);
    if (!formData.year || year < 1800) newErrors.year = "Zbyt stary rok";
    if (year > currentYear + 5) newErrors.year = "Rok z przyszłości?";

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
      area: Number(formData.area),
      rooms: Number(formData.rooms),
      floor: Number(formData.floor),
      totalFloors: Number(formData.totalFloors),
      year: Number(formData.year),
      hasLift: formData.hasLift ? 1 : 0,
      hasOutdoor: formData.hasOutdoor ? 1 : 0,
      hasParking: formData.hasParking ? 1 : 0,
    };

    try {
      const response = await api.post('/predict/flat', payload);
      setPredictionData(response.data);
    } catch (err: any) {
      console.error("Błąd API:", err);
      if (err.response) {
        setApiError(`Błąd serwera: ${err.response.status}. Sprawdź dane.`);
      } else if (err.request) {
        setApiError("Nie można połączyć się z serwerem. Upewnij się, że masz poprawne połączenie z Internetem.");
      } else {
        setApiError("Wystąpił nieoczekiwany błąd aplikacji.");
      }
    } finally {
      setLoading(false);
    }
  };

  const getChartData = () => {
    if (!predictionData?.shap_values) return [];

    return Object.entries(predictionData.shap_values)
      .filter(([key]) => {
          const k = key.toLowerCase();

          if (['area', 'rooms', 'floor', 'year'].some(x => k.includes(x))) return true;
          if (k.includes('lift') || k.includes('elevator')) return true;
          if ((k.includes('outdoor') || k.includes('balcony')) && formData.hasOutdoor) return true;
          if ((k.includes('parking') || k.includes('garage')) && formData.hasParking) return true;

          const selectionValues = [
            formData.buildType,
            formData.material, 
            formData.heating, 
            formData.constructionStatus,
            formData.market,
            formData.city,
            formData.province,
            formData.district 
          ]
          .filter(val => val !== '' && val !== null && val !== undefined)
          .map(s => s.toString().toLowerCase());

          return selectionValues.some(selection => k.includes(selection));
      })
      .map(([key, value]) => {
          let niceName = key;
          const k = key.toLowerCase();

          if (k.includes('total')) niceName = 'Liczba pięter w budynku';
          else if (k.includes('floor')) niceName = 'Piętro';
          else if (k.includes('area')) niceName = 'Metraż';
          else if (k.includes('rooms')) niceName = 'Liczba pokoi';
          else if (k.includes('year')) niceName = 'Rok budowy';
          
          else if (k.includes('lift') || k.includes('elevator')) niceName = 'Winda';
          
          else if (k.includes('outdoor') || k.includes('balcony')) niceName = 'Balkon / Ogród';
          else if (k.includes('parking') || k.includes('garage')) niceName = 'Miejsce parkingowe';

          else if (k.includes('market') && k.includes('secondary')) niceName = 'Rynek: Wtórny';
          else if (k.includes('market') && k.includes('primary')) niceName = 'Rynek: Pierwotny';
          
          else if (k.includes('city')) niceName = `Lokalizacja: ${formData.city}`;
          else if (k.includes('province') || k.includes('region')) niceName = `Woj.: ${formData.province}`;
          
          else if (k.includes('district')) niceName = formData.district ? `Dzielnica: ${formData.district}` : 'Dzielnica'; 

          else if (k.includes('finish') || k.includes('construction')) {
              if (k.includes('ready') || k.includes('use')) niceName = 'Stan: Do zamieszkania';
              else if (k.includes('completion') || k.includes('develop')) niceName = 'Stan: Do wykończenia';
              else if (k.includes('renovate') || k.includes('renovation')) niceName = 'Stan: Do remontu';
              else niceName = 'Stan wykończenia';
          }

          else if (k.includes('build')) {
              const types: Record<string, string> = { block: 'Blok', tenement: 'Kamienica', apartment: 'Apartamentowiec', house: 'Dom wielorodzinny' };
              const foundType = Object.keys(types).find(t => k.includes(t));
              niceName = `Typ: ${foundType ? types[foundType] : types[formData.buildType] || 'Inny'}`;
          }
          else if (k.includes('heating')) {
              const heats: Record<string, string> = { district: 'Miejskie', gas: 'Gazowe', electric: 'Elektryczne', boiler: 'Kotłownia' };
              niceName = `Ogrzewanie: ${heats[formData.heating] || formData.heating}`;
          }

          return { name: niceName, value };
      })
      .reduce((acc, curr) => {
          const existing = acc.find(item => item.name === curr.name);
          if (existing) existing.value += curr.value;
          else acc.push(curr);
          return acc;
      }, [] as { name: string, value: number }[])
      .sort((a, b) => Math.abs(b.value) - Math.abs(a.value))
      .filter(item => Math.abs(item.value) > 50); 
  };

  const getInputClass = (fieldName: string) => `
    w-full p-3 border rounded-lg outline-none transition bg-white
    ${errors[fieldName] ? 'border-red-500 ring-1 ring-red-500' : 'border-gray-300 focus:ring-blue-500'}
  `;

  const labelClass = "block text-sm font-medium text-gray-700 mb-1";

  return (
    <div className="max-w-4xl mx-auto py-8">
      <div className="bg-white shadow-2xl rounded-2xl p-8 border border-gray-100">
        <h2 className="text-3xl font-bold text-gray-900 mb-6 border-b pb-4 flex items-center gap-2">
          🏢 <span className="text-blue-600">Wycena Mieszkania</span>
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

            <div>
              <label className={labelClass}>Powierzchnia (m²)</label>
              <input type="number" name="area" value={formData.area} onChange={handleChange} className={getInputClass('area')} step="0.1" placeholder="np. 50" />
              {errors.area && <p className="text-red-500 text-xs mt-1">{errors.area}</p>}
            </div>

            <div>
              <label className={labelClass}>Liczba pokoi</label>
              <input type="number" name="rooms" value={formData.rooms} onChange={handleChange} className={getInputClass('rooms')} placeholder="np. 1"/>
              {errors.rooms && <p className="text-red-500 text-xs mt-1">{errors.rooms}</p>}
            </div>

            <div>
              <label className={labelClass}>Piętro</label>
              <input type="number" name="floor" value={formData.floor} onChange={handleChange} className={getInputClass('floor')} placeholder="0 = Parter" />
              {errors.floor && <p className="text-red-500 text-xs mt-1">{errors.floor}</p>}
            </div>

            <div>
              <label className={labelClass}>Liczba pięter w budynku</label>
              <input type="number" name="totalFloors" value={formData.totalFloors} onChange={handleChange} className={getInputClass('totalFloors')} placeholder="np. 4"/>
               {errors.totalFloors && <p className="text-red-500 text-xs mt-1">{errors.totalFloors}</p>}
            </div>

            <div>
              <label className={labelClass}>Rok budowy</label>
              <input type="number" name="year" value={formData.year} onChange={handleChange} className={getInputClass('year')} placeholder="np. 2026" />
              {errors.year && <p className="text-red-500 text-xs mt-1">{errors.year}</p>}
            </div>

             <div>
              <label className={labelClass}>Rodzaj zabudowy</label>
              <select name="buildType" value={formData.buildType} onChange={handleChange} className={getInputClass('buildType')}>
                <option value="block">Blok</option>
                <option value="tenement">Kamienica</option>
                <option value="apartment">Apartamentowiec</option>
                <option value="house">Dom wielorodzinny</option>
              </select>
            </div>
            <div>
              <label className={labelClass}>Materiał budynku</label>
              <select name="material" value={formData.material} onChange={handleChange} className={getInputClass('material')}>
                <option value="brick">Cegła</option>
                <option value="concrete_plate">Wielka płyta</option>
                <option value="concrete">Beton</option>
                <option value="silikat">Silikat</option>
                <option value="breezeblock">Pustak</option>
              </select>
            </div>
             <div>
              <label className={labelClass}>Ogrzewanie</label>
              <select name="heating" value={formData.heating} onChange={handleChange} className={getInputClass('heating')}>
                <option value="district">Miejskie</option>
                <option value="gas">Gazowe</option>
                <option value="electric">Elektryczne</option>
                <option value="boiler">Kotłownia</option>
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
              <label className={labelClass}>Stan wykończenia</label>
              <select name="constructionStatus" value={formData.constructionStatus} onChange={handleChange} className={getInputClass('constructionStatus')}>
                <option value="ready_to_use">Do zamieszkania</option>
                <option value="to_completion">Do wykończenia</option>
                <option value="to_renovation">Do remontu</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 border-t">
            <div>
               <label className={labelClass}>Miejscowość</label>
               <input
                 type="text"
                 name="city"
                 value={formData.city}
                 onChange={handleChange}
                 className={getInputClass('city')}
                 placeholder="np. Warszawa"
               />
               {errors.city && <p className="text-red-500 text-xs mt-1">{errors.city}</p>}
            </div>

            <div>
               <label className={labelClass}>Województwo</label>
               <select name="province" value={formData.province} onChange={handleChange} className={getInputClass('province')}>
                 {PROVINCES.map(prov => (
                   <option key={prov} value={prov}>{prov}</option>
                 ))}
               </select>
               {errors.province && <p className="text-red-500 text-xs mt-1">{errors.province}</p>}
            </div>

            <div>
               <label className={labelClass}>Dzielnica (opcjonalne)</label>
               <input type="text" name="district" value={formData.district} onChange={handleChange} className={getInputClass('district')} />
            </div>
          </div>

          <div className="pt-4 border-t">
            <label className={labelClass}>Udogodnienia</label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-2">
              <label className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                <input type="checkbox" name="hasLift" checked={formData.hasLift} onChange={handleChange} className="w-5 h-5 text-blue-600 rounded" />
                <span className="text-gray-700 font-medium">Winda</span>
              </label>
              <label className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                <input type="checkbox" name="hasOutdoor" checked={formData.hasOutdoor} onChange={handleChange} className="w-5 h-5 text-blue-600 rounded" />
                <span className="text-gray-700 font-medium">Balkon/Taras/Ogród</span>
              </label>
              <label className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                <input type="checkbox" name="hasParking" checked={formData.hasParking} onChange={handleChange} className="w-5 h-5 text-blue-600 rounded" />
                <span className="text-gray-700 font-medium">Miejsce parkingowe</span>
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

                  <div className="p-8 bg-gradient-to-br from-blue-50 to-emerald-50 border border-blue-200 rounded-2xl text-center shadow-md relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-2 bg-blue-500"></div>
                    <p className="text-blue-800 font-bold uppercase tracking-widest text-sm mb-3">
                      Szacowany Przedział Wartości
                    </p>
                    <div className="flex flex-col md:flex-row justify-center items-center gap-2 md:gap-4">
                        <span className="text-4xl md:text-5xl font-extrabold text-gray-900">
                          {predictionData.price_min.toLocaleString('pl-PL', { maximumFractionDigits: 0 })}
                        </span>
                        <span className="text-2xl text-gray-400 font-light">—</span>
                        <span className="text-4xl md:text-5xl font-extrabold text-blue-700">
                          {predictionData.price_max.toLocaleString('pl-PL', { maximumFractionDigits: 0 })} zł
                        </span>
                    </div>
                  </div>

                  {predictionData.shap_values && Object.keys(predictionData.shap_values).length > 0 && (
                      <div className="mt-6">
                         <FeatureImportanceChart data={getChartData()} />
                      </div>
                  )}
                  
                  <div className="text-center text-xs text-gray-400">
                    Model wycenił mieszkanie na podstawie kluczowych cech lokalnych.
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
                : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 hover:-translate-y-0.5'
              }`}
          >
            {loading ? 'Obliczam wycenę...' : 'Oblicz Wycenę Mieszkania'}
          </button>
        </form>
      </div>
    </div>
  );
}
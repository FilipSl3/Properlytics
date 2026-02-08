'use client';

import { useState, useEffect, useMemo } from 'react';
import api from '../api';
import FeatureImportanceChart from '../components/FeatureImportanceChart';
import PublishListingPanel from '../components/PublishListingPanel';
import { LISTING_ENDPOINTS } from './listings/listingUtils';

interface PredictionData {
  cena: number;
  price_min: number;
  price_max: number;
  shap_values: Record<string, number>;
}

interface FormData {
  area: string | number;
  type: string;
  locationType: string;
  city: string;
  province: string;
  hasElectricity: boolean;
  hasWater: boolean;
  hasGas: boolean;
  hasSewerage: boolean;
  isHardAccess: boolean;
  hasFence: boolean;
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

export default function PlotForm() {
  const [formData, setFormData] = useState<FormData>({
    area: '',
    type: 'building',
    locationType: 'suburban',
    city: 'Warszawa',
    province: 'Mazowieckie',
    hasElectricity: false,
    hasWater: false,
    hasGas: false,
    hasSewerage: false,
    isHardAccess: false,
    hasFence: false,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [predictionData, setPredictionData] = useState<PredictionData | null>(null);
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  useEffect(() => {
    const cityLower = formData.city.toString().trim().toLowerCase();
    if (CITY_TO_PROVINCE[cityLower]) {
      setFormData(prev => ({ ...prev, province: CITY_TO_PROVINCE[cityLower] }));
    }
  }, [formData.city]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const isCheckbox = type === 'checkbox';
    // Rzutowanie na HTMLInputElement, żeby dostać 'checked'
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
    const area = Number(formData.area);

    if (!formData.area || area < 100) newErrors.area = "Min. 100 m²";
    if (area > 1000000) newErrors.area = "Max. 100 ha (1 000 000 m²)";
    if (!formData.city.trim()) newErrors.city = "Wymagane";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    setApiError(null);
    setPredictionData(null);

    // Payload do predykcji (ML)
    const payload = {
      ...formData,
      area: Number(formData.area),
    };

    try {
      const response = await api.post('/predict/plot', payload);
      setPredictionData(response.data);
    } catch (err: any) {
      console.error("Błąd API:", err);
      if (err.response) setApiError(`Błąd serwera: ${err.response.status}. Sprawdź dane.`);
      else if (err.request) setApiError("Nie można połączyć się z serwerem. Sprawdź łącze internetowe.");
      else setApiError("Wystąpił nieoczekiwany błąd aplikacji.");
    } finally {
      setLoading(false);
    }
  };

  const getChartData = () => {
    if (!predictionData?.shap_values) return [];

    return Object.entries(predictionData.shap_values)
      .filter(([key]) => {
        const k = key.toLowerCase();
        if (k.includes('area')) return true;
        if (k.includes('electricity') && formData.hasElectricity) return true;
        if (k.includes('water') && formData.hasWater) return true;
        if (k.includes('gas') && formData.hasGas) return true;
        if (k.includes('sewerage') && formData.hasSewerage) return true;
        if ((k.includes('access') || k.includes('hard')) && formData.isHardAccess) return true;
        if (k.includes('fence') && formData.hasFence) return true;

        const selectionValues = [
          formData.type,
          formData.locationType,
          formData.city,
          formData.province
        ].map(s => s.toString().toLowerCase());

        return selectionValues.some(selection => k.includes(selection));
      })
      .map(([key, value]) => {
        let niceName = key;
        const k = key.toLowerCase();

        if (k.includes('area')) niceName = 'Powierzchnia działki';
        else if (k.includes('electricity')) niceName = 'Prąd';
        else if (k.includes('water')) niceName = 'Woda';
        else if (k.includes('gas')) niceName = 'Gaz';
        else if (k.includes('sewerage')) niceName = 'Kanalizacja';
        else if (k.includes('access') || k.includes('hard')) niceName = 'Dojazd utwardzony';
        else if (k.includes('fence')) niceName = 'Ogrodzenie';
        else if (k.includes('city')) niceName = `Lokalizacja: ${formData.city}`;
        else if (k.includes('province')) niceName = `Woj.: ${formData.province}`;
        else if (k.includes('type')) {
          const types: Record<string, string> = {
            building: 'Budowlana',
            agricultural: 'Rolna',
            agricultural_building: 'Rolno-budowlana',
            recreational: 'Rekreacyjna',
            commercial: 'Inwestycyjna',
            woodland: 'Leśna',
            habitat: 'Siedliskowa'
          };
          for (const [eng, pl] of Object.entries(types)) {
            if (k.includes(eng)) {
              niceName = `Typ: ${pl}`;
              break;
            }
          }
        }
        else if (k.includes('location')) {
          const locs: Record<string, string> = { city: 'Miejskie', suburban: 'Podmiejskie', country: 'Wiejskie' };
          niceName = `Położenie: ${locs[formData.locationType] || formData.locationType}`;
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

 
  const plotFeaturesForListing = useMemo(() => {
    if (!predictionData) return null;
    
    
    return {
      
      plot_type: formData.type,       
      area: Number(formData.area),
      city: formData.city,
      province: formData.province,
      district: "",                  

      
      has_electricity: formData.hasElectricity ? 1 : 0,
      has_water: formData.hasWater ? 1 : 0,
      has_gas: formData.hasGas ? 1 : 0,
      has_sewage: formData.hasSewerage ? 1 : 0,
      is_fenced: formData.hasFence ? 1 : 0,
      
      
      access_road: formData.isHardAccess ? "utwardzona" : "polna",
    };
  }, [predictionData, formData]);

  const getInputClass = (fieldName: string) => `
    w-full p-3 border rounded-lg outline-none transition bg-white
    ${errors[fieldName] ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-amber-500'}
  `;

  const labelClass = "block text-sm font-medium text-gray-700 mb-1";
  const checkboxContainerClass = "flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition cursor-pointer hover:border-amber-200";

  return (
    <div className="max-w-3xl mx-auto py-8">
      <div className="bg-white shadow-2xl rounded-2xl p-8 border border-gray-100">
        <h2 className="text-3xl font-bold text-gray-900 mb-6 border-b pb-4 flex items-center gap-2">
          🌱 <span className="text-amber-600">Wycena Działki</span>
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className={labelClass}>Powierzchnia (m²)</label>
              <input type="number" name="area" value={formData.area} onChange={handleChange} className={getInputClass('area')} step="1" placeholder="np. 1500" />
              {errors.area && <p className="text-red-500 text-xs mt-1">{errors.area}</p>}
            </div>

            <div>
              <label className={labelClass}>Typ Działki</label>
              <select name="type" value={formData.type} onChange={handleChange} className={getInputClass('type')}>
                <option value="building">Budowlana</option>
                <option value="agricultural">Rolna</option>
                <option value="agricultural_building">Rolno-budowlana</option>
                <option value="recreational">Rekreacyjna</option>
                <option value="commercial">Inwestycyjna / Komercyjna</option>
                <option value="woodland">Leśna</option>
                <option value="habitat">Siedliskowa</option>
              </select>
            </div>

            <div>
              <label className={labelClass}>Położenie</label>
              <select name="locationType" value={formData.locationType} onChange={handleChange} className={getInputClass('locationType')}>
                <option value="city">Miejskie</option>
                <option value="suburban">Podmiejskie</option>
                <option value="country">Wiejskie</option>
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

          <div className="pt-4 border-t">
            <label className={labelClass}>Media i Infrastruktura</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-2">
              <label className={checkboxContainerClass}>
                <input type="checkbox" name="hasElectricity" checked={formData.hasElectricity} onChange={handleChange} className="w-5 h-5 text-amber-600 rounded focus:ring-amber-500" />
                <span>Prąd</span>
              </label>
              <label className={checkboxContainerClass}>
                <input type="checkbox" name="hasWater" checked={formData.hasWater} onChange={handleChange} className="w-5 h-5 text-amber-600 rounded focus:ring-amber-500" />
                <span>Woda</span>
              </label>
              <label className={checkboxContainerClass}>
                <input type="checkbox" name="hasGas" checked={formData.hasGas} onChange={handleChange} className="w-5 h-5 text-amber-600 rounded focus:ring-amber-500" />
                <span>Gaz</span>
              </label>
              <label className={checkboxContainerClass}>
                <input type="checkbox" name="hasSewerage" checked={formData.hasSewerage} onChange={handleChange} className="w-5 h-5 text-amber-600 rounded focus:ring-amber-500" />
                <span>Kanalizacja</span>
              </label>
              <label className={checkboxContainerClass}>
                <input type="checkbox" name="isHardAccess" checked={formData.isHardAccess} onChange={handleChange} className="w-5 h-5 text-amber-600 rounded focus:ring-amber-500" />
                <span>Dojazd utwardzony</span>
              </label>
              <label className={checkboxContainerClass}>
                <input type="checkbox" name="hasFence" checked={formData.hasFence} onChange={handleChange} className="w-5 h-5 text-amber-600 rounded focus:ring-amber-500" />
                <span>Ogrodzenie</span>
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
                <div className="p-8 bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 rounded-2xl text-center shadow-md relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-2 bg-amber-500"></div>
                  <p className="text-amber-800 font-bold uppercase tracking-widest text-sm mb-3">
                    Szacowana Wartość Działki
                  </p>
                  <div className="flex flex-col md:flex-row justify-center items-center gap-2 md:gap-4">
                    <span className="text-4xl md:text-5xl font-extrabold text-gray-900">
                      {predictionData.price_min.toLocaleString('pl-PL', { maximumFractionDigits: 0 })}
                    </span>
                    <span className="text-2xl text-gray-400 font-light">—</span>
                    <span className="text-4xl md:text-5xl font-extrabold text-amber-700">
                      {predictionData.price_max.toLocaleString('pl-PL', { maximumFractionDigits: 0 })} zł
                    </span>
                  </div>
                </div>

                {predictionData.shap_values && Object.keys(predictionData.shap_values).length > 0 && (
                  <div className="mt-6">
                    <FeatureImportanceChart data={getChartData()} />
                  </div>
                )}

                {/* --- COMPONENT DO WYSTAWIANIA OGŁOSZEŃ --- */}
                {plotFeaturesForListing && (
                  <PublishListingPanel
                    kind="plots"
                    endpoint={LISTING_ENDPOINTS.plots}
                    features={plotFeaturesForListing}
                    suggestedMin={predictionData.price_min}
                    suggestedMax={predictionData.price_max}
                    defaultTitle={`Działka ${formData.area} m², ${formData.city}`}
                  />
                )}

                <div className="text-center text-xs text-gray-400">
                  Model wycenił działkę na podstawie cech terenu i mediów.
                </div>
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full text-white font-bold py-4 rounded-xl shadow-lg text-lg transition
              ${loading ? 'bg-gray-400 cursor-wait' : 'bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700'}`}
          >
            {loading ? 'Obliczam wycenę...' : 'Oblicz Wycenę Działki'}
          </button>
        </form>
      </div>
    </div>
  );
}
import { useState } from 'react';

export default function HouseForm() {
  const [formData, setFormData] = useState({
    areaHouse: '',
    areaPlot: '',
    rooms: '',
    buildType: 'detached',
    constructionStatus: 'ready_to_use',
    market: 'secondary',
    floors: '',
    year: '',
    material: 'brick',
    roofType: 'tile',
    city: 'Warszawa',
    province: 'Mazowieckie',

    hasGarage: false,
    hasBasement: false,
    hasGas: false,
    hasSewerage: false,
    isHardAccess: false,

    fenceType: '',
    heatingType: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

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
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    const currentYear = new Date().getFullYear();

    if (!formData.areaHouse || Number(formData.areaHouse) <= 0) newErrors.areaHouse = "Wymagane";
    if (!formData.areaPlot || Number(formData.areaPlot) <= 0) newErrors.areaPlot = "Wymagane";
    if (!formData.rooms || Number(formData.rooms) <= 0) newErrors.rooms = "Wymagane";
    if (!formData.year || Number(formData.year) < 1800 || Number(formData.year) > currentYear + 5) newErrors.year = "Błędny rok";
    if (!formData.city.trim()) newErrors.city = "Wymagane";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      console.log("Dane domu:", formData);
      alert("Dane poprawne.");
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
              <input type="number" name="areaHouse" value={formData.areaHouse} onChange={handleChange} className={getInputClass('areaHouse')} step="0.1" />
            </div>
            <div>
              <label className={labelClass}>Powierzchnia Działki (m²)</label>
              <input type="number" name="areaPlot" value={formData.areaPlot} onChange={handleChange} className={getInputClass('areaPlot')} step="1" />
            </div>
            <div>
              <label className={labelClass}>Liczba pokoi</label>
              <input type="number" name="rooms" value={formData.rooms} onChange={handleChange} className={getInputClass('rooms')} />
            </div>
            <div>
              <label className={labelClass}>Rok budowy</label>
              <input type="number" name="year" value={formData.year} onChange={handleChange} className={getInputClass('year')} />
            </div>
            <div>
              <label className={labelClass}>Liczba pięter</label>
              <input type="number" name="floors" value={formData.floors} onChange={handleChange} className={getInputClass('floors')} />
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
              <label className={labelClass}>Pokrycie dachu</label>
              <select name="roofType" value={formData.roofType} onChange={handleChange} className={getInputClass('roofType')}>
                <option value="tile">Dachówka</option>
                <option value="sheet">Blacha</option>
                <option value="shingle">Gont</option>
                <option value="slate">Łupek</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t">
            <div>
               <label className={labelClass}>Miejscowość</label>
               <input type="text" name="city" value={formData.city} onChange={handleChange} className={getInputClass('city')} />
            </div>
            <div>
               <label className={labelClass}>Województwo</label>
               <input type="text" name="province" value={formData.province} onChange={handleChange} className={getInputClass('province')} />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t">
             <div>
               <label className={labelClass}>Rodzaj Ogrzewania</label>
               <select name="heatingType" value={formData.heatingType} onChange={handleChange} className={getInputClass('heatingType')}>
                 <option value="">Brak informacji</option>
                 <option value="gas">Gazowe</option>
                 <option value="heat_pump">Pompa ciepła</option>
                 <option value="coal">Węglowe</option>
                 <option value="electric">Elektryczne</option>
                 <option value="fireplace">Kominek</option>
               </select>
             </div>
             <div>
               <label className={labelClass}>Typ Ogrodzenia</label>
               <select name="fenceType" value={formData.fenceType} onChange={handleChange} className={getInputClass('fenceType')}>
                 <option value="">Brak</option>
                 <option value="metal">Metalowe</option>
                 <option value="wire">Siatka</option>
                 <option value="brick">Murowane</option>
                 <option value="wood">Drewniane</option>
                 <option value="concrete">Betonowe</option>
                 <option value="mixed">Mieszane</option>
                 <option value="tak">Inne</option>
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

          <button type="submit" className="w-full bg-gradient-to-r from-emerald-600 to-green-600 text-white font-bold py-4 rounded-xl hover:from-emerald-700 hover:to-green-700 transition shadow-lg text-lg">
            Oblicz Wycenę Domu
          </button>
        </form>
      </div>
    </div>
  );
}
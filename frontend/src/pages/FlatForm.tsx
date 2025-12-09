import { useState } from 'react';

export default function FlatForm() {
  const [formData, setFormData] = useState({
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
    hasOutdoor: false, // Balkon/Taras/Ogródek
    hasParking: false,
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

    if (!formData.area || Number(formData.area) <= 0) newErrors.area = "Wymagane";
    if (!formData.rooms || Number(formData.rooms) <= 0) newErrors.rooms = "Wymagane";
    if (formData.floor === '') newErrors.floor = "Wymagane";
    if (!formData.year || Number(formData.year) < 1800 || Number(formData.year) > currentYear + 5) newErrors.year = "Błędny rok";
    if (!formData.city.trim()) newErrors.city = "Wymagane";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      console.log("Dane mieszkania:", formData);
      alert("Dane poprawne.");
    }
  };

  const getInputClass = (fieldName: string) => `
    w-full p-3 border rounded-lg outline-none transition bg-white
    ${errors[fieldName] 
      ? 'border-red-500 focus:ring-red-500' 
      : 'border-gray-300 focus:ring-blue-500'}
  `;

  const labelClass = "block text-sm font-medium text-gray-700 mb-1";
  const checkboxContainerClass = "flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition cursor-pointer hover:border-blue-200";

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
              <input type="number" name="area" value={formData.area} onChange={handleChange} className={getInputClass('area')} step="0.1" />
            </div>
            <div>
              <label className={labelClass}>Liczba pokoi</label>
              <input type="number" name="rooms" value={formData.rooms} onChange={handleChange} className={getInputClass('rooms')} />
            </div>
            <div>
              <label className={labelClass}>Piętro (0 = Parter)</label>
              <input type="number" name="floor" value={formData.floor} onChange={handleChange} className={getInputClass('floor')} />
            </div>
            <div>
              <label className={labelClass}>Liczba pięter w budynku</label>
              <input type="number" name="totalFloors" value={formData.totalFloors} onChange={handleChange} className={getInputClass('totalFloors')} />
            </div>
            <div>
              <label className={labelClass}>Rok budowy</label>
              <input type="number" name="year" value={formData.year} onChange={handleChange} className={getInputClass('year')} />
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
               <input type="text" name="city" value={formData.city} onChange={handleChange} className={getInputClass('city')} />
            </div>
            <div>
               <label className={labelClass}>Dzielnica</label>
               <input type="text" name="district" value={formData.district} onChange={handleChange} className={getInputClass('district')} />
            </div>
             <div>
               <label className={labelClass}>Województwo</label>
               <input type="text" name="province" value={formData.province} onChange={handleChange} className={getInputClass('province')} />
            </div>
          </div>

          <div className="pt-4 border-t">
            <label className={labelClass}>Udogodnienia</label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-2">
              <label className={checkboxContainerClass}>
                <input type="checkbox" name="hasLift" checked={formData.hasLift} onChange={handleChange} className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500" />
                <span className="text-gray-700 font-medium">Winda</span>
              </label>
              <label className={checkboxContainerClass}>
                <input type="checkbox" name="hasOutdoor" checked={formData.hasOutdoor} onChange={handleChange} className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500" />
                <span className="text-gray-700 font-medium">Balkon / Taras / Ogródek</span>
              </label>
              <label className={checkboxContainerClass}>
                <input type="checkbox" name="hasParking" checked={formData.hasParking} onChange={handleChange} className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500" />
                <span className="text-gray-700 font-medium">Miejsce parkingowe</span>
              </label>
            </div>
          </div>

          <button type="submit" className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold py-4 rounded-xl hover:from-blue-700 hover:to-indigo-700 transition shadow-lg text-lg">
            Oblicz Wycenę Mieszkania
          </button>
        </form>
      </div>
    </div>
  );
}
import { useState } from 'react';

export default function PlotForm() {
  const [formData, setFormData] = useState({
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
    if (!formData.area || Number(formData.area) <= 0) newErrors.area = "Wymagane";
    if (!formData.city.trim()) newErrors.city = "Wymagane";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      console.log("Dane działki:", formData);
      alert("Dane poprawne.");
    }
  };

  const getInputClass = (fieldName: string) => `
    w-full p-3 border rounded-lg outline-none transition bg-white
    ${errors[fieldName] 
      ? 'border-red-500 focus:ring-red-500' 
      : 'border-gray-300 focus:ring-amber-500'}
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
              <input type="number" name="area" value={formData.area} onChange={handleChange} className={getInputClass('area')} step="1" />
            </div>
             <div>
              <label className={labelClass}>Typ Działki</label>
              <select name="type" value={formData.type} onChange={handleChange} className={getInputClass('type')}>
                <option value="building">Budowlana</option>
                <option value="agricultural">Rolna</option>
                <option value="recreational">Rekreacyjna</option>
                <option value="investment">Inwestycyjna</option>
                <option value="forest">Leśna</option>
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
               <input type="text" name="city" value={formData.city} onChange={handleChange} className={getInputClass('city')} />
            </div>
            <div>
               <label className={labelClass}>Województwo</label>
               <input type="text" name="province" value={formData.province} onChange={handleChange} className={getInputClass('province')} />
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

          <button type="submit" className="w-full bg-gradient-to-r from-amber-500 to-orange-600 text-white font-bold py-4 rounded-xl hover:from-amber-600 hover:to-orange-700 transition shadow-lg text-lg">
            Oblicz Wycenę Działki
          </button>
        </form>
      </div>
    </div>
  );
}
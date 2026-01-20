import React from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Cell,
  ReferenceLine
} from 'recharts';

interface ChartProps {
  data: { name: string; value: number }[];
}

const FeatureImportanceChart: React.FC<ChartProps> = ({ data }) => {
  
  if (!data || data.length === 0) {
    return <div className="text-center text-gray-400 p-4">Brak danych do analizy XAI</div>;
  }


  const chartHeight = data.length * 50 + 60;

  return (
    <div className="w-full bg-white rounded-lg shadow-sm border border-slate-100 p-4">
      <h3 className="text-md font-bold mb-2 text-center text-slate-700">
        Dlaczego taka cena? (Analiza XAI)
      </h3>
      
      {}
      <div style={{ height: `${chartHeight}px`, width: '100%' }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            layout="vertical"
            data={data}
            margin={{ top: 5, right: 30, left: 10, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
            
            {}
            <XAxis type="number" hide />
            
            {}
            <YAxis 
              dataKey="name" 
              type="category" 
              width={160}
              tick={{ fontSize: 12, fill: '#475569' }}
              interval={0} 
            />
            
            <Tooltip 
            cursor={{ fill: '#f8fafc' }}
            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
            
            formatter={(value: any) => {
           
              const val = Number(value); 
              return [
                <span key="val" className={val > 0 ? "text-green-600 font-bold" : "text-red-600 font-bold"}>
                  {val > 0 ? '+' : ''}{val.toLocaleString('pl-PL')} PLN
                </span>, 
                'Wpływ'
              ];
            }}
          />
            
            {}
            <ReferenceLine x={0} stroke="#94a3b8" />

            <Bar dataKey="value" barSize={24} radius={[4, 4, 4, 4]}>
              {data.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={entry.value >= 0 ? '#22c55e' : '#ef4444'} 
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default FeatureImportanceChart;
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface ChartProps {
  data: { name: string; value: number }[];
}

const FeatureImportanceChart: React.FC<ChartProps> = ({ data }) => {
  return (
    <div className="w-full h-80 p-4 bg-white rounded-lg shadow-sm border border-slate-100">
      <h3 className="text-md font-bold mb-4 text-center text-slate-700">
        Dlaczego taka cena? (Analiza XAI)
      </h3>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          layout="vertical"
          data={data}
          margin={{ top: 5, right: 30, left: 80, bottom: 5 }} // Większy margines dla długich nazw
        >
          <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={true} stroke="#e2e8f0" />
          <XAxis type="number" hide />
          <YAxis 
            dataKey="name" 
            type="category" 
            width={140} 
            tick={{ fontSize: 11, fill: '#475569' }} 
          />
          <Tooltip 
            cursor={{ fill: '#f1f5f9' }}
            formatter={(value: number) => [`${value.toLocaleString()} PLN`, 'Wpływ na cenę']}
          />
          <Bar dataKey="value" barSize={20} radius={[4, 4, 4, 4]}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.value > 0 ? '#22c55e' : '#ef4444'} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default FeatureImportanceChart;
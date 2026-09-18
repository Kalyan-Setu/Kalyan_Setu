import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell
} from 'recharts';

export default function DistrictHeatmap({ complaints = [] }) {
  // Aggregate complaints by district dynamically
  const districtMap = {};

  // Pre-seed common districts if list is small so chart is rich
  const initialDistricts = [
    'South District',
    'Central District',
    'East District',
    'North District',
    'West District'
  ];

  initialDistricts.forEach(d => {
    districtMap[d] = {
      district: d,
      Total: 0,
      Critical: 0,
      Resolved: 0,
      In_Progress: 0,
      categories: {}
    };
  });

  complaints.forEach(c => {
    const distName = c.district || 'Unassigned District';
    if (!districtMap[distName]) {
      districtMap[distName] = {
        district: distName,
        Total: 0,
        Critical: 0,
        Resolved: 0,
        In_Progress: 0,
        categories: {}
      };
    }

    districtMap[distName].Total += 1;
    if ((c.aiSeverityScore || c.ai_severity_score || 0) >= 80) districtMap[distName].Critical += 1;
    if (c.status === 'Resolved') districtMap[distName].Resolved += 1;
    if (c.status === 'In Progress' || c.status === 'Action Assigned') districtMap[distName].In_Progress += 1;

    const cat = c.category || 'General';
    districtMap[distName].categories[cat] = (districtMap[distName].categories[cat] || 0) + 1;
  });

  const chartData = Object.values(districtMap);

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-surface-container-highest border border-outline-variant p-3 rounded shadow-elevation-2 text-xs">
          <div className="font-bold text-primary mb-1 border-b border-outline-variant/60 pb-1">{label}</div>
          <div className="space-y-1 text-on-surface">
            <div className="flex justify-between gap-4">
              <span>Total Grievances:</span>
              <span className="font-bold text-primary">{data.Total}</span>
            </div>
            <div className="flex justify-between gap-4">
              <span>Resolved:</span>
              <span className="font-bold text-gov-green">{data.Resolved}</span>
            </div>
            <div className="flex justify-between gap-4">
              <span>In Progress:</span>
              <span className="font-bold text-gov-saffron">{data.In_Progress}</span>
            </div>
            <div className="flex justify-between gap-4">
              <span>High Risk (AI ≥ 80):</span>
              <span className="font-bold text-error">{data.Critical}</span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg p-md shadow-ambient">
      <div className="flex justify-between items-center mb-md border-b border-outline-variant pb-2">
        <div>
          <h3 className="text-sm font-bold text-primary flex items-center gap-1.5">
            <span className="material-symbols-outlined text-base">map</span>
            <span>District Hotspot Heatmap & Grievance Distribution</span>
          </h3>
          <p className="text-[11px] text-on-surface-variant">
            Interactive chart showing district load, severity counts, and redressal progress
          </p>
        </div>
        <span className="bg-primary-container/10 text-primary border border-primary/20 text-[10px] font-bold px-2 py-0.5 rounded">
          Live Heatmap Matrix
        </span>
      </div>

      <div className="h-72 w-full pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 10, right: 20, left: -10, bottom: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="district" tick={{ fontSize: 11 }} interval={0} />
            <YAxis tick={{ fontSize: 11 }} />
            <Tooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
            <Bar dataKey="Total" fill="#1b365d" name="Total Grievances" radius={[4, 4, 0, 0]} />
            <Bar dataKey="Resolved" fill="#16a34a" name="Resolved" radius={[4, 4, 0, 0]} />
            <Bar dataKey="In_Progress" fill="#d97706" name="In Progress" radius={[4, 4, 0, 0]} />
            <Bar dataKey="Critical" fill="#dc2626" name="Critical Alert" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

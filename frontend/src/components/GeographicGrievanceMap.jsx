import React, { useState, useMemo } from 'react';

export default function GeographicGrievanceMap({ complaints = [], navigateTo, stateName = "Delhi NCR" }) {
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [criticalOnly, setCriticalOnly] = useState(false);
  const [mapStyle, setMapStyle] = useState('dark'); // 'dark' | 'satellite' | 'topo'
  const [activePin, setActivePin] = useState(null);

  // Generate deterministic pseudo-random map positions (lat/lng and X/Y percentages) for complaints
  const mapPoints = useMemo(() => {
    if (!complaints || complaints.length === 0) {
      // Fallback default demo points if no complaints loaded
      return [
        { id: 'PP24891', title: 'Deep Crater Pothole Hazard', category: 'Road Infrastructure', district: 'East District', priority: 'Critical', severity: 92, x: 62, y: 35, lat: 28.629, lng: 77.281 },
        { id: 'PP24892', title: 'Stormwater Drainage Overflow', category: 'Monsoon Drainage', district: 'South District', priority: 'High', severity: 84, x: 45, y: 68, lat: 28.541, lng: 77.210 },
        { id: 'PP24893', title: 'Public Streetlight Outage Corridor', category: 'Public Lighting', district: 'Central District', priority: 'Critical', severity: 88, x: 50, y: 48, lat: 28.613, lng: 77.209 },
        { id: 'PP24894', title: 'Garbage Dump Accumulation', category: 'Sanitation', district: 'North District', priority: 'Medium', severity: 65, x: 38, y: 25, lat: 28.692, lng: 77.185 },
        { id: 'PP24895', title: 'Burst Water Pipeline Supply Interruption', category: 'Water Supply', district: 'Bhubaneswar', priority: 'Critical', severity: 95, x: 75, y: 55, lat: 28.580, lng: 77.310 },
      ];
    }

    return complaints.map((c, index) => {
      // Create a deterministic hash for unique coordinate placement across 15% to 85% range
      const hashStr = (c.id || c.display_id || c.title || '') + index;
      let hash = 0;
      for (let i = 0; i < hashStr.length; i++) {
        hash = (hash << 5) - hash + hashStr.charCodeAt(i);
        hash |= 0;
      }
      
      const absHash = Math.abs(hash);
      // Map x between 18% and 82%
      const x = 18 + (absHash % 65);
      // Map y between 20% and 80%
      const y = 20 + (Math.floor(absHash / 65) % 60);

      const lat = (28.50 + (y / 100) * 0.35).toFixed(4);
      const lng = (77.10 + (x / 100) * 0.35).toFixed(4);

      const severity = c.aiSeverityScore || c.ai_severity_score || (c.priority === 'Critical' ? 90 : c.priority === 'High' ? 75 : 60);

      return {
        ...c,
        id: c.id || c.display_id || `PP${24890 + index}`,
        title: c.title || 'Civic Infrastructure Grievance',
        category: c.category || 'Road Infrastructure',
        district: c.district || c.location || 'Central District',
        priority: c.priority || (severity >= 85 ? 'Critical' : 'High'),
        severity,
        x,
        y,
        lat,
        lng
      };
    });
  }, [complaints]);

  // Filtered points based on controls
  const filteredPoints = useMemo(() => {
    return mapPoints.filter(p => {
      if (selectedCategory !== 'ALL' && p.category !== selectedCategory) return false;
      if (criticalOnly && p.priority !== 'Critical') return false;
      return true;
    });
  }, [mapPoints, selectedCategory, criticalOnly]);

  // Categories list for filter
  const categoriesList = useMemo(() => {
    const set = new Set(mapPoints.map(p => p.category));
    return ['ALL', ...Array.from(set)];
  }, [mapPoints]);

  return (
    <div className="w-full bg-surface-container-lowest border border-outline-variant rounded-xl p-md md:p-lg shadow-ambient mb-lg overflow-hidden flex flex-col">
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 mb-md border-b border-outline-variant pb-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-xl text-error animate-pulse">radar</span>
            <h2 className="text-base font-bold text-primary">
              Geographic Incident Map & Spatial Intelligence
            </h2>
            <span className="bg-error/10 text-error border border-error/30 text-[10px] font-bold font-mono px-2 py-0.5 rounded-full flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-error animate-ping"></span>
              🔴 {filteredPoints.length} Red Incident Pins Plotted
            </span>
          </div>
          <p className="text-xs text-on-surface-variant mt-1">
            Real-time GIS telemetry showing all reported citizen grievances pinned across {stateName}
          </p>
        </div>

        {/* Filter Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="text-xs bg-surface border border-outline-variant rounded px-2.5 py-1 text-on-surface font-semibold outline-none focus:border-primary"
          >
            {categoriesList.map(cat => (
              <option key={cat} value={cat}>
                {cat === 'ALL' ? 'All Departments' : cat}
              </option>
            ))}
          </select>

          {/* Critical Only Toggle */}
          <button
            onClick={() => setCriticalOnly(!criticalOnly)}
            className={`text-xs font-bold px-3 py-1 rounded border flex items-center gap-1 transition-all ${
              criticalOnly
                ? 'bg-error text-white border-error shadow-sm'
                : 'bg-surface text-on-surface border-outline-variant hover:bg-surface-container'
            }`}
          >
            <span className="material-symbols-outlined text-sm">warning</span>
            <span>Critical Only</span>
          </button>

          {/* Map Style Selector */}
          <div className="flex items-center bg-surface border border-outline-variant rounded p-0.5 text-xs font-semibold">
            <button
              onClick={() => setMapStyle('dark')}
              className={`px-2 py-0.5 rounded ${mapStyle === 'dark' ? 'bg-primary text-white font-bold' : 'text-on-surface-variant'}`}
            >
              GIS Dark
            </button>
            <button
              onClick={() => setMapStyle('satellite')}
              className={`px-2 py-0.5 rounded ${mapStyle === 'satellite' ? 'bg-primary text-white font-bold' : 'text-on-surface-variant'}`}
            >
              Satellite
            </button>
          </div>
        </div>
      </div>

      {/* Main Interactive Geographic Map Canvas */}
      <div className="relative w-full h-[480px] rounded-xl overflow-hidden border border-outline-variant bg-slate-950 shadow-inner group">
        {/* Background GIS Map Pattern */}
        <div
          className={`absolute inset-0 transition-opacity duration-500 ${
            mapStyle === 'satellite' ? 'opacity-90 bg-cover bg-center' : 'opacity-80'
          }`}
          style={{
            backgroundImage: mapStyle === 'satellite'
              ? `radial-gradient(circle at 50% 50%, rgba(15, 23, 42, 0.4), rgba(2, 6, 23, 0.9)), url('https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&w=1600&q=80')`
              : 'none'
          }}
        >
          {/* Tactical GIS Grid overlay */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:3rem_3rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-60"></div>
          
          {/* Topographic Contour Lines / Rivers Representation */}
          <svg className="absolute inset-0 w-full h-full opacity-20 pointer-events-none" xmlns="http://www.w3.org/2000/svg">
            <path d="M 0 120 Q 200 180 400 100 T 800 160 T 1200 90 T 1600 200" fill="none" stroke="#38bdf8" strokeWidth="2.5" strokeDasharray="6,4" />
            <path d="M 0 350 Q 300 250 600 380 T 1200 310 T 1600 420" fill="none" stroke="#38bdf8" strokeWidth="1.5" strokeDasharray="4,4" />
            <circle cx="50%" cy="50%" r="220" fill="none" stroke="#f43f5e" strokeWidth="1" strokeDasharray="4,6" className="animate-spin-slow opacity-40" />
            <circle cx="50%" cy="50%" r="380" fill="none" stroke="#94a3b8" strokeWidth="0.5" strokeDasharray="8,8" />
          </svg>
        </div>

        {/* GIS Coordinates & Scale HUD Overlay */}
        <div className="absolute top-3 left-3 z-10 bg-slate-900/80 backdrop-blur border border-slate-700/60 rounded px-2.5 py-1.5 text-[10px] font-mono text-slate-300 flex flex-col gap-0.5 shadow-md">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="font-bold text-white">GIS SATELLITE TELEMETRY</span>
          </div>
          <div>REGION: <span className="text-gov-saffron font-bold">{stateName.toUpperCase()}</span></div>
          <div>GRID: 28.6139° N, 77.2090° E</div>
        </div>

        {/* Compass / Scale HUD */}
        <div className="absolute top-3 right-3 z-10 bg-slate-900/80 backdrop-blur border border-slate-700/60 rounded px-2.5 py-1 text-[10px] font-mono text-slate-300 flex items-center gap-3 shadow-md">
          <span className="flex items-center gap-1">
            <span className="material-symbols-outlined text-sm text-gov-saffron">explore</span>
            <span>N 0°</span>
          </span>
          <span className="text-slate-500">|</span>
          <span>SCALE 1:50,000</span>
        </div>

        {/* Red Incident Pins (redpoints) Layer */}
        {filteredPoints.map((point) => {
          const isSelected = activePin?.id === point.id;
          const isCritical = point.priority === 'Critical' || point.severity >= 85;

          return (
            <div
              key={point.id}
              style={{ left: `${point.x}%`, top: `${point.y}%` }}
              onClick={() => setActivePin(point)}
              className="absolute -translate-x-1/2 -translate-y-1/2 z-20 cursor-pointer group/pin transition-all hover:scale-125"
            >
              {/* Pulsing Sonar Halo Ring for Red Incident Points */}
              <div
                className={`absolute inset-0 -m-3 rounded-full ${
                  isCritical ? 'bg-red-500/40 animate-ping' : 'bg-rose-500/20'
                }`}
              ></div>

              {/* Glowing Outer Halo */}
              <div
                className={`absolute inset-0 -m-1.5 rounded-full ${
                  isCritical ? 'bg-red-600/60 blur-[3px]' : 'bg-rose-500/40'
                }`}
              ></div>

              {/* Core Solid Red Incident Point Icon */}
              <div
                className={`relative flex items-center justify-center w-7 h-7 rounded-full shadow-lg transition-transform ${
                  isSelected
                    ? 'bg-red-500 text-white ring-4 ring-white scale-125 z-30'
                    : isCritical
                    ? 'bg-gradient-to-tr from-red-700 to-red-500 text-white ring-2 ring-red-300'
                    : 'bg-red-600 text-white ring-2 ring-red-200'
                }`}
              >
                <span className="material-symbols-outlined text-base font-bold">
                  {point.category?.toLowerCase().includes('water') || point.category?.toLowerCase().includes('drain') ? 'water_drop' :
                   point.category?.toLowerCase().includes('light') ? 'lightbulb' : 'location_on'}
                </span>
              </div>

              {/* Pin Label Badge on Hover */}
              <div className="absolute top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover/pin:opacity-100 transition-opacity bg-slate-900/95 text-white text-[10px] font-bold px-2 py-1 rounded shadow-xl whitespace-nowrap pointer-events-none border border-slate-700 z-40">
                {point.title} ({point.district})
              </div>
            </div>
          );
        })}

        {/* Selected Incident Popup Card Overlay */}
        {activePin && (
          <div className="absolute bottom-4 left-4 right-4 md:left-auto md:right-4 z-40 md:w-96 bg-slate-900/95 backdrop-blur border border-slate-700 text-white p-4 rounded-xl shadow-2xl animate-in fade-in slide-in-from-bottom-4">
            <div className="flex justify-between items-start gap-2 mb-2">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping"></span>
                <span className="text-[10px] font-mono text-red-400 font-bold uppercase tracking-wider">
                  INCIDENT #{activePin.id}
                </span>
              </div>
              <button
                onClick={() => setActivePin(null)}
                className="text-slate-400 hover:text-white text-xs p-0.5"
              >
                ✕
              </button>
            </div>

            <h3 className="font-bold text-sm text-white mb-1 leading-snug">
              {activePin.title}
            </h3>
            
            <p className="text-xs text-slate-300 mb-3 leading-relaxed">
              📍 <strong className="text-gov-saffron">{activePin.district}</strong> • {activePin.category}
            </p>

            <div className="grid grid-cols-2 gap-2 mb-3 bg-slate-800/80 p-2 rounded-lg text-[11px]">
              <div>
                <span className="text-slate-400 block text-[10px]">AI SEVERITY</span>
                <span className="font-bold text-red-400">{activePin.severity} / 100</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">COORDINATES</span>
                <span className="font-mono text-slate-200">{activePin.lat}, {activePin.lng}</span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-700/80">
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                activePin.priority === 'Critical' ? 'bg-red-500/20 text-red-400 border border-red-500/40' : 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
              }`}>
                {activePin.priority} PRIORITY
              </span>
              <button
                onClick={() => navigateTo('admin_action', activePin.id)}
                className="bg-gov-saffron hover:bg-gov-saffron/90 text-white font-bold text-xs px-3.5 py-1.5 rounded flex items-center gap-1 shadow-md transition-all"
              >
                <span>Deploy Taskforce</span>
                <span>→</span>
              </button>
            </div>
          </div>
        )}

        {/* Map Legend (Bottom Left) */}
        <div className="absolute bottom-3 left-3 z-10 bg-slate-900/85 backdrop-blur border border-slate-700/60 rounded px-3 py-2 text-[10px] font-mono text-slate-300 flex items-center gap-4 shadow-md">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-red-600 ring-2 ring-red-400 inline-block"></span>
            <span>Active Red Incident Pin</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-red-500/40 animate-ping inline-block"></span>
            <span>Critical Sonar Pulse</span>
          </div>
        </div>
      </div>
    </div>
  );
}

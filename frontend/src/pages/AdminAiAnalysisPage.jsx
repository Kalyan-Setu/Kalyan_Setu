import React, { useState } from 'react';
import { useCivic } from '../context/CivicContext';
import AdminSidebar from '../components/AdminSidebar';

export default function AdminAiAnalysisPage() {
  const { complaints, navigateTo } = useCivic();
  const [mobileMode, setMobileMode] = useState(false);

  const clusters = [
    { name: "Potholes & Road Surface Degradation", count: 86, risk: "High", color: "bg-error/10 text-error border-error/30", growth: "+18%" },
    { name: "Monsoon Drainage & Water Inundation", count: 64, risk: "Critical", color: "bg-error-container text-on-error-container border-error", growth: "+42%" },
    { name: "Commercial Waste Collection Lag", count: 45, risk: "Medium", color: "bg-secondary-container/30 text-on-secondary-container border-secondary-container", growth: "-5%" },
    { name: "Night-time Pedestrian Lighting Outage", count: 29, risk: "Low", color: "bg-gov-green/10 text-gov-green border-gov-green/30", growth: "-12%" }
  ];

  const predictiveAlerts = [
    {
      id: 1,
      title: "Drainage Overflow Risk - East District Ward 12",
      prob: "88% Probability",
      desc: "Weather forecast predicts 35mm precipitation in next 24h. Historical drainage models flag 5 vulnerable low-lying junctions.",
      action: "Pre-position suction pumps",
      level: "Critical"
    },
    {
      id: 2,
      title: "Road Integrity Degradation - Ring Road Sector 4",
      prob: "74% Probability",
      desc: "High heavy-truck density combined with moisture saturation will expand existing potholes into major crater hazards.",
      action: "Issue PWD asphalt patch work order",
      level: "High"
    }
  ];

  return (
    <div className="flex-grow w-full flex bg-surface min-h-[calc(100vh-5rem)]">
      {!mobileMode && <AdminSidebar />}

      <main className={`flex-1 p-lg md:p-xl overflow-y-auto ${mobileMode ? 'max-w-md mx-auto my-6 bg-surface border border-outline-variant rounded-2xl shadow-2xl p-4' : 'max-w-7xl'}`}>
        {/* Header & Mode Switcher */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-md mb-lg border-b border-outline-variant pb-md">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-primary mb-1">
              <span className="material-symbols-outlined text-sm text-gov-saffron">psychology</span>
              <span>AI Neural Civic Intelligence</span>
            </div>
            <h1 className="font-headline-lg text-2xl sm:text-3xl font-bold text-primary">
              AI State Analysis & Insights
            </h1>
            <p className="font-body-md text-xs text-on-surface-variant mt-1">
              Predictive risk models, automated NLP speech clustering, and citizen sentiment telemetry.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setMobileMode(!mobileMode)}
              className="bg-surface-container-lowest border border-outline-variant text-primary font-bold text-xs px-3 py-1.5 rounded flex items-center gap-1 shadow-ambient hover:bg-surface-container"
            >
              <span className="material-symbols-outlined text-sm">
                {mobileMode ? 'desktop_windows' : 'smartphone'}
              </span>
              <span>{mobileMode ? 'Switch to Desktop View' : 'Toggle Mobile App View'}</span>
            </button>
          </div>
        </div>

        {/* Top Intelligence Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-md mb-lg">
          <div className="bg-surface-container-lowest border border-outline-variant p-md rounded-lg shadow-ambient">
            <div className="flex justify-between items-center text-xs font-bold text-on-surface-variant mb-1">
              <span>CIVIC SENTIMENT INDEX</span>
              <span className="material-symbols-outlined text-gov-green text-lg">mood</span>
            </div>
            <div className="text-2xl font-bold text-gov-green">74.8 / 100</div>
            <div className="text-[11px] text-on-surface-variant mt-1">
              +4.2 pts improvement post-resolution
            </div>
          </div>

          <div className="bg-surface-container-lowest border border-outline-variant p-md rounded-lg shadow-ambient">
            <div className="flex justify-between items-center text-xs font-bold text-on-surface-variant mb-1">
              <span>AUTO-TRIAGE ACCURACY</span>
              <span className="material-symbols-outlined text-primary text-lg">auto_awesome</span>
            </div>
            <div className="text-2xl font-bold text-primary">96.8%</div>
            <div className="text-[11px] text-on-surface-variant mt-1">
              Based on 2,400+ verified routings
            </div>
          </div>

          <div className="bg-surface-container-lowest border border-outline-variant p-md rounded-lg shadow-ambient">
            <div className="flex justify-between items-center text-xs font-bold text-on-surface-variant mb-1">
              <span>PREDICTIVE ACCURACY</span>
              <span className="material-symbols-outlined text-gov-saffron text-lg">timeline</span>
            </div>
            <div className="text-2xl font-bold text-on-secondary-fixed-variant">91.4%</div>
            <div className="text-[11px] text-on-surface-variant mt-1">
              14 early hazard alerts averted this month
            </div>
          </div>
        </div>

        {/* Bento Grid: Clusters & Hotspots */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-lg mb-lg">
          {/* Issue Clustering Table (7 cols) */}
          <div className="lg:col-span-7 bg-surface-container-lowest border border-outline-variant rounded-lg p-lg shadow-ambient">
            <h2 className="text-sm font-bold text-primary mb-md border-b border-outline-variant pb-2 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-base">bubble_chart</span>
                <span>AI Automated Issue Clustering</span>
              </span>
              <span className="text-[10px] text-on-surface-variant font-mono">NLP K-Means</span>
            </h2>

            <div className="flex flex-col gap-3">
              {clusters.map((c) => (
                <div
                  key={c.name}
                  className="bg-surface p-3 rounded border border-outline-variant flex justify-between items-center text-xs"
                >
                  <div className="flex flex-col">
                    <span className="font-bold text-on-surface">{c.name}</span>
                    <span className="text-[11px] text-on-surface-variant mt-0.5">
                      {c.count} Active Grievances • Trend: <strong className={c.growth.startsWith('+') ? 'text-error' : 'text-gov-green'}>{c.growth}</strong>
                    </span>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase ${c.color}`}>
                    {c.risk} Risk
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Hotspot Geospatial Intelligence (5 cols) */}
          <div className="lg:col-span-5 bg-surface-container-lowest border border-outline-variant rounded-lg p-lg shadow-ambient flex flex-col">
            <h2 className="text-sm font-bold text-primary mb-md border-b border-outline-variant pb-2 flex items-center gap-1.5">
              <span className="material-symbols-outlined text-base text-error">local_fire_department</span>
              <span>District Hotspot Heatmap</span>
            </h2>

            <div className="bg-primary-container text-white p-4 rounded-lg relative overflow-hidden flex flex-col justify-between flex-grow min-h-[160px]">
              <div className="relative z-10">
                <span className="text-[10px] font-mono text-gov-saffron uppercase tracking-widest block mb-1">
                  High Density Cluster Detected
                </span>
                <h3 className="text-base font-bold">East Delhi - Ward 12 & Indiranagar</h3>
                <p className="text-xs text-primary-fixed-dim mt-1">
                  18 co-located drainage & road reports registered within 400m radius.
                </p>
              </div>

              <div className="flex justify-between items-center pt-3 border-t border-white/15 relative z-10 mt-4">
                <span className="text-xs font-bold text-error bg-white px-2 py-0.5 rounded">
                  Cluster Severity: Critical
                </span>
                <button
                  onClick={() => navigateTo('admin_action')}
                  className="text-xs text-gov-saffron hover:underline font-bold"
                >
                  Deploy Taskforce →
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Predictive AI Early Warning System */}
        <div className="bg-surface-container-lowest border border-outline-variant rounded-lg p-lg shadow-ambient">
          <h2 className="text-sm font-bold text-primary mb-md border-b border-outline-variant pb-2 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-base text-gov-saffron">crisis_alert</span>
              <span>Predictive Early Warning Directives (Next 48 Hours)</span>
            </span>
            <span className="text-[10px] text-gov-green font-bold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-gov-green animate-ping"></span>
              Live Predictive Feed
            </span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
            {predictiveAlerts.map((alert) => (
              <div
                key={alert.id}
                className="bg-surface p-md rounded-lg border border-outline-variant flex flex-col justify-between gap-3 text-xs"
              >
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-bold text-error flex items-center gap-1">
                      <span className="material-symbols-outlined text-sm">warning</span>
                      {alert.title}
                    </span>
                    <span className="text-[10px] font-bold bg-primary/10 text-primary px-1.5 py-0.5 rounded">
                      {alert.prob}
                    </span>
                  </div>
                  <p className="text-on-surface-variant leading-relaxed mt-1">
                    {alert.desc}
                  </p>
                </div>

                <div className="flex justify-between items-center pt-2 border-t border-outline-variant text-[11px]">
                  <span className="text-on-surface font-semibold">Suggested Action: {alert.action}</span>
                  <button
                    onClick={() => navigateTo('admin_action')}
                    className="text-primary font-bold hover:underline"
                  >
                    Execute →
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}

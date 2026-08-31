import React, { useState } from 'react';
import { useCivic } from '../context/CivicContext';
import AdminSidebar from '../components/AdminSidebar';

export default function AdminOverviewPage() {
  const { complaints, navigateTo } = useCivic();
  const [selectedDistrict, setSelectedDistrict] = useState('ALL');

  const total = complaints.length;
  const criticalCount = complaints.filter(c => c.priority === 'Critical').length;
  const resolvedCount = complaints.filter(c => c.status === 'Resolved').length;
  const inProgressCount = complaints.filter(c => c.status === 'In Progress' || c.status === 'Action Assigned').length;

  const districtData = [
    { name: 'South District', total: 42, resolved: 38, urgent: 4 },
    { name: 'Central District', total: 35, resolved: 29, urgent: 6 },
    { name: 'East District', total: 28, resolved: 22, urgent: 6 },
    { name: 'North District', total: 19, resolved: 17, urgent: 2 },
    { name: 'West District', total: 24, resolved: 21, urgent: 3 },
  ];

  const departmentMetrics = [
    { name: 'Public Works Department (PWD)', count: 48, rate: '92%', avgTime: '36 hrs', icon: 'construction' },
    { name: 'Delhi Jal Board (Water/Sewage)', count: 32, rate: '86%', avgTime: '48 hrs', icon: 'water_drop' },
    { name: 'Municipal Corporation (Sanitation)', count: 41, rate: '95%', avgTime: '24 hrs', icon: 'delete_sweep' },
    { name: 'DISCOM / Power Grid', count: 18, rate: '98%', avgTime: '12 hrs', icon: 'bolt' },
  ];

  return (
    <div className="flex-grow w-full flex bg-surface min-h-[calc(100vh-5rem)]">
      {/* Admin Side Navigation */}
      <AdminSidebar />

      {/* Main Content Area */}
      <main className="flex-1 p-lg md:p-xl overflow-y-auto max-w-7xl">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-md mb-lg border-b border-outline-variant pb-md">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-primary-container mb-1">
              <span className="inline-block w-2 h-2 rounded-full bg-gov-green animate-pulse"></span>
              <span>Command & Analytics Centre</span>
            </div>
            <h1 className="font-headline-lg text-2xl sm:text-3xl font-bold text-primary">
              State Grievance Overview
            </h1>
            <p className="font-body-md text-xs text-on-surface-variant mt-1">
              Real-time civic intelligence, SLA adherence, and district-level municipal workload distribution.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => navigateTo('admin_action')}
              className="bg-error text-white font-bold text-xs px-4 py-2 rounded flex items-center gap-1.5 shadow-sm hover:bg-error/90 transition-all active:scale-95"
            >
              <span className="material-symbols-outlined text-sm">bolt</span>
              <span>Rapid Response ({criticalCount})</span>
            </button>
            <button
              onClick={() => navigateTo('admin_complaints')}
              className="bg-primary-container text-on-primary font-bold text-xs px-4 py-2 rounded hover:bg-primary transition-all flex items-center gap-1.5"
            >
              <span className="material-symbols-outlined text-sm">list_alt</span>
              <span>View All Complaints</span>
            </button>
          </div>
        </div>

        {/* Executive KPI Stat Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-md mb-lg">
          <div className="bg-surface-container-lowest border border-outline-variant p-md rounded-lg shadow-ambient">
            <div className="flex justify-between items-center text-xs font-bold text-on-surface-variant mb-1">
              <span>TOTAL GRIEVANCES</span>
              <span className="material-symbols-outlined text-primary text-xl">folder_managed</span>
            </div>
            <div className="text-3xl font-bold text-primary">{total + 148}</div>
            <div className="text-[11px] text-gov-green font-semibold mt-1 flex items-center gap-1">
              <span className="material-symbols-outlined text-xs">trending_up</span>
              +12% vs last week
            </div>
          </div>

          <div className="bg-surface-container-lowest border border-error-container p-md rounded-lg shadow-ambient border-l-4 border-l-error">
            <div className="flex justify-between items-center text-xs font-bold text-error mb-1">
              <span>CRITICAL ALERTS</span>
              <span className="material-symbols-outlined text-error text-xl">warning</span>
            </div>
            <div className="text-3xl font-bold text-error">{criticalCount}</div>
            <div className="text-[11px] text-error font-semibold mt-1">Requires immediate dispatch</div>
          </div>

          <div className="bg-surface-container-lowest border border-outline-variant p-md rounded-lg shadow-ambient">
            <div className="flex justify-between items-center text-xs font-bold text-on-surface-variant mb-1">
              <span>ACTIVE IN PROGRESS</span>
              <span className="material-symbols-outlined text-gov-saffron text-xl">engineering</span>
            </div>
            <div className="text-3xl font-bold text-on-secondary-fixed-variant">{inProgressCount + 34}</div>
            <div className="text-[11px] text-on-surface-variant mt-1">Field teams deployed</div>
          </div>

          <div className="bg-surface-container-lowest border border-outline-variant p-md rounded-lg shadow-ambient">
            <div className="flex justify-between items-center text-xs font-bold text-on-surface-variant mb-1">
              <span>SLA RESOLUTION RATE</span>
              <span className="material-symbols-outlined text-gov-green text-xl">verified</span>
            </div>
            <div className="text-3xl font-bold text-gov-green">94.2%</div>
            <div className="text-[11px] text-on-surface-variant mt-1">Within 48-hr mandate</div>
          </div>
        </div>

        {/* Two Column Layout: District Analytics & Urgent Escalations */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-lg mb-lg">
          {/* District Performance Breakdown (7 cols) */}
          <div className="lg:col-span-7 bg-surface-container-lowest border border-outline-variant rounded-lg p-lg shadow-ambient">
            <div className="flex justify-between items-center mb-md border-b border-outline-variant pb-2">
              <h2 className="text-sm font-bold text-primary flex items-center gap-1.5">
                <span className="material-symbols-outlined text-base">map</span>
                <span>District Grievance Load & Resolution</span>
              </h2>
              <span className="text-[11px] text-on-surface-variant font-mono">Live Sync</span>
            </div>

            <div className="flex flex-col gap-3">
              {districtData.map((d) => {
                const percentage = Math.round((d.resolved / d.total) * 100);
                return (
                  <div key={d.name} className="flex flex-col gap-1 text-xs">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-on-surface">{d.name}</span>
                      <span className="text-on-surface-variant">
                        {d.resolved}/{d.total} Solved ({percentage}%)
                        {d.urgent > 0 && (
                          <span className="ml-2 text-error font-bold">• {d.urgent} Critical</span>
                        )}
                      </span>
                    </div>
                    <div className="w-full h-2 bg-surface-variant rounded-full overflow-hidden flex">
                      <div
                        className="h-full bg-gov-green"
                        style={{ width: `${percentage}%` }}
                      ></div>
                      <div
                        className="h-full bg-gov-saffron"
                        style={{ width: `${100 - percentage}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Rapid Response Escalation Feed (5 cols) */}
          <div className="lg:col-span-5 bg-surface-container-lowest border border-outline-variant rounded-lg p-lg shadow-ambient flex flex-col">
            <div className="flex justify-between items-center mb-md border-b border-outline-variant pb-2">
              <h2 className="text-sm font-bold text-error flex items-center gap-1.5">
                <span className="material-symbols-outlined text-base">emergency</span>
                <span>Immediate Action Queue</span>
              </h2>
              <button
                onClick={() => navigateTo('admin_action')}
                className="text-[11px] text-primary font-bold hover:underline"
              >
                Open Directives
              </button>
            </div>

            <div className="flex flex-col gap-2.5 flex-grow">
              {complaints.filter(c => c.priority === 'Critical' || c.priority === 'High').slice(0, 3).map((item) => (
                <div
                  key={item.id}
                  onClick={() => navigateTo('admin_action', item.id)}
                  className="bg-surface p-3 rounded border border-outline-variant hover:border-primary transition-all cursor-pointer flex flex-col gap-1"
                >
                  <div className="flex justify-between items-center">
                    <span className="font-mono text-[11px] font-bold text-primary">#{item.id}</span>
                    <span className="text-[10px] bg-error-container text-on-error-container font-bold px-1.5 py-0.5 rounded">
                      {item.priority}
                    </span>
                  </div>
                  <h3 className="text-xs font-bold text-on-surface line-clamp-1">{item.title}</h3>
                  <div className="text-[10px] text-on-surface-variant flex items-center justify-between mt-1">
                    <span>{item.location}</span>
                    <span className="text-primary font-semibold">Triage →</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Department SLA Matrix */}
        <div className="bg-surface-container-lowest border border-outline-variant rounded-lg p-lg shadow-ambient">
          <h2 className="text-sm font-bold text-primary mb-md border-b border-outline-variant pb-2 flex items-center gap-1.5">
            <span className="material-symbols-outlined text-base">corporate_fare</span>
            <span>Departmental Workload & Redressal Performance</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-md">
            {departmentMetrics.map((dept) => (
              <div key={dept.name} className="bg-surface p-md rounded-lg border border-outline-variant flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary text-xl">{dept.icon}</span>
                  <h3 className="font-bold text-xs text-on-surface line-clamp-1">{dept.name}</h3>
                </div>
                <div className="grid grid-cols-3 gap-1 text-center bg-white p-2 rounded border border-outline-variant/60 text-[11px]">
                  <div>
                    <span className="text-[10px] text-on-surface-variant block">Active</span>
                    <span className="font-bold text-primary">{dept.count}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-on-surface-variant block">SLA</span>
                    <span className="font-bold text-gov-green">{dept.rate}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-on-surface-variant block">Speed</span>
                    <span className="font-bold text-on-surface">{dept.avgTime}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}

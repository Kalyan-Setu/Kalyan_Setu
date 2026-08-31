import React from 'react';
import { useCivic } from '../context/CivicContext';

export default function AdminSidebar() {
  const { activeTab, navigateTo, setUserRole, currentUser } = useCivic();

  const navItems = [
    { id: 'admin_overview', label: 'State Overview', icon: 'dashboard' },
    { id: 'admin_complaints', label: 'Complaints', icon: 'assignment_late' },
    { id: 'admin_ai', label: 'AI Analysis', icon: 'analytics' },
    { id: 'admin_action', label: 'Take Action', icon: 'gavel' },
  ];

  return (
    <aside className="w-64 bg-surface-container-low border-r border-outline-variant flex flex-col shrink-0 min-h-[calc(100vh-5rem)] sticky top-20">
      {/* Portal Identification */}
      <div className="p-md border-b border-outline-variant flex items-center gap-sm">
        <div className="w-10 h-10 rounded-full bg-primary-container text-on-primary flex items-center justify-center font-bold text-sm shadow-sm">
          <span className="material-symbols-outlined text-[22px]">shield_person</span>
        </div>
        <div>
          <h2 className="font-headline-sm text-sm font-bold text-primary">GOI Administration</h2>
          <p className="font-label-sm text-[11px] text-on-surface-variant">Dept. of Grievances</p>
        </div>
      </div>

      {/* Quick Action Button */}
      <div className="p-md">
        <button
          onClick={() => navigateTo('submit')}
          className="w-full bg-primary-container text-on-primary font-label-md text-label-md py-sm px-md rounded flex items-center justify-center gap-sm hover:bg-primary transition-all shadow-sm font-semibold active:scale-95"
        >
          <span className="material-symbols-outlined text-[18px]">add</span>
          New Report
        </button>
      </div>

      {/* Primary Navigation */}
      <nav className="flex-1 px-sm flex flex-col gap-1">
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => navigateTo(item.id)}
              className={`flex items-center gap-md px-md py-sm rounded-lg font-label-md text-label-md transition-all text-left w-full ${
                isActive
                  ? 'bg-primary-container text-on-primary font-bold shadow-sm'
                  : 'text-on-surface-variant hover:bg-surface-container-high hover:text-primary'
              }`}
            >
              <span className={`material-symbols-outlined text-[20px] ${isActive ? 'filled-icon' : ''}`}>
                {item.icon}
              </span>
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* User Info & Footer Navigation */}
      <div className="p-md border-t border-outline-variant flex flex-col gap-2 mt-auto">
        <div className="bg-surface-container-lowest p-2.5 rounded border border-outline-variant flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-primary-container/10 text-primary flex items-center justify-center font-bold text-xs">
            AS
          </div>
          <div className="overflow-hidden">
            <p className="text-xs font-bold text-on-surface truncate">{currentUser.name}</p>
            <p className="text-[10px] text-on-surface-variant truncate">{currentUser.roleTitle}</p>
          </div>
        </div>

        <button
          onClick={() => {
            setUserRole('citizen');
            navigateTo('home');
          }}
          className="flex items-center gap-2 px-3 py-2 text-xs font-label-md text-on-surface-variant hover:bg-surface-container-high hover:text-primary rounded transition-colors w-full text-left"
        >
          <span className="material-symbols-outlined text-[18px]">logout</span>
          <span>Switch to Citizen Mode</span>
        </button>
      </div>
    </aside>
  );
}

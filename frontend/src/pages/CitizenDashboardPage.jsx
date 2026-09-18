import React, { useState } from 'react';
import { useCivic } from '../context/CivicContext';

export default function CitizenDashboardPage() {
  const { complaints, navigateTo, currentUser } = useCivic();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [categoryFilter, setCategoryFilter] = useState('ALL');

  const statusFilters = ['ALL', 'Submitted', 'Under Review', 'In Progress', 'Resolved'];

  const filteredComplaints = complaints.filter(item => {
    const matchesSearch = 
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.location.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = 
      statusFilter === 'ALL' ? true :
      statusFilter === 'Resolved' ? item.status === 'Resolved' :
      statusFilter === 'In Progress' ? (item.status === 'In Progress' || item.status === 'Action Assigned') :
      item.status === statusFilter;

    const matchesCategory = 
      categoryFilter === 'ALL' ? true : item.category.includes(categoryFilter);

    return matchesSearch && matchesStatus && matchesCategory;
  });

  const totalCount = complaints.length;
  const inProgressCount = complaints.filter(c => c.status === 'In Progress' || c.status === 'Action Assigned').length;
  const resolvedCount = complaints.filter(c => c.status === 'Resolved').length;
  const pendingCount = complaints.filter(c => c.status === 'Submitted' || c.status === 'Under Review').length;

  return (
    <div className="flex-grow w-full max-w-container-max mx-auto px-4 sm:px-lg py-6 sm:py-xl flex flex-col gap-4 sm:gap-lg">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-outline-variant pb-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-on-surface-variant mb-1 font-label-sm uppercase tracking-wider">
            <span>Welcome, {currentUser?.name || currentUser?.full_name || 'Citizen'}</span>
            <span>•</span>
            <span>Citizen Portal</span>
          </div>
          <h1 className="font-headline-lg text-2xl sm:text-3xl font-bold text-primary">Citizen Dashboard</h1>
          <p className="font-body-md text-xs sm:text-sm text-on-surface-variant mt-1">
            Track, manage, and verify all your submitted civic priority reports in real-time.
          </p>
        </div>

        <button
          onClick={() => navigateTo('submit')}
          className="w-full sm:w-auto justify-center bg-primary-container text-on-primary font-label-md text-sm font-semibold px-5 sm:px-lg py-2.5 sm:py-md rounded hover:bg-primary transition-all flex items-center gap-2 shadow-sm active:scale-95 shrink-0"
        >
          <span className="material-symbols-outlined text-[20px]">add_circle</span>
          Report New Problem
        </button>
      </div>

      {/* Metric KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 sm:gap-md">
        <div className="bg-surface-container-lowest border border-outline-variant p-3 sm:p-md rounded-lg shadow-ambient">
          <div className="flex justify-between items-center mb-1">
            <span className="text-[11px] sm:text-xs font-label-sm text-on-surface-variant uppercase">Total Filed</span>
            <span className="material-symbols-outlined text-primary text-lg sm:text-xl">folder</span>
          </div>
          <div className="text-xl sm:text-2xl font-bold text-primary">{totalCount}</div>
          <div className="text-[10px] sm:text-[11px] text-on-surface-variant mt-0.5">Grievances logged</div>
        </div>

        <div className="bg-surface-container-lowest border border-outline-variant p-3 sm:p-md rounded-lg shadow-ambient">
          <div className="flex justify-between items-center mb-1">
            <span className="text-[11px] sm:text-xs font-label-sm text-on-surface-variant uppercase">In Progress</span>
            <span className="material-symbols-outlined text-gov-saffron text-lg sm:text-xl">engineering</span>
          </div>
          <div className="text-xl sm:text-2xl font-bold text-on-secondary-fixed-variant">{inProgressCount}</div>
          <div className="text-[10px] sm:text-[11px] text-on-surface-variant mt-0.5">Under field repair</div>
        </div>

        <div className="bg-surface-container-lowest border border-outline-variant p-3 sm:p-md rounded-lg shadow-ambient">
          <div className="flex justify-between items-center mb-1">
            <span className="text-[11px] sm:text-xs font-label-sm text-on-surface-variant uppercase">Resolved</span>
            <span className="material-symbols-outlined text-gov-green text-lg sm:text-xl">task_alt</span>
          </div>
          <div className="text-xl sm:text-2xl font-bold text-gov-green">{resolvedCount}</div>
          <div className="text-[10px] sm:text-[11px] text-on-surface-variant mt-0.5">Successfully solved</div>
        </div>

        <div className="bg-surface-container-lowest border border-outline-variant p-3 sm:p-md rounded-lg shadow-ambient">
          <div className="flex justify-between items-center mb-1">
            <span className="text-[11px] sm:text-xs font-label-sm text-on-surface-variant uppercase">Pending</span>
            <span className="material-symbols-outlined text-outline text-lg sm:text-xl">pending_actions</span>
          </div>
          <div className="text-xl sm:text-2xl font-bold text-on-surface">{pendingCount}</div>
          <div className="text-[10px] sm:text-[11px] text-on-surface-variant mt-0.5">Department triage</div>
        </div>
      </div>

      {/* Filter & Search Section */}
      <div className="bg-surface-container-lowest p-3 sm:p-md rounded-lg border border-outline-variant shadow-ambient flex flex-col md:flex-row justify-between items-stretch md:items-center gap-3 sm:gap-md">
        {/* Status Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1 md:pb-0">
          {statusFilters.map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 text-xs font-label-md rounded transition-all whitespace-nowrap shrink-0 ${
                statusFilter === st
                  ? 'bg-primary-container text-white font-bold shadow-sm'
                  : 'bg-surface-container hover:bg-surface-container-high text-on-surface-variant'
              }`}
            >
              {st === 'ALL' ? 'All Grievances' : st}
            </button>
          ))}
        </div>

        {/* Search input and Category select */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="text-xs bg-surface border border-outline-variant rounded px-2.5 py-2 sm:py-1.5 text-on-surface focus:border-primary outline-none"
          >
            <option value="ALL">All Categories</option>
            <option value="Road">Road Infrastructure</option>
            <option value="Water">Drainage & Water</option>
            <option value="Sanitation">Sanitation & Waste</option>
            <option value="Electricity">Electricity & Lighting</option>
            <option value="Safety">Public Safety</option>
          </select>

          <div className="relative flex-grow sm:w-60 md:w-64">
            <span className="material-symbols-outlined absolute left-2.5 top-2 text-on-surface-variant text-base">
              search
            </span>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search ID, location..."
              className="w-full pl-8 pr-3 py-2 sm:py-1.5 text-xs bg-surface border border-outline-variant rounded focus:border-primary focus:ring-1 focus:ring-primary outline-none"
            />
          </div>
        </div>
      </div>

      {/* Complaints List Cards */}
      <div className="flex flex-col gap-md">
        {filteredComplaints.length === 0 ? (
          <div className="bg-surface-container-lowest border border-outline-variant rounded-lg p-xl text-center flex flex-col items-center justify-center">
            <span className="material-symbols-outlined text-4xl text-outline mb-2">search_off</span>
            <h3 className="text-base font-bold text-on-surface">No Grievances Found</h3>
            <p className="text-xs text-on-surface-variant mt-1">Try resetting the filters or search keywords.</p>
            <button
              onClick={() => { setSearchTerm(''); setStatusFilter('ALL'); setCategoryFilter('ALL'); }}
              className="mt-3 text-xs text-primary font-bold underline"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          filteredComplaints.map((item) => (
            <div
              key={item.id}
              className="bg-surface-container-lowest border border-outline-variant rounded-lg p-lg shadow-ambient hover:border-primary transition-all flex flex-col md:flex-row justify-between items-start md:items-center gap-md"
            >
              <div className="flex flex-col gap-1.5 flex-grow">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-mono font-bold text-primary bg-primary-fixed/40 px-2 py-0.5 rounded border border-primary-fixed">
                    #{item.id}
                  </span>
                  <span className="text-xs text-on-surface-variant font-medium">
                    {item.category}
                  </span>
                  <span className="text-on-surface-variant">•</span>
                  <span className="text-xs text-on-surface-variant flex items-center gap-0.5">
                    <span className="material-symbols-outlined text-xs">calendar_today</span>
                    {item.dateFiled}
                  </span>
                </div>

                <h3 className="text-base font-bold text-on-surface hover:text-primary transition-colors cursor-pointer"
                    onClick={() => navigateTo('track', item.id)}>
                  {item.title}
                </h3>

                <p className="text-xs text-on-surface-variant line-clamp-2 max-w-3xl leading-relaxed">
                  {item.description}
                </p>

                <div className="flex items-center gap-4 text-xs text-on-surface-variant mt-1 flex-wrap">
                  <span className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-sm text-primary">location_on</span>
                    {item.location}
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-sm text-primary">corporate_fare</span>
                    {item.assignedDepartment}
                  </span>
                </div>
              </div>

              {/* Status and Action Buttons */}
              <div className="flex flex-col sm:flex-row md:flex-col items-stretch sm:items-center md:items-end gap-2 shrink-0 w-full md:w-auto pt-3 md:pt-0 border-t md:border-t-0 border-outline-variant">
                <span className={`text-center text-xs font-bold uppercase px-3 py-1.5 rounded self-start sm:self-auto ${
                  item.status === 'Resolved'
                    ? 'bg-gov-green/15 text-gov-green border border-gov-green/30'
                    : item.status === 'Rejected'
                    ? 'bg-error/15 text-error border border-error/30 font-black'
                    : item.status === 'In Progress' || item.status === 'Action Assigned'
                    ? 'bg-secondary-container/30 text-on-secondary-fixed-variant border border-secondary-container/50'
                    : 'bg-surface-container-high text-on-surface-variant border border-outline-variant'
                }`}>
                  {item.status}
                </span>

                <button
                  onClick={() => navigateTo('track', item.id)}
                  className="bg-primary-container text-on-primary text-xs font-bold px-4 py-2.5 rounded hover:bg-primary transition-all flex items-center gap-1.5 w-full sm:w-auto justify-center shadow-sm active:scale-95"
                >
                  <span>Track Full Timeline</span>
                  <span className="material-symbols-outlined text-sm">arrow_forward</span>
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

import React, { useState } from 'react';
import { useCivic } from '../context/CivicContext';

export default function ProfilePage() {
  const { currentUser, updateUserProfile, complaints, navigateTo } = useCivic();

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    full_name: currentUser?.full_name || currentUser?.name || '',
    phone: currentUser?.phone || currentUser?.contactPhone || '',
    state: currentUser?.state || 'Delhi NCR',
    district: currentUser?.district || 'South District',
    email: currentUser?.email || 'citizen@kalyansetu.gov.in'
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    updateUserProfile(formData);
    setIsEditing(false);
  };

  // Filter complaints for this citizen
  const citizenComplaints = complaints; // All complaints stored for user session
  const totalCount = citizenComplaints.length;
  const resolvedCount = citizenComplaints.filter(c => c.status === 'Resolved').length;
  const pendingCount = citizenComplaints.filter(c => c.status === 'Submitted' || c.status === 'Under Review').length;
  const inProgressCount = citizenComplaints.filter(c => c.status === 'In Progress' || c.status === 'Action Assigned').length;

  return (
    <div className="w-full max-w-container-max mx-auto px-lg py-xl flex-grow">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-primary-container via-primary to-primary-container text-white p-lg md:p-xl rounded-xl shadow-md mb-lg relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-8 -translate-y-8 opacity-10 pointer-events-none">
          <span className="material-symbols-outlined text-[240px]">account_circle</span>
        </div>

        <div className="relative z-10 flex flex-col md:flex-row gap-md items-start md:items-center justify-between">
          <div className="flex items-center gap-md">
            <div className="w-20 h-20 rounded-full bg-white/20 backdrop-blur-md border-2 border-white/40 flex items-center justify-center text-white font-bold text-3xl shadow-inner shrink-0">
              {(formData.full_name || 'C').charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-2xl md:text-3xl font-bold font-display-lg">{currentUser?.full_name || currentUser?.name || 'Citizen'}</h1>
                <span className="bg-gov-green/20 text-gov-green border border-gov-green/40 px-2.5 py-0.5 rounded-full text-xs font-bold flex items-center gap-1">
                  <span className="material-symbols-outlined text-xs">verified</span>
                  Verified Citizen
                </span>
              </div>
              <p className="text-sm text-primary-fixed-dim mt-1 flex items-center gap-2">
                <span className="material-symbols-outlined text-sm">location_on</span>
                {currentUser?.district || 'South District'}, {currentUser?.state || 'Delhi NCR'}
              </p>
              <p className="text-xs text-white/80 mt-1 font-mono">
                Citizen ID: CTZ-2026-{currentUser?.id || '88492'}
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsEditing(!isEditing)}
            className="bg-white text-primary font-bold text-xs px-md py-sm rounded-lg hover:bg-surface-container transition-all flex items-center gap-1.5 shadow-sm active:scale-95 self-start md:self-auto"
          >
            <span className="material-symbols-outlined text-sm">{isEditing ? 'close' : 'edit'}</span>
            {isEditing ? 'Cancel Edit' : 'Edit Profile'}
          </button>
        </div>
      </div>

      {/* Metrics Dashboard */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-md mb-lg">
        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-md shadow-ambient">
          <div className="flex justify-between items-center text-primary mb-1">
            <span className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">Total Logged</span>
            <span className="material-symbols-outlined text-xl">assignment</span>
          </div>
          <div className="text-2xl font-bold text-on-surface font-display-lg">{totalCount}</div>
          <div className="text-[11px] text-on-surface-variant mt-1">Grievances filed</div>
        </div>

        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-md shadow-ambient">
          <div className="flex justify-between items-center text-gov-green mb-1">
            <span className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">Resolved</span>
            <span className="material-symbols-outlined text-xl">check_circle</span>
          </div>
          <div className="text-2xl font-bold text-gov-green font-display-lg">{resolvedCount}</div>
          <div className="text-[11px] text-on-surface-variant mt-1">Issues fixed</div>
        </div>

        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-md shadow-ambient">
          <div className="flex justify-between items-center text-gov-saffron mb-1">
            <span className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">In Progress</span>
            <span className="material-symbols-outlined text-xl">engineering</span>
          </div>
          <div className="text-2xl font-bold text-gov-saffron font-display-lg">{inProgressCount}</div>
          <div className="text-[11px] text-on-surface-variant mt-1">Field action active</div>
        </div>

        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-md shadow-ambient">
          <div className="flex justify-between items-center text-primary mb-1">
            <span className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">Pending</span>
            <span className="material-symbols-outlined text-xl">pending_actions</span>
          </div>
          <div className="text-2xl font-bold text-primary font-display-lg">{pendingCount}</div>
          <div className="text-[11px] text-on-surface-variant mt-1">Awaiting triage</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-lg">
        {/* Profile Info / Form Card */}
        <div className="lg:col-span-1 bg-surface-container-lowest border border-outline-variant rounded-xl p-lg shadow-ambient h-fit">
          <h2 className="text-lg font-bold text-on-surface mb-md flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">person</span>
            Personal Information
          </h2>

          {isEditing ? (
            <form onSubmit={handleSubmit} className="flex flex-col gap-md">
              <div>
                <label className="block text-xs font-bold text-on-surface mb-1">Full Name</label>
                <input
                  type="text"
                  name="full_name"
                  value={formData.full_name}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 text-xs border border-outline-variant rounded bg-surface focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-on-surface mb-1">Phone Number</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 text-xs border border-outline-variant rounded bg-surface focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-on-surface mb-1">Email Address</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-3 py-2 text-xs border border-outline-variant rounded bg-surface focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-on-surface mb-1">State / Union Territory</label>
                <input
                  type="text"
                  name="state"
                  value={formData.state}
                  onChange={handleChange}
                  className="w-full px-3 py-2 text-xs border border-outline-variant rounded bg-surface focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-on-surface mb-1">District</label>
                <input
                  type="text"
                  name="district"
                  value={formData.district}
                  onChange={handleChange}
                  className="w-full px-3 py-2 text-xs border border-outline-variant rounded bg-surface focus:outline-none focus:border-primary"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  className="flex-1 bg-primary text-on-primary font-bold text-xs py-2 rounded hover:bg-primary-container transition-colors"
                >
                  Save Changes
                </button>
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-3 py-2 border border-outline-variant text-xs text-on-surface-variant rounded hover:bg-surface-container"
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <div className="flex flex-col gap-md text-xs">
              <div className="border-b border-outline-variant pb-2">
                <span className="text-[11px] text-on-surface-variant font-medium block">Full Name</span>
                <span className="font-bold text-on-surface text-sm">{currentUser?.full_name || currentUser?.name || 'Aaditya Sharma'}</span>
              </div>

              <div className="border-b border-outline-variant pb-2">
                <span className="text-[11px] text-on-surface-variant font-medium block">Phone Number</span>
                <span className="font-bold text-on-surface">{currentUser?.phone || '+91 98765 43210'}</span>
              </div>

              <div className="border-b border-outline-variant pb-2">
                <span className="text-[11px] text-on-surface-variant font-medium block">Email Address</span>
                <span className="font-bold text-on-surface">{currentUser?.email || 'citizen@kalyansetu.gov.in'}</span>
              </div>

              <div className="border-b border-outline-variant pb-2">
                <span className="text-[11px] text-on-surface-variant font-medium block">State / District</span>
                <span className="font-bold text-on-surface">{currentUser?.district || 'South District'}, {currentUser?.state || 'Delhi NCR'}</span>
              </div>

              <div>
                <span className="text-[11px] text-on-surface-variant font-medium block mb-1">Account Security</span>
                <div className="bg-surface-container p-2.5 rounded border border-outline-variant flex items-center justify-between text-[11px]">
                  <span className="flex items-center gap-1 font-semibold text-gov-green">
                    <span className="material-symbols-outlined text-xs">shield</span>
                    Aadhaar Linked & OTP Verified
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* My Filed Grievances Section */}
        <div className="lg:col-span-2 bg-surface-container-lowest border border-outline-variant rounded-xl p-lg shadow-ambient">
          <div className="flex justify-between items-center mb-md">
            <div>
              <h2 className="text-lg font-bold text-on-surface flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">history</span>
                My Reported Grievances
              </h2>
              <p className="text-xs text-on-surface-variant">Track status and field updates for your filed issues</p>
            </div>
            <button
              onClick={() => navigateTo('submit')}
              className="bg-primary text-on-primary text-xs font-bold px-3 py-1.5 rounded flex items-center gap-1 hover:bg-primary-container transition-colors shadow-sm"
            >
              <span className="material-symbols-outlined text-sm">add</span>
              Report New Problem
            </button>
          </div>

          <div className="flex flex-col gap-md">
            {citizenComplaints.length === 0 ? (
              <div className="text-center py-xl text-on-surface-variant">
                <span className="material-symbols-outlined text-4xl mb-2 text-outline">assignment_turned_in</span>
                <p className="text-sm font-bold">No grievances filed yet</p>
                <p className="text-xs text-outline mt-1">Submit your first civic report to track action here.</p>
              </div>
            ) : (
              citizenComplaints.map((item) => (
                <div
                  key={item.id}
                  className="bg-surface border border-outline-variant rounded-lg p-md hover:border-primary transition-all flex flex-col md:flex-row justify-between gap-md items-start md:items-center"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-mono font-bold text-primary">#{item.id}</span>
                      <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                        item.status === 'Resolved'
                          ? 'bg-gov-green/10 text-gov-green border border-gov-green/30'
                          : item.priority === 'Critical'
                          ? 'bg-error-container text-on-error-container'
                          : 'bg-secondary-container/30 text-on-secondary-fixed-variant'
                      }`}>
                        {item.status}
                      </span>
                      <span className="text-[11px] text-on-surface-variant ml-auto md:ml-0">• {item.dateFiled}</span>
                    </div>
                    <h3 className="text-sm font-bold text-on-surface mb-1">{item.title}</h3>
                    <p className="text-xs text-on-surface-variant line-clamp-1">{item.description}</p>
                    <p className="text-[11px] text-outline mt-1 flex items-center gap-1">
                      <span className="material-symbols-outlined text-xs">business</span>
                      Assigned: {item.assignedDepartment || 'Urban Infrastructure Cell'}
                    </p>
                  </div>

                  <button
                    onClick={() => navigateTo('track', item.id)}
                    className="w-full md:w-auto px-md py-sm bg-surface-container text-primary font-bold text-xs rounded hover:bg-primary-container hover:text-white transition-colors flex items-center justify-center gap-1 shrink-0"
                  >
                    <span>Track Status</span>
                    <span className="material-symbols-outlined text-sm">arrow_forward</span>
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

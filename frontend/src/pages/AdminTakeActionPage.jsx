import React, { useState } from 'react';
import { useCivic } from '../context/CivicContext';
import AdminSidebar from '../components/AdminSidebar';

export default function AdminTakeActionPage() {
  const { complaints, activeTrackId, updateComplaintStatus, showNotification, navigateTo } = useCivic();

  // Selected complaint for action, defaults to activeTrackId or first critical
  const [selectedId, setSelectedId] = useState(() => {
    return activeTrackId || (complaints.find(c => c.priority === 'Critical') || complaints[0]).id;
  });

  const selectedComplaint = complaints.find(c => c.id === selectedId) || complaints[0];

  const [assignedDepartment, setAssignedDepartment] = useState(selectedComplaint.assignedDepartment || 'Public Works Department (PWD)');
  const [assignedOfficer, setAssignedOfficer] = useState(selectedComplaint.assignedOfficer || 'Er. Rajesh Kumar');
  const [budget, setBudget] = useState(selectedComplaint.budget || '₹4,50,000');
  const [directiveNote, setDirectiveNote] = useState('');
  const [deadline, setDeadline] = useState('24 Hours');
  const [newStatus, setNewStatus] = useState('In Progress');

  const handleDispatch = (e) => {
    e.preventDefault();
    const noteText = directiveNote || `Strategic directive dispatched to ${assignedDepartment}. Officer ${assignedOfficer} assigned with ${budget} budget under ${deadline} SLA mandate.`;
    updateComplaintStatus(
      selectedComplaint.id,
      newStatus,
      noteText,
      assignedOfficer,
      assignedDepartment,
      budget
    );
    showNotification(`Directive issued for #${selectedComplaint.id}! Status set to ${newStatus}.`);
    setDirectiveNote('');
  };

  return (
    <div className="flex-grow w-full flex bg-surface min-h-[calc(100vh-5rem)]">
      <AdminSidebar />

      <main className="flex-1 p-lg md:p-xl overflow-y-auto max-w-7xl">
        {/* Header */}
        <div className="mb-lg border-b border-outline-variant pb-md">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-error mb-1">
            <span className="material-symbols-outlined text-sm">bolt</span>
            <span>Executive Command Directives</span>
          </div>
          <h1 className="font-headline-lg text-2xl sm:text-3xl font-bold text-primary">
            Take Strategic Action
          </h1>
          <p className="font-body-md text-xs text-on-surface-variant mt-1">
            Execute emergency response directives, deploy equipment, and allocate municipal budget.
          </p>
        </div>

        {/* Bento Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-lg">
          {/* Left Column: Rapid Response Requests Queue (4 cols) */}
          <section className="lg:col-span-4 flex flex-col gap-md">
            <h2 className="font-headline-sm text-sm font-bold text-primary flex items-center gap-2 border-b border-outline-variant pb-2">
              <span className="material-symbols-outlined text-error text-lg">warning</span>
              <span>Rapid Response Queue</span>
            </h2>

            <div className="flex flex-col gap-3">
              {complaints.map((item) => (
                <div
                  key={item.id}
                  onClick={() => {
                    setSelectedId(item.id);
                    setAssignedDepartment(item.assignedDepartment);
                    setAssignedOfficer(item.assignedOfficer);
                    setBudget(item.budget || '₹1,50,000');
                  }}
                  className={`p-3 rounded-lg border cursor-pointer transition-all ${
                    selectedId === item.id
                      ? 'bg-primary-fixed/20 border-primary shadow-sm border-l-4 border-l-primary'
                      : 'bg-surface-container-lowest border-outline-variant hover:border-primary/60'
                  }`}
                >
                  <div className="flex justify-between items-center mb-1">
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded uppercase ${
                      item.priority === 'Critical' ? 'bg-error-container text-on-error-container' : 'bg-surface-container text-on-surface-variant'
                    }`}>
                      {item.priority}
                    </span>
                    <span className="font-mono text-[10px] text-on-surface-variant">{item.dateFiled}</span>
                  </div>
                  <h3 className="text-xs font-bold text-on-surface line-clamp-1">{item.title}</h3>
                  <p className="text-[11px] text-on-surface-variant line-clamp-1 mt-0.5">{item.location}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Right Column: Strategic Directive Form (8 cols) */}
          <section className="lg:col-span-8">
            <div className="bg-surface-container-lowest border border-outline-variant rounded-lg p-lg sm:p-xl shadow-ambient flex flex-col gap-lg">
              {/* Selected Grievance Overview Card */}
              <div className="bg-surface p-md rounded-lg border border-outline-variant flex flex-col gap-2">
                <div className="flex justify-between items-center flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-primary bg-primary-fixed/40 px-2 py-0.5 rounded">
                      #{selectedComplaint.id}
                    </span>
                    <span className="text-xs font-bold text-on-surface">{selectedComplaint.title}</span>
                  </div>
                  <span className="text-xs font-bold text-error">
                    AI Severity Score: {selectedComplaint.aiSeverityScore}/100
                  </span>
                </div>
                <p className="text-xs text-on-surface-variant leading-relaxed">
                  {selectedComplaint.description}
                </p>
                <div className="flex items-center gap-4 text-[11px] text-on-surface-variant pt-1 border-t border-outline-variant/60">
                  <span>Location: <strong>{selectedComplaint.location}</strong></span>
                  <span>Reported by: <strong>{selectedComplaint.reportedBy}</strong></span>
                  <span>Current Status: <strong className="text-primary">{selectedComplaint.status}</strong></span>
                </div>
              </div>

              {/* Action Directive Form */}
              <form onSubmit={handleDispatch} className="flex flex-col gap-md text-xs">
                <h3 className="text-sm font-bold text-primary border-b border-outline-variant pb-2">
                  Resource & Crew Deployment Directives
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-md">
                  <div>
                    <label className="block font-bold text-on-surface mb-1">Nodal Department *</label>
                    <select
                      value={assignedDepartment}
                      onChange={(e) => setAssignedDepartment(e.target.value)}
                      className="w-full p-2 bg-surface border border-outline-variant rounded focus:border-primary outline-none font-medium"
                    >
                      <option>Public Works Department (PWD)</option>
                      <option>Delhi Jal Board (Water / Drainage)</option>
                      <option>Municipal Corporation of Delhi (MCD)</option>
                      <option>Traffic Police & Urban Safety Cell</option>
                      <option>DISCOM / Power Distribution Wing</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-on-surface mb-1">Assigned Executive Engineer / Officer *</label>
                    <input
                      type="text"
                      required
                      value={assignedOfficer}
                      onChange={(e) => setAssignedOfficer(e.target.value)}
                      placeholder="e.g. Er. Rajesh Kumar"
                      className="w-full p-2 bg-surface border border-outline-variant rounded focus:border-primary outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-md">
                  <div>
                    <label className="block font-bold text-on-surface mb-1">Emergency Budget Allocation</label>
                    <input
                      type="text"
                      value={budget}
                      onChange={(e) => setBudget(e.target.value)}
                      placeholder="e.g. ₹4,50,000"
                      className="w-full p-2 bg-surface border border-outline-variant rounded focus:border-primary outline-none font-mono"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-on-surface mb-1">Mandated SLA Deadline</label>
                    <select
                      value={deadline}
                      onChange={(e) => setDeadline(e.target.value)}
                      className="w-full p-2 bg-surface border border-outline-variant rounded focus:border-primary outline-none"
                    >
                      <option>12 Hours (Immediate Critical)</option>
                      <option>24 Hours (High Urgency)</option>
                      <option>48 Hours (Standard SLA)</option>
                      <option>7 Days (Capital Infrastructure)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-on-surface mb-1">Set Updated Status</label>
                    <select
                      value={newStatus}
                      onChange={(e) => setNewStatus(e.target.value)}
                      className="w-full p-2 bg-surface border border-outline-variant rounded focus:border-primary outline-none font-bold text-primary"
                    >
                      <option value="Action Assigned">Action Assigned</option>
                      <option value="In Progress">In Progress (Field Deployed)</option>
                      <option value="Resolved">Resolved (Completed)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-on-surface mb-1">Work Order Directives & Special Instructions</label>
                  <textarea
                    rows={4}
                    value={directiveNote}
                    onChange={(e) => setDirectiveNote(e.target.value)}
                    placeholder="e.g. Deploy suction jetting crew immediately. Set up safety barricades around excavation site..."
                    className="w-full p-2 bg-surface border border-outline-variant rounded focus:border-primary outline-none resize-none leading-relaxed"
                  ></textarea>
                </div>

                <div className="flex items-center justify-between pt-md border-t border-outline-variant">
                  <button
                    type="button"
                    onClick={() => navigateTo('track', selectedComplaint.id)}
                    className="text-primary font-bold hover:underline"
                  >
                    View Citizen Tracking View →
                  </button>

                  <button
                    type="submit"
                    className="bg-primary-container text-on-primary font-bold px-6 py-2.5 rounded hover:bg-primary transition-all shadow-md active:scale-95 flex items-center gap-2"
                  >
                    <span className="material-symbols-outlined text-sm">send_and_archive</span>
                    <span>Issue Directive & Dispatch Crew</span>
                  </button>
                </div>
              </form>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}

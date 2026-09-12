import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useCivic, API_BASE } from '../context/CivicContext';
import AdminSidebar from '../components/AdminSidebar';

export default function AdminTakeActionPage() {
  const { complaints, activeTrackId, updateComplaintStatus, showNotification, navigateTo, authToken } = useCivic();

  // Selected complaint for action, defaults to activeTrackId or first critical
  const [selectedId, setSelectedId] = useState(() => {
    return activeTrackId || (complaints.find(c => c.priority === 'Critical') || complaints[0])?.id || 'PP24891';
  });

  const selectedComplaint = complaints.find(c => c.id === selectedId || c.display_id === selectedId) || complaints[0] || {};

  const [assignedDepartment, setAssignedDepartment] = useState(selectedComplaint.assignedDepartment || 'Public Works Department (PWD)');
  const [assignedOfficer, setAssignedOfficer] = useState(selectedComplaint.assignedOfficer || 'Er. Rajesh Kumar');
  const [budget, setBudget] = useState('');
  const [budgetLoading, setBudgetLoading] = useState(false);
  const [budgetError, setBudgetError] = useState(null);
  const [aiExplanation, setAiExplanation] = useState(null);
  const [aiBudgets, setAiBudgets] = useState({});
  const [directiveNote, setDirectiveNote] = useState('');
  const [deadline, setDeadline] = useState('24 Hours');
  const [newStatus, setNewStatus] = useState('In Progress');

  const abortControllerRef = useRef(null);

  // Dynamically analyze the selected complaint and fetch AI-determined budget
  const fetchAiBudget = useCallback(async (complaint, forceRefresh = false) => {
    if (!complaint || (!complaint.id && !complaint.display_id)) return;
    const cid = complaint.id || complaint.display_id;

    // Check if complaint already has a finalized official budget assigned (and not 'Allocating...')
    const hasOfficialBudget = complaint.budget &&
      complaint.budget !== 'Allocating...' &&
      !complaint.budget.toLowerCase().includes('allocat');

    if (!forceRefresh && hasOfficialBudget) {
      setBudget(complaint.budget);
      setBudgetLoading(false);
      setBudgetError(null);
      setAiExplanation(null);
      return;
    }

    // Check cached AI budget for this complaint
    if (!forceRefresh && aiBudgets[cid]) {
      const cached = aiBudgets[cid];
      setBudget(cached.formatted_budget);
      setAiExplanation(cached.explanation || null);
      setBudgetLoading(false);
      setBudgetError(null);
      return;
    }

    // Abort previous inflight request if user rapidly toggles complaints
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    const controller = new AbortController();
    abortControllerRef.current = controller;

    setBudgetLoading(true);
    setBudgetError(null);
    setBudget('Calculating AI Budget...');
    setAiExplanation(null);

    try {
      const headers = {
        'Content-Type': 'application/json',
        ...(authToken ? { Authorization: `Bearer ${authToken}` } : {})
      };

      const payload = {
        problem_id: complaint.id,
        display_id: complaint.display_id || complaint.id,
        title: complaint.title,
        description: complaint.description,
        category: complaint.category,
        location: complaint.location,
        district: complaint.district,
        state: complaint.state,
        priority: complaint.priority,
        ai_severity_score: complaint.aiSeverityScore || complaint.ai_severity_score || 75,
        ai_summary: complaint.ai_summary || complaint.description
      };

      const res = await fetch(`${API_BASE}/ai/estimate-budget`, {
        method: 'POST',
        headers,
        signal: controller.signal,
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        throw new Error(`Server returned ${res.status}`);
      }

      const data = await res.json();
      const formatted = data.formatted_budget || `₹${Number(data.recommended_budget).toLocaleString('en-IN')}`;

      setBudget(formatted);
      setAiExplanation(data.explanation || null);
      setBudgetError(null);

      setAiBudgets(prev => ({
        ...prev,
        [cid]: {
          formatted_budget: formatted,
          recommended_budget: data.recommended_budget,
          explanation: data.explanation
        }
      }));
    } catch (err) {
      if (err.name === 'AbortError') {
        return;
      }
      console.error("AI Budget Estimation error:", err);
      setBudgetError("AI budget calculation failed. Please enter amount manually.");
      setBudget("");
    } finally {
      setBudgetLoading(false);
    }
  }, [authToken, aiBudgets]);

  // Keep selected complaint synced with activeTrackId whenever user clicks Execute on a specific cluster/problem
  useEffect(() => {
    if (activeTrackId) {
      const match = complaints.find(c => c.id === activeTrackId || c.display_id === activeTrackId);
      if (match) {
        setSelectedId(match.id || match.display_id);
      } else {
        setSelectedId(activeTrackId);
      }
    }
  }, [activeTrackId, complaints]);

  // Synchronize fields and trigger AI budget estimation whenever selectedId or complaints change
  useEffect(() => {
    if (!complaints || complaints.length === 0) return;
    const match = complaints.find(c => c.id === selectedId || c.display_id === selectedId) || complaints[0];
    if (match) {
      if (match.id !== selectedId && match.display_id !== selectedId) {
        setSelectedId(match.id || match.display_id);
      }
      setAssignedDepartment(match.assignedDepartment || 'Public Works Department (PWD)');
      setAssignedOfficer(match.assignedOfficer || 'Under Assignment');
      fetchAiBudget(match);
    }
  }, [selectedId, complaints.length]);

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
                    setSelectedId(item.id || item.display_id);
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
                    <input
                      type="text"
                      required
                      value={assignedDepartment}
                      onChange={(e) => setAssignedDepartment(e.target.value)}
                      placeholder="e.g. Public Works Department (PWD)"
                      className="w-full p-2 bg-surface border border-outline-variant rounded focus:border-primary outline-none font-medium"
                    />
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
                    <div className="flex justify-between items-center mb-1">
                      <label className="block font-bold text-on-surface">Emergency Budget Allocation</label>
                      {budgetLoading ? (
                        <span className="text-[10px] text-primary flex items-center gap-1 font-semibold animate-pulse">
                          <span className="material-symbols-outlined text-xs animate-spin">sync</span>
                          AI Calculating...
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => fetchAiBudget(selectedComplaint, true)}
                          title="Recalculate AI recommended budget"
                          className="text-[10px] text-primary hover:underline flex items-center gap-0.5 font-medium cursor-pointer"
                        >
                          <span className="material-symbols-outlined text-xs text-gov-saffron">auto_awesome</span>
                          AI Recalculate
                        </button>
                      )}
                    </div>
                    <div className="relative">
                      <input
                        type="text"
                        value={budget}
                        onChange={(e) => setBudget(e.target.value)}
                        placeholder={budgetLoading ? "Calculating AI Budget..." : "e.g. ₹85,000"}
                        className={`w-full p-2 bg-surface border rounded focus:border-primary outline-none font-mono ${
                          budgetLoading ? 'bg-surface-container/60 cursor-wait border-primary/50' :
                          budgetError ? 'border-error text-error' : 'border-outline-variant'
                        }`}
                      />
                      {budgetLoading && (
                        <div className="absolute right-2.5 top-2.5">
                          <span className="material-symbols-outlined text-sm text-primary animate-spin">sync</span>
                        </div>
                      )}
                    </div>
                    {budgetError && (
                      <p className="text-[11px] text-error mt-1 flex items-center gap-1">
                        <span className="material-symbols-outlined text-xs">error</span>
                        {budgetError}
                      </p>
                    )}
                    {!budgetLoading && !budgetError && aiExplanation && (
                      <p className="text-[10px] text-on-surface-variant mt-1 line-clamp-2" title={aiExplanation}>
                        <span className="font-semibold text-primary">AI Rationale:</span> {aiExplanation}
                      </p>
                    )}
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
                      <option value="Rejected">Rejected (Out of Scope / Invalid)</option>
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

                <div className="flex items-center justify-end pt-md border-t border-outline-variant">
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

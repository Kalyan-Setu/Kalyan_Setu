import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useCivic, API_BASE } from '../context/CivicContext';
import { useLanguage } from '../context/LanguageContext';
import AdminSidebar from '../components/AdminSidebar';

export default function AdminTakeActionPage() {
  const { complaints, activeTrackId, updateComplaintStatus, showNotification, navigateTo, authToken } = useCivic();
  const { t } = useLanguage();

  // Track which fields were pre-filled by AI recommendation
  const [aiFilledFields, setAiFilledFields] = useState([]);
  const [aiRecommendationApplied, setAiRecommendationApplied] = useState(false);

  // Active complaints excluding Deleted / Rejected
  const activeComplaints = React.useMemo(() => {
    return complaints.filter(c => c.status !== 'Deleted' && c.status !== 'Rejected');
  }, [complaints]);

  // Selected complaint for action, defaults to activeTrackId or first critical
  const [selectedId, setSelectedId] = useState(() => {
    return activeTrackId || (complaints.find(c => (c.aiSeverityScore || c.ai_severity_score || 0) >= 80 && c.status !== 'Deleted' && c.status !== 'Rejected') || complaints[0])?.id || 'PP24891';
  });

  const selectedComplaint = activeComplaints.find(c => c.id === selectedId || c.display_id === selectedId) || activeComplaints[0] || {};
  const selectedSeverity = selectedComplaint.aiSeverityScore ?? selectedComplaint.ai_severity_score;

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
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectPreset, setRejectPreset] = useState('Out of scope / non-civic jurisdictional matter');
  const [customRejectNote, setCustomRejectNote] = useState('');
  const [rejecting, setRejecting] = useState(false);

  const abortControllerRef = useRef(null);

  // Load AI recommendation if pre-applied from AI Analysis page
  useEffect(() => {
    const stored = sessionStorage.getItem('ai_recommendation_applied');
    if (stored) {
      try {
        const rec = JSON.parse(stored);
        if (rec.display_id === selectedId || rec.display_id === (selectedComplaint.display_id || selectedComplaint.id)) {
          if (rec.department) { setAssignedDepartment(rec.department); }
          if (rec.officer) { setAssignedOfficer(rec.officer); }
          if (rec.budget) { setBudget(rec.budget); }
          if (rec.directive) { setDirectiveNote(rec.directive); }
          if (rec.sla) { setDeadline(rec.sla); }
          setAiFilledFields(rec.fields || []);
          setAiRecommendationApplied(true);
          sessionStorage.removeItem('ai_recommendation_applied');
        }
      } catch {}
    }
  }, [selectedId]);

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
      const resp = await fetch(`${API_BASE}/ai/budget-estimate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(authToken ? { 'Authorization': `Bearer ${authToken}` } : {})
        },
        body: JSON.stringify({
          complaint_id: cid,
          title: complaint.title || '',
          description: complaint.description || '',
          category: complaint.category || 'Road Infrastructure',
          severity_score: complaint.aiSeverityScore || complaint.ai_severity_score || 50,
          location: complaint.location || '',
          district: complaint.district || 'Central District'
        }),
        signal: controller.signal
      });

      if (!resp.ok) {
        throw new Error(`Budget API returned ${resp.status}`);
      }

      const data = await resp.json();
      setBudget(data.formatted_budget);
      setAiExplanation(data.explanation || null);
      setAiBudgets(prev => ({ ...prev, [cid]: data }));
    } catch (err) {
      if (err.name === 'AbortError') return;
      console.warn('AI Budget estimation error:', err);
      const fallbackBudget = complaint.budget || '₹45,000';
      setBudget(fallbackBudget);
      setBudgetError('AI estimate unavailable, using departmental standard rate');
    } finally {
      setBudgetLoading(false);
    }
  }, [aiBudgets, authToken]);

  useEffect(() => {
    if (selectedComplaint && (selectedComplaint.id || selectedComplaint.display_id)) {
      setAssignedDepartment(selectedComplaint.assignedDepartment || 'Public Works Department (PWD)');
      setAssignedOfficer(selectedComplaint.assignedOfficer || 'Er. Rajesh Kumar');
      fetchAiBudget(selectedComplaint);
    }
  }, [selectedId, fetchAiBudget]);

  const handleDispatch = (e) => {
    e.preventDefault();
    if (!directiveNote.trim()) {
      showNotification(t('messages.requiredField'), 'error');
      return;
    }

    updateComplaintStatus(
      selectedComplaint.id || selectedComplaint.display_id,
      newStatus,
      directiveNote,
      'Administrative Authority',
      assignedDepartment,
      budget
    );
    showNotification(`Directive issued for #${selectedComplaint.display_id || selectedComplaint.id}!`);
    setDirectiveNote('');
  };

  const handleConfirmReject = async () => {
    if (!selectedComplaint || (!selectedComplaint.id && !selectedComplaint.display_id)) return;
    setRejecting(true);
    const targetId = selectedComplaint.display_id || selectedComplaint.id;
    const reasonText = customRejectNote.trim()
      ? `${rejectPreset} — ${customRejectNote.trim()}`
      : rejectPreset;

    await updateComplaintStatus(
      targetId,
      'Rejected',
      `Grievance Rejected: ${reasonText}`,
      'Administrative Authority',
      selectedComplaint.assignedDepartment || 'Urban Affairs Oversight',
      '₹0'
    );
    showNotification(`Grievance #${targetId} has been Rejected.`);
    setShowRejectModal(false);
    setCustomRejectNote('');
    setRejecting(false);
  };

  return (
    <div className="flex-grow w-full flex flex-col md:flex-row bg-surface min-h-[calc(100vh-5rem)]">
      <AdminSidebar />

      <main className="flex-1 p-3 sm:p-6 md:p-xl overflow-y-auto max-w-7xl w-full">
        {/* AI Recommendation Applied Banner */}
        {aiRecommendationApplied && (
          <div className="mb-md bg-teal-500/10 border border-teal-500/30 rounded-xl p-3 flex items-start sm:items-center gap-3 animate-in slide-in-from-top-2">
            <div className="w-8 h-8 rounded-full bg-teal-500/20 flex items-center justify-center flex-shrink-0 mt-0.5 sm:mt-0">
              <span className="material-symbols-outlined text-teal-600 text-base">smart_toy</span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-bold text-teal-700">🤖 {t('admin.aiRecApplied')}</div>
              <div className="text-[11px] text-teal-600 mt-0.5 leading-relaxed">{t('admin.aiRecDesc')}</div>
            </div>
            <button onClick={() => setAiRecommendationApplied(false)} className="text-teal-500 hover:text-teal-700 text-sm p-1 shrink-0 cursor-pointer">✕</button>
          </div>
        )}

        {/* Header */}
        <div className="mb-md sm:mb-lg border-b border-outline-variant pb-md">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-error mb-1">
            <span className="material-symbols-outlined text-sm">bolt</span>
            <span>{t('admin.kpi.criticalAlerts')}</span>
          </div>
          <h1 className="font-headline-lg text-xl sm:text-2xl md:text-3xl font-bold text-primary">
            {t('admin.actionDirectives')}
          </h1>
          <p className="font-body-md text-xs text-on-surface-variant mt-1">
            {t('admin.actionSubtitle')}
          </p>
        </div>

        {/* Bento Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-md sm:gap-lg">
          {/* Left Column: Rapid Response Requests Queue (4 cols) */}
          <section className="lg:col-span-4 flex flex-col gap-sm sm:gap-md">
            <h2 className="font-headline-sm text-xs sm:text-sm font-bold text-primary flex items-center justify-between border-b border-outline-variant pb-2">
              <div className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-error text-lg">warning</span>
                <span>{t('admin.kpi.criticalAlerts')}</span>
              </div>
              <span className="text-[10px] text-on-surface-variant font-normal lg:hidden">Swipe →</span>
            </h2>

            {/* Horizontal scroll on mobile (< lg), vertical stack on desktop (lg+) */}
            <div className="flex lg:flex-col gap-2.5 overflow-x-auto lg:overflow-visible pb-2 lg:pb-0 no-scrollbar">
              {[...activeComplaints].sort((a, b) => {
                const scoreA = a.aiSeverityScore || a.ai_severity_score || 0;
                const scoreB = b.aiSeverityScore || b.ai_severity_score || 0;
                return scoreB - scoreA;
              }).map((item) => (
                <div
                  key={item.id}
                  onClick={() => {
                    setSelectedId(item.id || item.display_id);
                  }}
                  className={`p-3 rounded-lg border cursor-pointer transition-all min-w-[240px] sm:min-w-[280px] lg:min-w-0 shrink-0 lg:shrink ${
                    selectedId === item.id
                      ? 'bg-primary-fixed/20 border-primary shadow-sm border-l-4 border-l-primary'
                      : 'bg-surface-container-lowest border-outline-variant hover:border-primary/60'
                  }`}
                >
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-mono text-[10px] font-bold text-primary">#{item.display_id || item.id}</span>
                    <span className="font-mono text-[10px] text-on-surface-variant">{item.dateFiled || item.date}</span>
                  </div>
                  <h3 className="text-xs font-bold text-on-surface line-clamp-1">{item.title}</h3>
                  <p className="text-[11px] text-on-surface-variant line-clamp-1 mt-0.5">{item.location}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Right Column: Strategic Directive Form (8 cols) */}
          <section className="lg:col-span-8">
            <div className="bg-surface-container-lowest border border-outline-variant rounded-lg p-4 sm:p-lg md:p-xl shadow-ambient flex flex-col gap-md sm:gap-lg">
              {/* Selected Grievance Overview Card */}
              <div className="bg-surface p-3 sm:p-md rounded-lg border border-outline-variant flex flex-col gap-2">
                <div className="flex justify-between items-center flex-wrap gap-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono text-xs font-bold text-primary bg-primary-fixed/40 px-2 py-0.5 rounded">
                      #{selectedComplaint.display_id || selectedComplaint.id}
                    </span>
                    <span className="text-xs font-bold text-on-surface">{selectedComplaint.title}</span>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-bold text-error">
                      {t('admin.ai.severityScore')}: {selectedSeverity == null ? t('common.pending') : `${selectedSeverity}/100`}
                    </span>
                  </div>
                </div>
                <p className="text-xs text-on-surface-variant leading-relaxed">
                  {selectedComplaint.description}
                </p>
                <div className="flex items-center gap-4 text-[11px] text-on-surface-variant pt-1 border-t border-outline-variant/60 flex-wrap">
                  <span>{t('common.location')}: <strong>{selectedComplaint.location}</strong></span>
                  <span>{t('contact.fullName')}: <strong>{selectedComplaint.reportedBy}</strong></span>
                  <span>{t('common.status')}: <strong className="text-primary">{t(`status.${selectedComplaint.status}`, selectedComplaint.status)}</strong></span>
                </div>
              </div>

              {/* Action Directive Form */}
              <form onSubmit={handleDispatch} className="flex flex-col gap-md text-xs">
                <h3 className="text-sm font-bold text-primary border-b border-outline-variant pb-2">
                  {t('admin.actionDirectives')}
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-md">
                  <div>
                    <label className="block font-bold text-on-surface mb-1 flex items-center gap-1.5">
                      {t('admin.assignDept')}
                    </label>
                    <input
                      type="text"
                      required
                      value={assignedDepartment}
                      onChange={(e) => setAssignedDepartment(e.target.value)}
                      placeholder="e.g. Public Works Department (PWD)"
                      className="w-full p-2.5 bg-surface border rounded focus:border-primary outline-none font-medium text-xs border-outline-variant"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-on-surface mb-1 flex items-center gap-1.5">
                      {t('admin.assignOfficer')}
                    </label>
                    <input
                      type="text"
                      required
                      value={assignedOfficer}
                      onChange={(e) => setAssignedOfficer(e.target.value)}
                      placeholder="e.g. Er. Rajesh Kumar"
                      className="w-full p-2.5 bg-surface border rounded focus:border-primary outline-none text-xs border-outline-variant"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-md">
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label className="block font-bold text-on-surface">{t('admin.approvedBudget')}</label>
                    </div>
                    <div className="relative">
                      <input
                        type="text"
                        value={budget}
                        onChange={(e) => setBudget(e.target.value)}
                        placeholder="e.g. ₹85,000"
                        className="w-full p-2.5 bg-surface border rounded focus:border-primary outline-none font-mono text-xs border-outline-variant"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-on-surface mb-1">{t('admin.slaDeadline')}</label>
                    <select
                      value={deadline}
                      onChange={(e) => setDeadline(e.target.value)}
                      className="w-full p-2.5 bg-surface border border-outline-variant rounded focus:border-primary outline-none text-xs"
                    >
                      <option>12 Hours (Immediate Critical)</option>
                      <option>24 Hours (High Urgency)</option>
                      <option>48 Hours (Standard SLA)</option>
                      <option>7 Days (Capital Infrastructure)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-on-surface mb-1">{t('admin.updateStatus')}</label>
                    <select
                      value={newStatus}
                      onChange={(e) => setNewStatus(e.target.value)}
                      className="w-full p-2.5 bg-surface border border-outline-variant rounded focus:border-primary outline-none font-bold text-primary text-xs"
                    >
                      <option value="Action Assigned">{t('status.Action Assigned')}</option>
                      <option value="In Progress">{t('status.In Progress')}</option>
                      <option value="Resolved">{t('status.Resolved')}</option>
                      <option value="Rejected">{t('status.Rejected')}</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-on-surface mb-1">{t('admin.directiveNote')}</label>
                  <textarea
                    rows={4}
                    value={directiveNote}
                    onChange={(e) => setDirectiveNote(e.target.value)}
                    placeholder="Provide official directives..."
                    className="w-full p-2.5 bg-surface border border-outline-variant rounded focus:border-primary outline-none resize-none leading-relaxed text-xs"
                  ></textarea>
                </div>

                <div className="flex items-center justify-between pt-md border-t border-outline-variant flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={() => setShowRejectModal(true)}
                    className="bg-error/10 hover:bg-error/20 text-error border border-error/30 font-bold px-5 py-2.5 rounded transition-all shadow-sm active:scale-95 flex items-center gap-2 text-xs cursor-pointer min-h-[44px]"
                  >
                    <span className="material-symbols-outlined text-sm">block</span>
                    <span>{t('admin.rejectGrievance')}</span>
                  </button>

                  <button
                    type="submit"
                    className="w-full sm:w-auto bg-primary-container text-on-primary font-bold px-6 py-3 rounded hover:bg-primary transition-all shadow-md active:scale-95 flex items-center justify-center gap-2 min-h-[44px] cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-sm">send_and_archive</span>
                    <span>{t('admin.issueDirective')}</span>
                  </button>
                </div>
              </form>
            </div>
          </section>
        </div>

        {/* Rejection Modal */}
        {showRejectModal && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-surface rounded-xl max-w-md w-full border border-outline-variant shadow-2xl p-6 flex flex-col gap-4 animate-in fade-in zoom-in-95">
              <div className="flex items-start justify-between border-b border-outline-variant pb-3">
                <div className="flex items-center gap-2.5 text-error">
                  <div className="w-9 h-9 rounded-full bg-error/15 flex items-center justify-center">
                    <span className="material-symbols-outlined text-xl">block</span>
                  </div>
                  <div>
                    <h3 className="font-bold text-base text-on-surface">{t('admin.rejectModalTitle')} #{selectedComplaint.display_id || selectedComplaint.id}</h3>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowRejectModal(false)}
                  className="text-on-surface-variant hover:text-on-surface text-lg p-1 cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <div className="flex flex-col gap-3 text-xs">
                <div>
                  <label className="block font-bold text-on-surface mb-1">{t('admin.rejectReason')}</label>
                  <select
                    value={rejectPreset}
                    onChange={(e) => setRejectPreset(e.target.value)}
                    className="w-full p-2.5 bg-surface-container border border-outline-variant rounded focus:border-error outline-none font-medium"
                  >
                    <option value="Out of scope / non-civic jurisdictional matter">Out of scope / non-civic jurisdictional matter</option>
                    <option value="Duplicate grievance already actioned or resolved">Duplicate grievance already actioned or resolved</option>
                    <option value="Insufficient or unverifiable location details">Insufficient or unverifiable location details</option>
                    <option value="Ineligible or false public claim">Ineligible or false public claim</option>
                    <option value="Private property / non-municipal domain">Private property / non-municipal domain</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-on-surface mb-1">{t('common.details')}</label>
                  <textarea
                    rows={3}
                    value={customRejectNote}
                    onChange={(e) => setCustomRejectNote(e.target.value)}
                    placeholder="Specific remarks..."
                    className="w-full p-2.5 bg-surface border border-outline-variant rounded focus:border-error outline-none resize-none"
                  ></textarea>
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-outline-variant">
                  <button
                    type="button"
                    onClick={() => setShowRejectModal(false)}
                    className="px-4 py-2 text-on-surface-variant font-bold rounded hover:bg-surface-container min-h-[40px] cursor-pointer"
                  >
                    {t('common.cancel')}
                  </button>
                  <button
                    type="button"
                    disabled={rejecting}
                    onClick={handleConfirmReject}
                    className="bg-error text-white font-bold px-4 py-2 rounded hover:bg-error/90 transition-colors min-h-[40px] flex items-center gap-1.5 cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-sm">block</span>
                    <span>{t('admin.confirmReject')}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

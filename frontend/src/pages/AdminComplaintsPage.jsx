import React, { useState } from 'react';
import { useCivic } from '../context/CivicContext';
import { useLanguage } from '../context/LanguageContext';
import AdminSidebar from '../components/AdminSidebar';

export default function AdminComplaintsPage() {
  const { complaints, updateComplaintStatus, deleteComplaint, bulkAssign, navigateTo, showNotification } = useCivic();
  const { t } = useLanguage();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [selectedIds, setSelectedIds] = useState([]);
  const [bulkModalOpen, setBulkModalOpen] = useState(false);
  const [bulkDept, setBulkDept] = useState('Public Works Department (PWD)');
  const [bulkOfficer, setBulkOfficer] = useState('Er. Rajesh Kumar');

  // Quick edit status modal
  const [editingComplaint, setEditingComplaint] = useState(null);
  const [newStatus, setNewStatus] = useState('');
  const [statusNote, setStatusNote] = useState('');

  const filteredComplaints = complaints.filter(item => {
    const matchesSearch =
      (item.title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.id || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.display_id || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.location || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.reportedBy || '').toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      selectedStatus === 'ALL' ? true : item.status === selectedStatus;

    const matchesCategory =
      selectedCategory === 'ALL' ? true : (item.category || '').includes(selectedCategory);

    return matchesSearch && matchesStatus && matchesCategory;
  });

  const toggleSelectAll = () => {
    if (selectedIds.length === filteredComplaints.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredComplaints.map(c => c.id));
    }
  };

  const toggleSelectOne = (id) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter(item => item !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const handleBulkAssignSubmit = (e) => {
    e.preventDefault();
    bulkAssign(selectedIds, bulkDept, bulkOfficer);
    setBulkModalOpen(false);
    setSelectedIds([]);
  };

  const handleStatusUpdateSubmit = (e) => {
    e.preventDefault();
    if (editingComplaint) {
      updateComplaintStatus(editingComplaint.id, newStatus, statusNote);
      setEditingComplaint(null);
      setNewStatus('');
      setStatusNote('');
    }
  };

  const exportReport = () => {
    const csvContent = "data:text/csv;charset=utf-8," + 
      ["ID,Title,Category,SeverityScore,Status,Location,DateFiled,Officer"]
      .concat(filteredComplaints.map(c => `"${c.display_id || c.id}","${c.title}","${c.category}","${c.aiSeverityScore || c.ai_severity_score || 'Pending'}","${c.status}","${c.location}","${c.dateFiled || c.date}","${c.assignedOfficer}"`))
      .join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `kalyan_setu_complaints_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showNotification("Complaints report exported as CSV!");
  };

  return (
    <div className="flex-grow w-full flex flex-col md:flex-row bg-surface min-h-[calc(100vh-5rem)]">
      <AdminSidebar />

      <main className="flex-1 p-3 sm:p-6 md:p-xl overflow-y-auto max-w-7xl w-full">
        {/* Header & Primary Actions */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-md mb-md sm:mb-lg border-b border-outline-variant pb-md">
          <div>
            <h1 className="font-headline-lg text-xl sm:text-2xl md:text-3xl font-bold text-primary">
              {t('admin.complaintsTitle')}
            </h1>
            <p className="font-body-md text-xs text-on-surface-variant mt-1">
              {t('admin.complaintsSubtitle')}
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap w-full sm:w-auto">
            <button
              onClick={exportReport}
              className="flex-1 sm:flex-initial bg-surface-container-lowest border border-outline-variant text-primary font-bold text-xs px-3.5 py-2.5 rounded hover:bg-surface-container transition-colors flex items-center justify-center gap-1.5 shadow-ambient min-h-[38px] cursor-pointer"
            >
              <span className="material-symbols-outlined text-sm">download</span>
              <span>{t('admin.exportCsv')}</span>
            </button>

            {selectedIds.length > 0 && (
              <button
                onClick={() => setBulkModalOpen(true)}
                className="flex-1 sm:flex-initial bg-gov-saffron text-primary font-bold text-xs px-4 py-2.5 rounded hover:bg-gov-saffron/90 transition-all flex items-center justify-center gap-1.5 shadow-sm active:scale-95 animate-pulse min-h-[38px] cursor-pointer"
              >
                <span className="material-symbols-outlined text-sm">group_add</span>
                <span>{t('admin.bulkAssign')} ({selectedIds.length})</span>
              </button>
            )}
          </div>
        </div>

        {/* Filters Bar */}
        <div className="bg-surface-container-lowest p-3 sm:p-md rounded-lg border border-outline-variant shadow-ambient mb-md flex flex-col gap-md">
          <div className="flex flex-col md:flex-row gap-2.5 sm:gap-md justify-between items-stretch md:items-center">
            {/* Search */}
            <div className="relative flex-grow md:max-w-md">
              <span className="material-symbols-outlined absolute left-3 top-2.5 text-on-surface-variant text-base">
                search
              </span>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={t('citizen.filterSearch')}
                className="w-full pl-9 pr-3 py-2 text-xs bg-surface border border-outline-variant rounded focus:border-primary outline-none min-h-[38px]"
              />
            </div>

            {/* Category Dropdown */}
            <div className="flex items-center gap-2">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="text-xs bg-surface border border-outline-variant rounded px-2.5 py-2 text-on-surface focus:border-primary outline-none min-h-[38px] w-full sm:w-auto"
              >
                <option value="ALL">{t('citizen.filterCategory')}</option>
                <option value="Road">{t('category.Road Infrastructure')}</option>
                <option value="Drainage">{t('category.Drainage & Water Supply')}</option>
                <option value="Sanitation">{t('category.Solid Waste & Sanitation')}</option>
                <option value="Electricity">{t('category.Electricity & Lighting')}</option>
                <option value="Safety">{t('category.Public Safety')}</option>
              </select>
            </div>
          </div>

          {/* Status Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto border-t border-outline-variant pt-2 pb-1 no-scrollbar">
            {['ALL', 'Submitted', 'Under Review', 'Action Assigned', 'In Progress', 'Resolved', 'Rejected', 'Deleted'].map((st) => (
              <button
                key={st}
                onClick={() => setSelectedStatus(st)}
                className={`px-3 py-1.5 text-xs font-label-md rounded transition-all whitespace-nowrap min-h-[32px] cursor-pointer ${
                  selectedStatus === st
                    ? 'bg-primary-container text-white font-bold shadow-sm'
                    : 'text-on-surface-variant hover:bg-surface-container'
                }`}
              >
                {st === 'ALL' ? t('common.all') : t(`status.${st}`, st)}
              </button>
            ))}
          </div>
        </div>

        {/* Complaints Data Table & Mobile Cards */}
        <div className="bg-surface-container-lowest border border-outline-variant rounded-lg overflow-hidden shadow-ambient">
          {/* Mobile Card List (< sm) */}
          <div className="block sm:hidden divide-y divide-outline-variant/60">
            {filteredComplaints.length === 0 ? (
              <div className="p-6 text-center text-xs text-on-surface-variant">
                {t('citizen.noGrievances')}
              </div>
            ) : (
              filteredComplaints.map((item) => (
                <div
                  key={item.id}
                  className={`p-3 flex flex-col gap-2 transition-colors ${
                    selectedIds.includes(item.id) ? 'bg-primary-fixed/20' : ''
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(item.id)}
                        onChange={() => toggleSelectOne(item.id)}
                        className="rounded border-outline-variant"
                      />
                      <button
                        onClick={() => navigateTo('admin_action', item.id)}
                        className="font-mono font-bold text-primary hover:underline text-xs"
                      >
                        #{item.display_id || item.id}
                      </button>
                    </div>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                        item.status === 'Resolved'
                          ? 'bg-gov-green/15 text-gov-green border border-gov-green/30'
                          : item.status === 'Rejected'
                          ? 'bg-error/15 text-error border border-error/30 font-extrabold'
                          : item.status === 'Deleted'
                          ? 'bg-error/10 text-error/80 border border-error/20 line-through'
                          : item.status === 'In Progress' || item.status === 'Action Assigned'
                          ? 'bg-secondary-container/30 text-on-secondary-fixed-variant'
                          : 'bg-surface-container-high text-on-surface-variant'
                      }`}>
                        {t(`status.${item.status}`, item.status)}
                      </span>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-xs font-bold text-on-surface line-clamp-2">{item.title}</h3>
                    <div className="text-[10px] text-on-surface-variant mt-0.5 flex items-center justify-between">
                      <span>{t(`category.${item.category}`, item.category)}</span>
                      <span>By {item.reportedBy}</span>
                    </div>
                    <div className="text-[10px] text-on-surface-variant mt-0.5 flex items-center gap-1">
                      <span className="material-symbols-outlined text-[12px] text-primary">location_on</span>
                      <span className="truncate">{item.location}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1.5 border-t border-outline-variant/40 text-[10px]">
                    <div className="truncate max-w-[130px] text-on-surface-variant">
                      {item.assignedOfficer || 'Officer Unassigned'}
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      {item.status !== 'Deleted' && item.status !== 'Rejected' && (
                        <button
                          onClick={() => navigateTo('admin_ai', item.id || item.display_id)}
                          className="bg-gov-saffron/10 text-gov-saffron font-bold text-[10px] px-2 py-1 rounded flex items-center gap-0.5 min-h-[30px] cursor-pointer"
                        >
                          <span className="material-symbols-outlined text-xs">smart_toy</span>
                          <span>AI</span>
                        </button>
                      )}
                      <button
                        onClick={() => {
                          setEditingComplaint(item);
                          setNewStatus(item.status);
                          setStatusNote('');
                        }}
                        className="p-1.5 text-primary hover:bg-surface-container rounded transition-colors min-h-[30px] min-w-[30px] flex items-center justify-center border border-outline-variant cursor-pointer"
                        title={t('admin.updateStatus')}
                      >
                        <span className="material-symbols-outlined text-sm">edit_note</span>
                      </button>
                      {item.status !== 'Deleted' && (
                        <button
                          onClick={() => navigateTo('admin_action', item.id)}
                          className="bg-primary-container text-on-primary font-bold text-[10px] px-2.5 py-1 rounded hover:bg-primary flex items-center gap-0.5 min-h-[30px] cursor-pointer"
                        >
                          <span>{t('navbar.takeAction')}</span>
                          <span className="material-symbols-outlined text-xs">arrow_forward</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Desktop Table (sm+) */}
          <div className="hidden sm:block overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-surface-container border-b border-outline-variant text-on-surface-variant font-bold">
                  <th className="p-3 w-8">
                    <input
                      type="checkbox"
                      checked={selectedIds.length > 0 && selectedIds.length === filteredComplaints.length}
                      onChange={toggleSelectAll}
                      className="rounded border-outline-variant"
                    />
                  </th>
                  <th className="p-3">{t('citizen.table.id')}</th>
                  <th className="p-3">{t('citizen.table.problem')}</th>
                  <th className="p-3">{t('common.location')}</th>
                  <th className="p-3">{t('admin.ai.severityScore')}</th>
                  <th className="p-3">{t('track.department')}</th>
                  <th className="p-3">{t('common.status')}</th>
                  <th className="p-3 text-right">{t('common.actions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/60">
                {filteredComplaints.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="p-8 text-center text-on-surface-variant">
                      {t('citizen.noGrievances')}
                    </td>
                  </tr>
                ) : (
                  filteredComplaints.map((item) => (
                    <tr
                      key={item.id}
                      className={`hover:bg-surface-container-low transition-colors ${
                        selectedIds.includes(item.id) ? 'bg-primary-fixed/20' : ''
                      }`}
                    >
                      <td className="p-3">
                        <input
                          type="checkbox"
                          checked={selectedIds.includes(item.id)}
                          onChange={() => toggleSelectOne(item.id)}
                          className="rounded border-outline-variant"
                        />
                      </td>

                      <td className="p-3 font-mono font-bold text-primary">
                        <button
                          onClick={() => navigateTo('admin_action', item.id)}
                          className="hover:underline cursor-pointer"
                        >
                          #{item.display_id || item.id}
                        </button>
                      </td>

                      <td className="p-3">
                        <div className="font-bold text-on-surface line-clamp-1">{item.title}</div>
                        <div className="text-[10px] text-on-surface-variant">{t(`category.${item.category}`, item.category)}</div>
                      </td>

                      <td className="p-3">
                        <div className="text-on-surface font-medium line-clamp-1">{item.location}</div>
                        <div className="text-[10px] text-on-surface-variant">By {item.reportedBy} ({item.dateFiled || item.date})</div>
                      </td>

                      <td className="p-3">
                        <div className="flex flex-col gap-1">
                          {(item.aiSeverityScore || item.ai_severity_score) ? (
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded w-fit ${
                              (item.aiSeverityScore || item.ai_severity_score) >= 80
                                ? 'bg-error/10 text-error border border-error/20'
                                : (item.aiSeverityScore || item.ai_severity_score) >= 60
                                ? 'bg-amber-500/10 text-amber-600 border border-amber-500/20'
                                : 'bg-gov-green/10 text-gov-green border border-gov-green/20'
                            }`}>
                              🤖 {item.aiSeverityScore || item.ai_severity_score}/100
                            </span>
                          ) : (
                            <span className="text-[10px] text-on-surface-variant font-medium bg-surface-container px-2 py-0.5 rounded w-fit">
                              {t('common.pending')}
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="p-3">
                        <div className="text-on-surface font-medium truncate max-w-[140px]">{item.assignedOfficer}</div>
                        <div className="text-[10px] text-on-surface-variant truncate max-w-[140px]">{item.assignedDepartment}</div>
                      </td>

                      <td className="p-3">
                        <span className={`text-[10px] font-bold uppercase px-2.5 py-1 rounded inline-block ${
                          item.status === 'Resolved'
                            ? 'bg-gov-green/15 text-gov-green border border-gov-green/30'
                            : item.status === 'Rejected'
                            ? 'bg-error/15 text-error border border-error/30 font-extrabold'
                            : item.status === 'Deleted'
                            ? 'bg-error/10 text-error/80 border border-error/20 line-through font-extrabold'
                            : item.status === 'In Progress' || item.status === 'Action Assigned'
                            ? 'bg-secondary-container/30 text-on-secondary-fixed-variant border border-secondary-container/50'
                            : 'bg-surface-container-high text-on-surface-variant border border-outline-variant'
                        }`}>
                          {t(`status.${item.status}`, item.status)}
                        </span>
                      </td>

                      <td className="p-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {item.status !== 'Deleted' && item.status !== 'Rejected' && (
                            <button
                              onClick={() => navigateTo('admin_ai', item.id || item.display_id)}
                              title="Run AI Workflow"
                              className="bg-gov-saffron/10 text-gov-saffron hover:bg-gov-saffron/20 font-bold text-[10px] px-2 py-1 rounded transition-colors flex items-center gap-0.5 cursor-pointer"
                            >
                              <span className="material-symbols-outlined text-xs">smart_toy</span>
                              <span>AI</span>
                            </button>
                          )}
                          <button
                            onClick={() => {
                              setEditingComplaint(item);
                              setNewStatus(item.status);
                              setStatusNote('');
                            }}
                            title={t('admin.updateStatus')}
                            className="p-1 text-primary hover:bg-surface-container rounded transition-colors cursor-pointer"
                          >
                            <span className="material-symbols-outlined text-base">edit_note</span>
                          </button>
                          {item.status !== 'Deleted' && (
                            <button
                              onClick={() => navigateTo('admin_action', item.id)}
                              title={t('navbar.takeAction')}
                              className="bg-primary-container text-on-primary font-bold text-[11px] px-2.5 py-1 rounded hover:bg-primary transition-all flex items-center gap-0.5 cursor-pointer"
                            >
                              <span>{t('navbar.takeAction')}</span>
                              <span className="material-symbols-outlined text-xs">arrow_forward</span>
                            </button>
                          )}
                          {item.status !== 'Deleted' && (
                            <button
                              onClick={() => {
                                if (window.confirm(`Delete grievance #${item.display_id || item.id}?`)) {
                                  deleteComplaint(item.id || item.display_id);
                                }
                              }}
                              title={t('common.delete')}
                              className="p-1 text-error/70 hover:text-error hover:bg-error/10 rounded transition-colors cursor-pointer"
                            >
                              <span className="material-symbols-outlined text-base">delete</span>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="p-3 bg-surface-container text-xs text-on-surface-variant flex justify-between items-center border-t border-outline-variant">
            <span>Showing {filteredComplaints.length} of {complaints.length} Total Records</span>
            <div className="flex gap-2">
              <span className="font-semibold text-primary">Page 1 of 1</span>
            </div>
          </div>
        </div>

        {/* Quick Edit Status Modal */}
        {editingComplaint && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-primary/50 backdrop-blur-sm">
            <div className="bg-surface-container-lowest p-4 sm:p-lg rounded-xl border border-outline-variant shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-md border-b border-outline-variant pb-2">
                <h3 className="font-bold text-sm text-primary">{t('admin.updateStatus')}: #{editingComplaint.display_id || editingComplaint.id}</h3>
                <button onClick={() => setEditingComplaint(null)} className="text-on-surface-variant p-1 rounded hover:bg-surface-container cursor-pointer">
                  <span className="material-symbols-outlined text-base">close</span>
                </button>
              </div>

              <form onSubmit={handleStatusUpdateSubmit} className="flex flex-col gap-md text-xs">
                <div>
                  <label className="block font-bold text-on-surface mb-1">{t('admin.updateStatus')}</label>
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value)}
                    className="w-full p-2.5 bg-surface border border-outline-variant rounded focus:border-primary outline-none font-bold"
                  >
                    <option value="Submitted">{t('status.Submitted')}</option>
                    <option value="Under Review">{t('status.Under Review')}</option>
                    <option value="Action Assigned">{t('status.Action Assigned')}</option>
                    <option value="In Progress">{t('status.In Progress')}</option>
                    <option value="Resolved">{t('status.Resolved')}</option>
                    <option value="Rejected">{t('status.Rejected')}</option>
                    <option value="Deleted">{t('status.Deleted')}</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-on-surface mb-1">{t('common.details')}</label>
                  <textarea
                    rows={3}
                    value={statusNote}
                    onChange={(e) => setStatusNote(e.target.value)}
                    placeholder="Official status note..."
                    className="w-full p-2.5 bg-surface border border-outline-variant rounded focus:border-primary outline-none resize-none"
                  ></textarea>
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-outline-variant">
                  <button
                    type="button"
                    onClick={() => setEditingComplaint(null)}
                    className="px-3 py-2 text-on-surface-variant font-bold rounded hover:bg-surface-container min-h-[40px] cursor-pointer"
                  >
                    {t('common.cancel')}
                  </button>
                  <button
                    type="submit"
                    className="bg-primary-container text-on-primary font-bold px-4 py-2 rounded hover:bg-primary transition-colors min-h-[40px] cursor-pointer"
                  >
                    {t('common.save')}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Bulk Assign Modal */}
        {bulkModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-primary/50 backdrop-blur-sm">
            <div className="bg-surface-container-lowest p-4 sm:p-lg rounded-xl border border-outline-variant shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-md border-b border-outline-variant pb-2">
                <h3 className="font-bold text-sm text-primary">{t('admin.bulkAssign')} ({selectedIds.length})</h3>
                <button onClick={() => setBulkModalOpen(false)} className="text-on-surface-variant p-1 rounded hover:bg-surface-container cursor-pointer">
                  <span className="material-symbols-outlined text-base">close</span>
                </button>
              </div>

              <form onSubmit={handleBulkAssignSubmit} className="flex flex-col gap-md text-xs">
                <div>
                  <label className="block font-bold text-on-surface mb-1">{t('admin.selectDepartment')}</label>
                  <input
                    type="text"
                    required
                    value={bulkDept}
                    onChange={(e) => setBulkDept(e.target.value)}
                    placeholder="e.g. Public Works Department (PWD)"
                    className="w-full p-2.5 bg-surface border border-outline-variant rounded focus:border-primary outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-on-surface mb-1">{t('admin.selectOfficer')}</label>
                  <input
                    type="text"
                    value={bulkOfficer}
                    onChange={(e) => setBulkOfficer(e.target.value)}
                    className="w-full p-2.5 bg-surface border border-outline-variant rounded focus:border-primary outline-none"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-outline-variant">
                  <button
                    type="button"
                    onClick={() => setBulkModalOpen(false)}
                    className="px-3 py-2 text-on-surface-variant font-bold rounded hover:bg-surface-container min-h-[40px] cursor-pointer"
                  >
                    {t('common.cancel')}
                  </button>
                  <button
                    type="submit"
                    className="bg-gov-saffron text-primary font-bold px-4 py-2 rounded hover:bg-gov-saffron/90 transition-colors min-h-[40px] cursor-pointer"
                  >
                    {t('common.confirm')}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

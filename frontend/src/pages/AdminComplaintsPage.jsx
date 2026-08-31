import React, { useState } from 'react';
import { useCivic } from '../context/CivicContext';
import AdminSidebar from '../components/AdminSidebar';

export default function AdminComplaintsPage() {
  const { complaints, updateComplaintStatus, bulkAssign, navigateTo, showNotification } = useCivic();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [selectedPriority, setSelectedPriority] = useState('ALL');
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
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.reportedBy.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      selectedStatus === 'ALL' ? true : item.status === selectedStatus;

    const matchesPriority =
      selectedPriority === 'ALL' ? true : item.priority === selectedPriority;

    const matchesCategory =
      selectedCategory === 'ALL' ? true : item.category.includes(selectedCategory);

    return matchesSearch && matchesStatus && matchesPriority && matchesCategory;
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
      ["ID,Title,Category,Priority,Status,Location,DateFiled,Officer"]
      .concat(filteredComplaints.map(c => `"${c.id}","${c.title}","${c.category}","${c.priority}","${c.status}","${c.location}","${c.dateFiled}","${c.assignedOfficer}"`))
      .join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `peoples_priorities_complaints_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showNotification("Complaints report exported as CSV!");
  };

  return (
    <div className="flex-grow w-full flex bg-surface min-h-[calc(100vh-5rem)]">
      <AdminSidebar />

      <main className="flex-1 p-lg md:p-xl overflow-y-auto max-w-7xl">
        {/* Header & Primary Actions */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-md mb-lg border-b border-outline-variant pb-md">
          <div>
            <h1 className="font-headline-lg text-2xl sm:text-3xl font-bold text-primary">
              Complaints Management
            </h1>
            <p className="font-body-md text-xs text-on-surface-variant mt-1">
              Review, filter, dispatch, and update status for all reported citizen grievances.
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={exportReport}
              className="bg-surface-container-lowest border border-outline-variant text-primary font-bold text-xs px-3.5 py-2 rounded hover:bg-surface-container transition-colors flex items-center gap-1.5 shadow-ambient"
            >
              <span className="material-symbols-outlined text-sm">download</span>
              <span>Export CSV</span>
            </button>

            {selectedIds.length > 0 && (
              <button
                onClick={() => setBulkModalOpen(true)}
                className="bg-gov-saffron text-primary font-bold text-xs px-4 py-2 rounded hover:bg-gov-saffron/90 transition-all flex items-center gap-1.5 shadow-sm active:scale-95 animate-pulse"
              >
                <span className="material-symbols-outlined text-sm">group_add</span>
                <span>Bulk Assign ({selectedIds.length})</span>
              </button>
            )}
          </div>
        </div>

        {/* Filters Bar */}
        <div className="bg-surface-container-lowest p-md rounded-lg border border-outline-variant shadow-ambient mb-md flex flex-col gap-md">
          <div className="flex flex-col md:flex-row gap-md justify-between items-stretch md:items-center">
            {/* Search */}
            <div className="relative flex-grow md:max-w-md">
              <span className="material-symbols-outlined absolute left-3 top-2.5 text-on-surface-variant text-base">
                search
              </span>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by ID, keyword, citizen name, location..."
                className="w-full pl-9 pr-3 py-2 text-xs bg-surface border border-outline-variant rounded focus:border-primary outline-none"
              />
            </div>

            {/* Dropdowns */}
            <div className="flex items-center gap-2 flex-wrap">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="text-xs bg-surface border border-outline-variant rounded px-2.5 py-2 text-on-surface focus:border-primary outline-none"
              >
                <option value="ALL">All Categories</option>
                <option value="Road">Road Infrastructure</option>
                <option value="Water">Drainage & Water</option>
                <option value="Sanitation">Sanitation & Waste</option>
                <option value="Electricity">Electricity & Lighting</option>
                <option value="Safety">Public Safety</option>
              </select>

              <select
                value={selectedPriority}
                onChange={(e) => setSelectedPriority(e.target.value)}
                className="text-xs bg-surface border border-outline-variant rounded px-2.5 py-2 text-on-surface focus:border-primary outline-none"
              >
                <option value="ALL">All Priorities</option>
                <option value="Critical">Critical</option>
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
            </div>
          </div>

          {/* Status Tabs */}
          <div className="flex items-center gap-1 overflow-x-auto border-t border-outline-variant pt-2">
            {['ALL', 'Submitted', 'Under Review', 'Action Assigned', 'In Progress', 'Resolved'].map((st) => (
              <button
                key={st}
                onClick={() => setSelectedStatus(st)}
                className={`px-3 py-1 text-xs font-label-md rounded transition-all whitespace-nowrap ${
                  selectedStatus === st
                    ? 'bg-primary-container text-white font-bold'
                    : 'text-on-surface-variant hover:bg-surface-container'
                }`}
              >
                {st === 'ALL' ? 'All Statuses' : st}
              </button>
            ))}
          </div>
        </div>

        {/* Complaints Data Table */}
        <div className="bg-surface-container-lowest border border-outline-variant rounded-lg overflow-hidden shadow-ambient">
          <div className="overflow-x-auto">
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
                  <th className="p-3">Grievance ID</th>
                  <th className="p-3">Issue Title & Category</th>
                  <th className="p-3">Location & Citizen</th>
                  <th className="p-3">Priority</th>
                  <th className="p-3">Assigned Cell</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/60">
                {filteredComplaints.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="p-8 text-center text-on-surface-variant">
                      No complaints match the selected filters.
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
                          onClick={() => navigateTo('track', item.id)}
                          className="hover:underline"
                        >
                          #{item.id}
                        </button>
                      </td>

                      <td className="p-3">
                        <div className="font-bold text-on-surface line-clamp-1">{item.title}</div>
                        <div className="text-[10px] text-on-surface-variant">{item.category}</div>
                      </td>

                      <td className="p-3">
                        <div className="text-on-surface font-medium line-clamp-1">{item.location}</div>
                        <div className="text-[10px] text-on-surface-variant">By {item.reportedBy} ({item.dateFiled})</div>
                      </td>

                      <td className="p-3">
                        <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                          item.priority === 'Critical'
                            ? 'bg-error-container text-on-error-container font-extrabold'
                            : item.priority === 'High'
                            ? 'bg-secondary-container text-on-secondary-container'
                            : 'bg-surface-container-high text-on-surface-variant'
                        }`}>
                          {item.priority}
                        </span>
                      </td>

                      <td className="p-3">
                        <div className="text-on-surface font-medium truncate max-w-[140px]">{item.assignedOfficer}</div>
                        <div className="text-[10px] text-on-surface-variant truncate max-w-[140px]">{item.assignedDepartment}</div>
                      </td>

                      <td className="p-3">
                        <span className={`text-[10px] font-bold uppercase px-2.5 py-1 rounded inline-block ${
                          item.status === 'Resolved'
                            ? 'bg-gov-green/15 text-gov-green border border-gov-green/30'
                            : item.status === 'In Progress' || item.status === 'Action Assigned'
                            ? 'bg-secondary-container/30 text-on-secondary-fixed-variant border border-secondary-container/50'
                            : 'bg-surface-container-high text-on-surface-variant border border-outline-variant'
                        }`}>
                          {item.status}
                        </span>
                      </td>

                      <td className="p-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => {
                              setEditingComplaint(item);
                              setNewStatus(item.status);
                              setStatusNote('');
                            }}
                            title="Update Status"
                            className="p-1 text-primary hover:bg-surface-container rounded transition-colors"
                          >
                            <span className="material-symbols-outlined text-base">edit_note</span>
                          </button>
                          <button
                            onClick={() => navigateTo('admin_action', item.id)}
                            title="Take Strategic Action"
                            className="bg-primary-container text-on-primary font-bold text-[11px] px-2.5 py-1 rounded hover:bg-primary transition-all flex items-center gap-0.5"
                          >
                            <span>Act</span>
                            <span className="material-symbols-outlined text-xs">arrow_forward</span>
                          </button>
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
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-primary/50 backdrop-blur-sm">
            <div className="bg-surface-container-lowest p-lg rounded-xl border border-outline-variant shadow-2xl max-w-md w-full">
              <div className="flex justify-between items-center mb-md border-b border-outline-variant pb-2">
                <h3 className="font-bold text-sm text-primary">Update Status: #{editingComplaint.id}</h3>
                <button onClick={() => setEditingComplaint(null)} className="text-on-surface-variant">
                  <span className="material-symbols-outlined text-sm">close</span>
                </button>
              </div>

              <form onSubmit={handleStatusUpdateSubmit} className="flex flex-col gap-md text-xs">
                <div>
                  <label className="block font-bold text-on-surface mb-1">Select New Status</label>
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value)}
                    className="w-full p-2 bg-surface border border-outline-variant rounded focus:border-primary outline-none font-bold"
                  >
                    <option value="Submitted">Submitted (Pending Review)</option>
                    <option value="Under Review">Under Review</option>
                    <option value="Action Assigned">Action Assigned</option>
                    <option value="In Progress">In Progress (Field Repair)</option>
                    <option value="Resolved">Resolved (Completed)</option>
                    <option value="Rejected">Rejected</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-on-surface mb-1">Official Milestone Note</label>
                  <textarea
                    rows={3}
                    value={statusNote}
                    onChange={(e) => setStatusNote(e.target.value)}
                    placeholder="e.g. Work crew deployed with heavy machinery..."
                    className="w-full p-2 bg-surface border border-outline-variant rounded focus:border-primary outline-none resize-none"
                  ></textarea>
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-outline-variant">
                  <button
                    type="button"
                    onClick={() => setEditingComplaint(null)}
                    className="px-3 py-1.5 text-on-surface-variant font-bold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-primary-container text-on-primary font-bold px-4 py-1.5 rounded hover:bg-primary"
                  >
                    Save & Update
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Bulk Assign Modal */}
        {bulkModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-primary/50 backdrop-blur-sm">
            <div className="bg-surface-container-lowest p-lg rounded-xl border border-outline-variant shadow-2xl max-w-md w-full">
              <div className="flex justify-between items-center mb-md border-b border-outline-variant pb-2">
                <h3 className="font-bold text-sm text-primary">Bulk Assign ({selectedIds.length} Complaints)</h3>
                <button onClick={() => setBulkModalOpen(false)} className="text-on-surface-variant">
                  <span className="material-symbols-outlined text-sm">close</span>
                </button>
              </div>

              <form onSubmit={handleBulkAssignSubmit} className="flex flex-col gap-md text-xs">
                <div>
                  <label className="block font-bold text-on-surface mb-1">Assign to Department</label>
                  <select
                    value={bulkDept}
                    onChange={(e) => setBulkDept(e.target.value)}
                    className="w-full p-2 bg-surface border border-outline-variant rounded focus:border-primary outline-none"
                  >
                    <option>Public Works Department (PWD)</option>
                    <option>Delhi Jal Board (Water/Drainage)</option>
                    <option>Municipal Corporation of Delhi (MCD)</option>
                    <option>DISCOM / Power Directorate</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-on-surface mb-1">Lead Responsible Officer</label>
                  <input
                    type="text"
                    value={bulkOfficer}
                    onChange={(e) => setBulkOfficer(e.target.value)}
                    className="w-full p-2 bg-surface border border-outline-variant rounded focus:border-primary outline-none"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-outline-variant">
                  <button
                    type="button"
                    onClick={() => setBulkModalOpen(false)}
                    className="px-3 py-1.5 text-on-surface-variant font-bold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-gov-saffron text-primary font-bold px-4 py-1.5 rounded hover:bg-gov-saffron/90"
                  >
                    Dispatch All
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

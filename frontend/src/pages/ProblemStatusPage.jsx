import React, { useState } from 'react';
import { useCivic } from '../context/CivicContext';

export default function ProblemStatusPage() {
  const { complaints, activeTrackId, setActiveTrackId, navigateTo, showNotification } = useCivic();
  const [searchIdInput, setSearchIdInput] = useState('');
  const [commentText, setCommentText] = useState('');
  const [commentsList, setCommentsList] = useState([
    { id: 1, author: "Citizen Support Officer", role: "Verification Cell", text: "Grievance acknowledged. Dispatched to PWD South Division.", time: "01 Sep 2026, 11:30 AM" },
    { id: 2, author: "Er. Rajesh Kumar", role: "Assigned Engineer", text: "Site inspection completed. Road resurfacing machinery scheduled.", time: "02 Sep 2026, 08:30 AM" }
  ]);

  // Find complaint by activeTrackId or fallback to first
  const complaint = complaints.find(c => c.id.toLowerCase() === (activeTrackId || '').toLowerCase()) || complaints[0];

  const handleSearch = (e) => {
    e.preventDefault();
    const cleanId = searchIdInput.replace('#', '').trim().toUpperCase();
    const found = complaints.find(c => c.id.toUpperCase() === cleanId);
    if (found) {
      setActiveTrackId(found.id);
      showNotification(`Loaded Tracking Info for #${found.id}`);
    } else {
      showNotification(`Grievance #${cleanId} not found. Showing latest report.`, 'error');
    }
  };

  const handleAddComment = (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    const newComment = {
      id: Date.now(),
      author: "Aaditya Sharma",
      role: "Citizen / Complainant",
      text: commentText,
      time: "Just now"
    };
    setCommentsList([...commentsList, newComment]);
    setCommentText('');
    showNotification("Feedback note submitted to assigned officer.");
  };

  if (!complaint) return null;

  return (
    <div className="flex-grow w-full max-w-container-max mx-auto px-lg py-xl flex flex-col gap-lg">
      {/* Breadcrumb & Search Tracker */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-md border-b border-outline-variant pb-md">
        <div>
          <div className="flex items-center gap-sm text-on-surface-variant font-body-sm text-xs mb-1">
            <button onClick={() => navigateTo('citizen_dashboard')} className="hover:text-primary hover:underline">
              Citizen Dashboard
            </button>
            <span className="material-symbols-outlined text-[14px]">chevron_right</span>
            <span className="text-on-surface font-semibold">Grievance Status Timeline</span>
          </div>
          <h1 className="font-headline-lg text-2xl sm:text-3xl font-bold text-primary flex items-center gap-2">
            <span>Tracking Problem #{complaint.id}</span>
          </h1>
        </div>

        {/* Quick ID Lookup Search */}
        <form onSubmit={handleSearch} className="flex items-center gap-2 w-full md:w-auto">
          <div className="relative flex-grow md:w-60">
            <span className="material-symbols-outlined absolute left-2.5 top-2 text-on-surface-variant text-base">
              search
            </span>
            <input
              type="text"
              value={searchIdInput}
              onChange={(e) => setSearchIdInput(e.target.value)}
              placeholder="Enter ID (e.g. PP24891)"
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-surface-container-lowest border border-outline-variant rounded focus:border-primary outline-none"
            />
          </div>
          <button
            type="submit"
            className="bg-primary-container text-on-primary text-xs font-bold px-4 py-1.5 rounded hover:bg-primary transition-colors"
          >
            Track
          </button>
        </form>
      </div>

      {/* Grid Layout: Left Column Details & Timeline, Right Column Officer & Evidence */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-lg">
        {/* Left Column (8 cols) */}
        <div className="lg:col-span-8 flex flex-col gap-lg">
          {/* Summary Card */}
          <div className="bg-surface-container-lowest border border-outline-variant rounded-lg p-lg shadow-ambient">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-md mb-md border-b border-outline-variant pb-md">
              <div>
                <div className="flex items-center gap-sm mb-1">
                  <span className="font-label-sm text-[11px] text-on-surface-variant uppercase tracking-wider">
                    Grievance Token
                  </span>
                  <span className="font-label-md text-xs text-primary font-mono font-bold bg-primary-fixed/40 px-2 py-0.5 rounded">
                    #{complaint.id}
                  </span>
                </div>
                <h2 className="font-headline-md text-xl font-bold text-on-surface mb-1">
                  {complaint.title}
                </h2>
                <div className="flex items-center gap-1 text-on-surface-variant text-xs font-medium">
                  <span className="material-symbols-outlined text-sm text-primary">location_on</span>
                  <span>{complaint.location}, {complaint.district}</span>
                </div>
              </div>

              <div>
                <span className={`inline-block font-label-sm text-xs font-bold uppercase px-3 py-1.5 rounded ${
                  complaint.status === 'Resolved'
                    ? 'bg-gov-green/15 text-gov-green border border-gov-green/30'
                    : complaint.status === 'In Progress' || complaint.status === 'Action Assigned'
                    ? 'bg-secondary-container/30 text-on-secondary-fixed-variant border border-secondary-container/50'
                    : 'bg-surface-container-high text-on-surface-variant'
                }`}>
                  {complaint.statusLabel || complaint.status}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-md text-xs">
              <div>
                <div className="font-label-sm text-[11px] text-on-surface-variant mb-0.5">Category</div>
                <div className="font-bold text-on-surface">{complaint.category}</div>
              </div>
              <div>
                <div className="font-label-sm text-[11px] text-on-surface-variant mb-0.5">Reported By</div>
                <div className="font-bold text-on-surface">{complaint.reportedBy}</div>
              </div>
              <div>
                <div className="font-label-sm text-[11px] text-on-surface-variant mb-0.5">Date Filed</div>
                <div className="font-bold text-on-surface">{complaint.dateFiled}</div>
              </div>
              <div>
                <div className="font-label-sm text-[11px] text-on-surface-variant mb-0.5">Priority Level</div>
                <div className="font-bold text-error flex items-center gap-1">
                  <span className="material-symbols-outlined text-sm">priority_high</span>
                  {complaint.priority}
                </div>
              </div>
            </div>
          </div>

          {/* 5-Step Progress Timeline */}
          <div className="bg-surface-container-lowest border border-outline-variant rounded-lg p-lg shadow-ambient">
            <h3 className="font-headline-sm text-base font-bold text-primary mb-lg pb-sm border-b border-outline-variant flex items-center justify-between">
              <span>Redressal Milestone Progression</span>
              <span className="text-xs font-normal text-on-surface-variant font-mono">
                Stage {complaint.timeline.filter(t => t.completed).length} of 5
              </span>
            </h3>

            {/* Desktop Horizontal Stepper */}
            <div className="hidden md:flex justify-between items-start relative w-full mb-xl">
              <div className="absolute top-4 left-6 right-6 h-0.5 bg-outline-variant -z-0"></div>
              {complaint.timeline.map((step, idx) => (
                <div key={idx} className="flex flex-col items-center w-1/5 relative z-10 text-center px-1">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 mb-2 shadow-sm font-bold text-xs ${
                    step.completed
                      ? 'bg-primary-container text-on-primary border-primary-container'
                      : 'bg-surface-container text-outline border-outline-variant'
                  } ${step.current ? 'ring-4 ring-primary-container/20 animate-bounce' : ''}`}>
                    {step.completed ? (
                      <span className="material-symbols-outlined text-sm">check</span>
                    ) : (
                      step.step
                    )}
                  </div>
                  <div className={`text-xs font-bold ${step.completed ? 'text-primary' : 'text-on-surface-variant'}`}>
                    {step.title}
                  </div>
                  <div className="text-[10px] text-on-surface-variant mt-0.5">
                    {step.date !== 'Pending' ? `${step.date}` : 'Pending'}
                  </div>
                </div>
              ))}
            </div>

            {/* Timeline Detailed Milestones List */}
            <div className="flex flex-col gap-md border-t border-outline-variant pt-md">
              {complaint.timeline.map((step, idx) => (
                <div
                  key={idx}
                  className={`flex items-start gap-3 p-3 rounded-lg border transition-all ${
                    step.current
                      ? 'bg-primary-fixed/20 border-primary shadow-sm'
                      : step.completed
                      ? 'bg-surface border-outline-variant/60'
                      : 'bg-surface/40 border-dashed border-outline-variant opacity-60'
                  }`}
                >
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs shrink-0 mt-0.5 ${
                    step.completed ? 'bg-gov-green text-white' : 'bg-surface-variant text-outline'
                  }`}>
                    {step.completed ? <span className="material-symbols-outlined text-xs">check</span> : step.step}
                  </div>

                  <div className="flex-grow">
                    <div className="flex justify-between items-center flex-wrap">
                      <span className={`text-xs font-bold ${step.completed ? 'text-on-surface' : 'text-on-surface-variant'}`}>
                        {step.step}. {step.title}
                      </span>
                      <span className="text-[10px] font-mono text-on-surface-variant">
                        {step.date !== 'Pending' ? `${step.date} • ${step.time}` : 'Pending Action'}
                      </span>
                    </div>
                    <p className="text-xs text-on-surface-variant mt-1 leading-relaxed">
                      {step.note}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Citizen Comments & Updates Thread */}
          <div className="bg-surface-container-lowest border border-outline-variant rounded-lg p-lg shadow-ambient">
            <h3 className="font-headline-sm text-base font-bold text-primary mb-md pb-2 border-b border-outline-variant flex items-center gap-2">
              <span className="material-symbols-outlined text-lg">forum</span>
              <span>Grievance Updates & Citizen Notes</span>
            </h3>

            <div className="flex flex-col gap-3 mb-md">
              {commentsList.map((item) => (
                <div key={item.id} className="bg-surface p-3 rounded border border-outline-variant flex flex-col gap-1">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-primary">{item.author} ({item.role})</span>
                    <span className="text-[10px] text-on-surface-variant">{item.time}</span>
                  </div>
                  <p className="text-xs text-on-surface-variant">{item.text}</p>
                </div>
              ))}
            </div>

            <form onSubmit={handleAddComment} className="flex gap-2">
              <input
                type="text"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Post a question or location update for the engineer..."
                className="flex-grow px-3 py-2 text-xs bg-surface border border-outline-variant rounded focus:border-primary outline-none"
              />
              <button
                type="submit"
                className="bg-primary-container text-on-primary text-xs font-bold px-4 py-2 rounded hover:bg-primary transition-colors shrink-0"
              >
                Send
              </button>
            </form>
          </div>
        </div>

        {/* Right Column: Assigned Officer, Photo Evidence, Directives (4 cols) */}
        <div className="lg:col-span-4 flex flex-col gap-lg">
          {/* Department & Officer Card */}
          <div className="bg-surface-container-lowest border border-outline-variant rounded-lg p-lg shadow-ambient flex flex-col gap-md">
            <h3 className="font-headline-sm text-sm font-bold text-primary border-b border-outline-variant pb-2">
              Assigned Administrative Cell
            </h3>

            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-primary-container text-on-primary flex items-center justify-center font-bold text-xs shrink-0">
                <span className="material-symbols-outlined text-xl">account_circle</span>
              </div>
              <div className="text-xs">
                <div className="font-bold text-on-surface">{complaint.assignedOfficer}</div>
                <div className="text-on-surface-variant text-[11px] mt-0.5">{complaint.assignedDepartment}</div>
                <div className="text-gov-green font-semibold text-[10px] mt-1 flex items-center gap-1">
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-gov-green animate-pulse"></span>
                  Active Case Officer
                </div>
              </div>
            </div>

            <div className="bg-surface p-3 rounded border border-outline-variant text-xs flex flex-col gap-1.5">
              <div className="flex justify-between">
                <span className="text-on-surface-variant">Allocated Budget:</span>
                <span className="font-bold text-primary">{complaint.budget}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-on-surface-variant">AI Severity Index:</span>
                <span className="font-bold text-error">{complaint.aiSeverityScore}/100</span>
              </div>
              <div className="flex justify-between">
                <span className="text-on-surface-variant">Jurisdiction:</span>
                <span className="font-medium text-on-surface">{complaint.district}</span>
              </div>
            </div>

            <button
              onClick={() => showNotification("Grievance escalated to Zonal Superintendent.")}
              className="text-xs text-error font-bold border border-error/40 hover:bg-error-container/20 py-2 rounded transition-colors text-center"
            >
              Escalate Delay to Supervisor
            </button>
          </div>

          {/* Evidence Card */}
          <div className="bg-surface-container-lowest border border-outline-variant rounded-lg p-lg shadow-ambient flex flex-col gap-md">
            <h3 className="font-headline-sm text-sm font-bold text-primary border-b border-outline-variant pb-2">
              Citizen Evidence
            </h3>

            {complaint.imageUrl ? (
              <div className="rounded overflow-hidden border border-outline-variant">
                <img src={complaint.imageUrl} alt="Grievance Evidence" className="w-full h-44 object-cover" />
                <div className="p-2 bg-surface text-[11px] text-on-surface-variant flex justify-between">
                  <span>Photo Attachment</span>
                  <span className="text-gov-green font-bold">Verified Geotag</span>
                </div>
              </div>
            ) : complaint.evidenceType === 'voice' ? (
              <div className="bg-surface p-4 rounded border border-outline-variant text-xs flex flex-col gap-2">
                <div className="flex items-center gap-2 text-primary font-bold">
                  <span className="material-symbols-outlined">mic</span>
                  <span>Voice Recording ({complaint.audioLength || '0:42'})</span>
                </div>
                <audio controls className="w-full h-8 mt-1">
                  <source src="#" type="audio/mp3" />
                  Your browser does not support audio playback.
                </audio>
                {complaint.voiceTranscript && (
                  <p className="text-[11px] text-on-surface-variant italic mt-1 bg-white p-2 rounded">
                    "{complaint.voiceTranscript}"
                  </p>
                )}
              </div>
            ) : (
              <div className="bg-surface p-3 rounded border border-outline-variant text-xs text-on-surface-variant">
                <span className="font-bold block text-primary mb-1">Structured Text Grievance:</span>
                <p>{complaint.description}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

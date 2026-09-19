import React, { useState } from 'react';
import { useCivic } from '../context/CivicContext';
import { useLanguage } from '../context/LanguageContext';

export default function ProblemStatusPage() {
  const { complaints, activeTrackId, setActiveTrackId, navigateTo, showNotification, currentUser } = useCivic();
  const { t } = useLanguage();
  const [searchIdInput, setSearchIdInput] = useState('');
  const [commentText, setCommentText] = useState('');
  const [commentsList, setCommentsList] = useState([
    { id: 1, author: "Citizen Support Officer", role: "Verification Cell", text: "Grievance acknowledged. Dispatched to PWD South Division.", time: "01 Sep 2026, 11:30 AM" },
    { id: 2, author: "Er. Rajesh Kumar", role: "Assigned Engineer", text: "Site inspection completed. Road resurfacing machinery scheduled.", time: "02 Sep 2026, 08:30 AM" }
  ]);

  // Find complaint by activeTrackId or fallback to first
  const complaint = complaints.find(c => (c.id || '').toLowerCase() === (activeTrackId || '').toLowerCase() || (c.display_id || '').toLowerCase() === (activeTrackId || '').toLowerCase()) || complaints[0];

  const handleSearch = (e) => {
    e.preventDefault();
    const cleanId = searchIdInput.replace('#', '').trim().toUpperCase();
    const found = complaints.find(c => (c.id || '').toUpperCase() === cleanId || (c.display_id || '').toUpperCase() === cleanId);
    if (found) {
      setActiveTrackId(found.id);
      showNotification(`Loaded Tracking Info for #${found.display_id || found.id}`);
    } else {
      showNotification(`${t('track.notFound')} (#${cleanId})`, 'error');
    }
  };

  const handleAddComment = (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    const newComment = {
      id: Date.now(),
      author: currentUser?.full_name || currentUser?.name || complaint.reportedBy || t('navbar.citizenBadge'),
      role: t('navbar.citizenBadge'),
      text: commentText,
      time: "Just now"
    };
    setCommentsList([...commentsList, newComment]);
    setCommentText('');
    showNotification("Feedback note submitted to assigned officer.");
  };

  if (!complaint) return null;

  return (
    <div className="flex-grow w-full max-w-container-max mx-auto px-3 sm:px-lg py-4 sm:py-xl flex flex-col gap-md sm:gap-lg">
      {/* Breadcrumb & Search Tracker */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-md border-b border-outline-variant pb-md">
        <div>
          <div className="flex items-center gap-sm text-on-surface-variant font-body-sm text-xs mb-1 flex-wrap">
            <button onClick={() => navigateTo('citizen_dashboard')} className="hover:text-primary hover:underline cursor-pointer">
              {t('citizen.dashboardTitle')}
            </button>
            <span className="material-symbols-outlined text-[14px]">chevron_right</span>
            <span className="text-on-surface font-semibold">{t('track.milestonesTitle')}</span>
          </div>
          <h1 className="font-headline-lg text-xl sm:text-2xl md:text-3xl font-bold text-primary flex items-center gap-2 flex-wrap">
            <span>{t('track.title')} <span className="font-mono text-gov-navy">#{complaint.display_id || complaint.id}</span></span>
          </h1>
        </div>

        {/* Quick ID Lookup Search */}
        <form onSubmit={handleSearch} className="flex items-center gap-2 w-full md:w-auto">
          <div className="relative flex-grow md:w-60">
            <span className="material-symbols-outlined absolute left-2.5 top-2.5 text-on-surface-variant text-base">
              search
            </span>
            <input
              type="text"
              value={searchIdInput}
              onChange={(e) => setSearchIdInput(e.target.value)}
              placeholder={t('track.inputPlaceholder')}
              className="w-full pl-8 pr-3 py-2 text-xs bg-surface-container-lowest border border-outline-variant rounded focus:border-primary outline-none"
            />
          </div>
          <button
            type="submit"
            className="bg-primary-container text-on-primary text-xs font-bold px-4 py-2 rounded hover:bg-primary transition-colors min-h-[38px] shrink-0 cursor-pointer"
          >
            {t('track.searchButton')}
          </button>
        </form>
      </div>

      {/* Grid Layout: Left Column Details & Timeline, Right Column Officer & Evidence */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-md sm:gap-lg">
        {/* Left Column (8 cols) */}
        <div className="lg:col-span-8 flex flex-col gap-md sm:gap-lg">
          {/* Summary Card */}
          <div className="bg-surface-container-lowest border border-outline-variant rounded-lg p-4 sm:p-lg shadow-ambient">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-md mb-md border-b border-outline-variant pb-md">
              <div>
                <div className="flex items-center gap-sm mb-1">
                  <span className="font-label-sm text-[11px] text-on-surface-variant uppercase tracking-wider">
                    {t('track.tokenInfo')}
                  </span>
                  <span className="font-label-md text-xs text-primary font-mono font-bold bg-primary-fixed/40 px-2 py-0.5 rounded">
                    #{complaint.display_id || complaint.id}
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
                    : complaint.status === 'Rejected'
                    ? 'bg-error/15 text-error border border-error/30 font-black'
                    : complaint.status === 'In Progress' || complaint.status === 'Action Assigned'
                    ? 'bg-secondary-container/30 text-on-secondary-fixed-variant border border-secondary-container/50'
                    : 'bg-surface-container-high text-on-surface-variant'
                }`}>
                  {t(`status.${complaint.status}`, complaint.statusLabel || complaint.status)}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-md text-xs">
              <div>
                <div className="font-label-sm text-[11px] text-on-surface-variant mb-0.5">{t('common.category')}</div>
                <div className="font-bold text-on-surface">{t(`category.${complaint.category}`, complaint.category)}</div>
              </div>
              <div>
                <div className="font-label-sm text-[11px] text-on-surface-variant mb-0.5">{t('contact.fullName')}</div>
                <div className="font-bold text-on-surface">{complaint.reportedBy}</div>
              </div>
              <div>
                <div className="font-label-sm text-[11px] text-on-surface-variant mb-0.5">{t('track.filedOn')}</div>
                <div className="font-bold text-on-surface">{complaint.dateFiled || complaint.date}</div>
              </div>
            </div>
          </div>

          {/* Progress Timeline */}
          <div className="bg-surface-container-lowest border border-outline-variant rounded-lg p-lg shadow-ambient">
            <h3 className="font-headline-sm text-base font-bold text-primary mb-lg pb-sm border-b border-outline-variant flex items-center justify-between">
              <span>{t('track.milestonesTitle')} {complaint.status === 'Rejected' && <span className="text-error font-bold text-xs">({t('track.rejectedNotice')})</span>}</span>
              <span className="text-xs font-normal text-on-surface-variant font-mono">
                {complaint.timeline ? `Stage ${complaint.timeline.filter(t => t.completed).length} of ${complaint.timeline.length}` : ''}
              </span>
            </h3>

            {/* Desktop Horizontal Stepper */}
            <div className="hidden md:flex justify-between items-start relative w-full mb-xl">
              <div className="absolute top-4 left-6 right-6 h-0.5 bg-outline-variant -z-0"></div>
              {(complaint.timeline || []).map((step, idx) => {
                const isRejectedStep = step.isRejected || step.title?.toLowerCase().includes('reject');
                return (
                  <div key={idx} className={`flex flex-col items-center relative z-10 text-center px-1 ${complaint.status === 'Rejected' ? 'w-1/3' : 'w-1/5'}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 mb-2 shadow-sm font-bold text-xs ${
                      isRejectedStep
                        ? 'bg-error text-white border-error ring-4 ring-error/20'
                        : step.completed
                        ? 'bg-primary-container text-on-primary border-primary-container'
                        : 'bg-surface-container text-outline border-outline-variant'
                    } ${step.current && !isRejectedStep ? 'ring-4 ring-primary-container/20 animate-bounce' : ''}`}>
                      {isRejectedStep ? (
                        <span className="material-symbols-outlined text-sm">close</span>
                      ) : step.completed ? (
                        <span className="material-symbols-outlined text-sm">check</span>
                      ) : (
                        step.step
                      )}
                    </div>
                    <div className={`text-xs font-bold ${isRejectedStep ? 'text-error' : step.completed ? 'text-primary' : 'text-on-surface-variant'}`}>
                      {t(`status.${step.title}`, step.title)}
                    </div>
                    <div className="text-[10px] text-on-surface-variant mt-0.5">
                      {step.date !== 'Pending' ? `${step.date}` : t('common.pending')}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Timeline Detailed Milestones List */}
            <div className="flex flex-col gap-md border-t border-outline-variant pt-md">
              {(complaint.timeline || []).map((step, idx) => {
                const isRejectedStep = step.isRejected || step.title?.toLowerCase().includes('reject');
                return (
                  <div
                    key={idx}
                    className={`flex items-start gap-3 p-3 rounded-lg border transition-all ${
                      isRejectedStep
                        ? 'bg-error/10 border-error/40 shadow-sm'
                        : step.current
                        ? 'bg-primary-fixed/20 border-primary shadow-sm'
                        : step.completed
                        ? 'bg-surface border-outline-variant/60'
                        : 'bg-surface/40 border-dashed border-outline-variant opacity-60'
                    }`}
                  >
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs shrink-0 mt-0.5 ${
                      isRejectedStep ? 'bg-error text-white' : step.completed ? 'bg-gov-green text-white' : 'bg-surface-variant text-outline'
                    }`}>
                      {isRejectedStep ? (
                        <span className="material-symbols-outlined text-xs">close</span>
                      ) : step.completed ? (
                        <span className="material-symbols-outlined text-xs">check</span>
                      ) : (
                        step.step
                      )}
                    </div>

                    <div className="flex-grow">
                      <div className="flex justify-between items-center flex-wrap">
                        <span className={`text-xs font-bold ${isRejectedStep ? 'text-error' : step.completed ? 'text-on-surface' : 'text-on-surface-variant'}`}>
                          {step.step}. {t(`status.${step.title}`, step.title)}
                        </span>
                        <span className="text-[10px] font-mono text-on-surface-variant">
                          {step.date !== 'Pending' ? `${step.date} • ${step.time}` : t('common.pending')}
                        </span>
                      </div>
                      <p className={`text-xs mt-1 leading-relaxed ${isRejectedStep ? 'text-error font-medium' : 'text-on-surface-variant'}`}>
                        {step.note}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Citizen Comments & Updates Thread */}
          <div className="bg-surface-container-lowest border border-outline-variant rounded-lg p-4 sm:p-lg shadow-ambient">
            <h3 className="font-headline-sm text-sm sm:text-base font-bold text-primary mb-md pb-2 border-b border-outline-variant flex items-center gap-2">
              <span className="material-symbols-outlined text-lg">forum</span>
              <span>{t('track.commentsTitle')}</span>
            </h3>

            <div className="flex flex-col gap-3 mb-md">
              {commentsList.map((item) => (
                <div key={item.id} className="bg-surface p-3 rounded border border-outline-variant flex flex-col gap-1">
                  <div className="flex justify-between items-center text-xs flex-wrap gap-1">
                    <span className="font-bold text-primary">{item.author} ({item.role})</span>
                    <span className="text-[10px] text-on-surface-variant">{item.time}</span>
                  </div>
                  <p className="text-xs text-on-surface-variant">{item.text}</p>
                </div>
              ))}
            </div>

            <form onSubmit={handleAddComment} className="flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder={t('track.commentPlaceholder')}
                className="flex-grow px-3 py-2.5 text-xs bg-surface border border-outline-variant rounded focus:border-primary outline-none"
              />
              <button
                type="submit"
                className="bg-primary-container text-on-primary text-xs font-bold px-4 py-2.5 rounded hover:bg-primary transition-colors shrink-0 min-h-[40px] cursor-pointer"
              >
                {t('track.postComment')}
              </button>
            </form>
          </div>
        </div>

        {/* Right Column: Citizen Evidence Container (4 cols) */}
        <div className="lg:col-span-4 flex flex-col gap-md sm:gap-lg">
          <div className="bg-surface-container-lowest border border-outline-variant rounded-lg p-4 sm:p-lg shadow-ambient flex flex-col gap-md">
            <h3 className="font-headline-sm text-sm font-bold text-primary border-b border-outline-variant pb-2 flex items-center gap-2">
              <span className="material-symbols-outlined text-base">fact_check</span>
              <span>{t('submit.steps.step2')}</span>
            </h3>

            <div className="text-xs text-on-surface-variant flex flex-col gap-2">
              <div className="flex justify-between">
                <span className="font-medium">{t('submit.evidenceMethodTitle')}:</span>
                <span className="font-bold text-primary capitalize">{complaint.evidenceType || 'Text'}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">{t('contact.fullName')}:</span>
                <span className="font-bold text-on-surface">{complaint.reportedBy}</span>
              </div>
              {complaint.contactPhone && (
                <div className="flex justify-between">
                  <span className="font-medium">{t('contact.phone')}:</span>
                  <span className="font-bold text-on-surface">{complaint.contactPhone}</span>
                </div>
              )}
              {complaint.assignedDepartment && (
                <div className="flex justify-between">
                  <span className="font-medium">{t('track.department')}:</span>
                  <span className="font-bold text-on-surface">{complaint.assignedDepartment}</span>
                </div>
              )}
            </div>

            {/* Evidence Visual Content */}
            {complaint.imageUrl ? (
              <div className="rounded overflow-hidden border border-outline-variant">
                <img src={complaint.imageUrl} alt="Evidence" className="w-full h-48 object-cover" />
                <div className="p-2 bg-surface text-[11px] text-on-surface-variant flex justify-between">
                  <span>{t('submit.methods.photo')}</span>
                  <span className="text-gov-green font-bold flex items-center gap-0.5">
                    <span className="material-symbols-outlined text-xs">verified</span>
                    {t('common.verified')}
                  </span>
                </div>
              </div>
            ) : complaint.evidenceType === 'voice' ? (
              <div className="bg-surface p-4 rounded border border-outline-variant text-xs flex flex-col gap-2">
                <div className="flex items-center gap-2 text-primary font-bold">
                  <span className="material-symbols-outlined text-lg text-gov-saffron">mic</span>
                  <span>{t('submit.voice.title')}</span>
                </div>
                <audio controls className="w-full h-8 mt-1">
                  {complaint.imageUrl && <source src={complaint.imageUrl} type="audio/webm" />}
                </audio>
                {complaint.voiceTranscript && (
                  <div className="bg-white p-2.5 rounded border border-outline-variant/60 mt-1">
                    <span className="text-[10px] font-bold text-primary block mb-0.5">{t('submit.voice.transcriptLabel')}:</span>
                    <p className="text-[11px] text-on-surface-variant italic">"{complaint.voiceTranscript}"</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-surface p-3 rounded border border-outline-variant text-xs text-on-surface-variant">
                <span className="font-bold block text-primary mb-1">{t('submit.methods.text')}:</span>
                <p className="leading-relaxed">{complaint.description}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

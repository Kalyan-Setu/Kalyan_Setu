import React from 'react';
import { useCivic } from '../context/CivicContext';
import parliamentBg from '../assets/parliament-bg.jpg';

export default function HomePage() {
  const { navigateTo, complaints } = useCivic();

  const totalComplaints = complaints.length;
  const resolvedCount = complaints.filter(c => c.status === 'Resolved').length;
  const inProgressCount = complaints.filter(c => c.status === 'In Progress' || c.status === 'Action Assigned').length;

  return (
    <div className="flex flex-col flex-grow w-full">
      {/* Hero Section */}
      <section className="relative w-full min-h-[560px] flex items-center bg-surface-variant">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <img
            alt="Indian Parliament Building (Sansad Bhavan)"
            className="w-full h-full object-cover"
            src={parliamentBg}
          />
          <div className="absolute inset-0 hero-overlay"></div>
        </div>

        <div className="relative z-10 w-full max-w-container-max mx-auto px-lg py-xl">
          <div className="max-w-3xl">
            <span className="inline-block bg-white/15 backdrop-blur-sm text-primary-fixed text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full mb-4 border border-white/20">
              Official National Grievance Portal
            </span>
            <h1 className="font-display-lg text-4xl sm:text-5xl lg:text-display-lg text-white mb-sm leading-tight font-bold">
              Kalyan Setu
            </h1>
            <p className="font-headline-sm text-lg sm:text-headline-sm text-gov-saffron mb-lg uppercase tracking-wide font-semibold">
              Your Voice. Our Priority.
            </p>
            <p className="font-body-lg text-base sm:text-body-lg text-white/90 mb-xl max-w-2xl leading-relaxed">
              Report problems in your area and track how they are being addressed. A direct, transparent channel between citizens and administration to build better communities together.
            </p>
            <div className="flex flex-col sm:flex-row gap-md">
              <button
                onClick={() => navigateTo('submit')}
                className="font-label-md text-sm bg-gov-saffron text-primary font-bold rounded px-lg py-md hover:bg-white hover:text-primary transition-all flex items-center justify-center gap-sm shadow-lg active:scale-95"
              >
                <span className="material-symbols-outlined filled-icon">report_problem</span>
                Report a Problem
              </button>
              <button
                onClick={() => navigateTo('track')}
                className="font-label-md text-sm bg-transparent border-2 border-white text-white font-bold rounded px-lg py-md hover:bg-white/10 transition-all flex items-center justify-center gap-sm active:scale-95"
              >
                <span className="material-symbols-outlined">my_location</span>
                Track My Problem
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Live Metrics Counter Bar */}
      <section className="w-full bg-primary-container text-white py-lg border-b border-outline-variant">
        <div className="max-w-container-max mx-auto px-lg grid grid-cols-2 md:grid-cols-4 gap-lg text-center">
          <div className="p-3 border-r border-white/10">
            <div className="font-display-lg text-3xl font-bold text-gov-saffron">2,48,910+</div>
            <div className="font-label-sm text-xs text-primary-fixed-dim mt-1 uppercase tracking-wider">Citizen Issues Logged</div>
          </div>
          <div className="p-3 border-r border-white/10">
            <div className="font-display-lg text-3xl font-bold text-gov-green">89.4%</div>
            <div className="font-label-sm text-xs text-primary-fixed-dim mt-1 uppercase tracking-wider">Resolution Rate</div>
          </div>
          <div className="p-3 border-r border-white/10">
            <div className="font-display-lg text-3xl font-bold text-white">48 Hours</div>
            <div className="font-label-sm text-xs text-primary-fixed-dim mt-1 uppercase tracking-wider">Avg Triage Speed</div>
          </div>
          <div className="p-3">
            <div className="font-display-lg text-3xl font-bold text-gov-saffron">750+</div>
            <div className="font-label-sm text-xs text-primary-fixed-dim mt-1 uppercase tracking-wider">Districts Covered</div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="w-full py-xxl bg-surface">
        <div className="max-w-container-max mx-auto px-lg">
          <div className="text-center mb-xl">
            <span className="font-label-sm text-xs text-primary-container uppercase tracking-[0.15em] font-bold block mb-1">
              Transparent Redressal Workflow
            </span>
            <h2 className="font-headline-lg text-2xl sm:text-headline-lg text-on-surface font-bold">
              How It Works
            </h2>
            <div className="w-16 h-1 bg-gov-saffron mx-auto mt-md rounded-full"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-lg mt-xl">
            {/* Step 1 */}
            <div className="bg-surface-container-lowest border border-outline-variant p-lg rounded-lg flex flex-col items-center text-center hover:shadow-card hover:border-primary-container transition-all group">
              <div className="w-16 h-16 rounded-full bg-surface-container flex items-center justify-center mb-md border border-outline-variant group-hover:bg-primary-container group-hover:text-white transition-colors">
                <span className="material-symbols-outlined text-primary-container group-hover:text-white text-[32px]">
                  edit_document
                </span>
              </div>
              <h3 className="font-headline-sm text-lg font-bold text-on-surface mb-sm">
                1. Report a Problem
              </h3>
              <p className="font-body-md text-sm text-on-surface-variant leading-relaxed">
                Submit an issue using Image, Text, or Voice formats to ensure accurate and detailed reporting directly to relevant civic authorities.
              </p>
            </div>

            {/* Step 2 */}
            <div className="bg-surface-container-lowest border border-outline-variant p-lg rounded-lg flex flex-col items-center text-center hover:shadow-card hover:border-primary-container transition-all group">
              <div className="w-16 h-16 rounded-full bg-surface-container flex items-center justify-center mb-md border border-outline-variant group-hover:bg-primary-container group-hover:text-white transition-colors">
                <span className="material-symbols-outlined text-primary-container group-hover:text-white text-[32px]">
                  gavel
                </span>
              </div>
              <h3 className="font-headline-sm text-lg font-bold text-on-surface mb-sm">
                2. Government Reviews
              </h3>
              <p className="font-body-md text-sm text-on-surface-variant leading-relaxed">
                Your complaint is securely routed, reviewed by appropriate authorities, categorized via AI severity algorithms, and prioritized based on impact.
              </p>
            </div>

            {/* Step 3 */}
            <div className="bg-surface-container-lowest border border-outline-variant p-lg rounded-lg flex flex-col items-center text-center hover:shadow-card hover:border-primary-container transition-all group">
              <div className="w-16 h-16 rounded-full bg-surface-container flex items-center justify-center mb-md border border-outline-variant group-hover:bg-primary-container group-hover:text-white transition-colors">
                <span className="material-symbols-outlined text-primary-container group-hover:text-white text-[32px]">
                  track_changes
                </span>
              </div>
              <h3 className="font-headline-sm text-lg font-bold text-on-surface mb-sm">
                3. Track the Action
              </h3>
              <p className="font-body-md text-sm text-on-surface-variant leading-relaxed">
                Follow the real-time progress of your complaint with milestone updates, officer assignments, and photographic proof until marked as solved.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Why Section (Bento Grid) */}
      <section className="w-full py-xxl bg-surface-container-low border-y border-outline-variant">
        <div className="max-w-container-max mx-auto px-lg">
          <div className="flex flex-col md:flex-row gap-xl items-center">
            <div className="md:w-1/3 flex flex-col justify-center">
              <span className="font-label-sm text-xs text-primary-container uppercase tracking-[0.15em] font-bold block mb-1">
                Institutional Integrity
              </span>
              <h2 className="font-headline-lg text-2xl sm:text-headline-lg text-on-surface mb-md font-bold">
                Why Kalyan Setu
              </h2>
              <p className="font-body-md text-sm text-on-surface-variant mb-lg leading-relaxed">
                Built on the core principles of accountability, accessibility, and authority to bridge the gap between citizens and civic administration efficiently.
              </p>
              <button
                onClick={() => navigateTo('contact')}
                className="font-label-md text-sm text-primary-container font-bold flex items-center gap-xs hover:underline self-start"
              >
                Learn more about our methodology
                <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
              </button>
            </div>

            <div className="md:w-2/3 grid grid-cols-1 sm:grid-cols-2 gap-md">
              {/* Point 1 */}
              <div className="bg-surface-container-lowest p-md rounded-lg border border-outline-variant flex gap-md items-start sm:col-span-2 shadow-ambient">
                <div className="bg-surface-container p-sm rounded mt-xs text-primary-container">
                  <span className="material-symbols-outlined">support_agent</span>
                </div>
                <div>
                  <h4 className="font-headline-sm text-base font-bold text-on-surface mb-xs">
                    Multi-Channel Reporting
                  </h4>
                  <p className="font-body-md text-xs text-on-surface-variant leading-relaxed">
                    Report local problems through intuitive interfaces supporting photo uploads, structured text descriptions, or voice recordings for maximum accessibility in local languages.
                  </p>
                </div>
              </div>

              {/* Point 2 */}
              <div className="bg-surface-container-lowest p-md rounded-lg border border-outline-variant flex gap-md items-start shadow-ambient">
                <div className="bg-surface-container p-sm rounded mt-xs text-primary-container">
                  <span className="material-symbols-outlined">psychology</span>
                </div>
                <div>
                  <h4 className="font-headline-sm text-base font-bold text-on-surface mb-xs">
                    AI-Driven Triage
                  </h4>
                  <p className="font-body-md text-xs text-on-surface-variant leading-relaxed">
                    Automatic clustering and severity scoring highlight critical hazards for immediate rapid response dispatch.
                  </p>
                </div>
              </div>

              {/* Point 3 */}
              <div className="bg-surface-container-lowest p-md rounded-lg border border-outline-variant flex gap-md items-start shadow-ambient">
                <div className="bg-surface-container p-sm rounded mt-xs text-primary-container">
                  <span className="material-symbols-outlined">verified</span>
                </div>
                <div>
                  <h4 className="font-headline-sm text-base font-bold text-on-surface mb-xs">
                    Verified Resolution
                  </h4>
                  <p className="font-body-md text-xs text-on-surface-variant leading-relaxed">
                    Complaints are only closed after on-site photographic evidence is uploaded and validated with the citizen.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Recent Grievances Feed */}
      <section className="w-full py-xl bg-surface">
        <div className="max-w-container-max mx-auto px-lg">
          <div className="flex justify-between items-end mb-lg">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-primary-container">
                Transparent Public Feed
              </span>
              <h2 className="text-xl sm:text-2xl font-bold text-on-surface">
                Recent Civic Action Updates
              </h2>
            </div>
            <button
              onClick={() => navigateTo('citizen_dashboard')}
              className="text-xs font-bold text-primary hover:underline flex items-center gap-1"
            >
              View Full Dashboard
              <span className="material-symbols-outlined text-sm">arrow_forward</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-md">
            {complaints.slice(0, 3).map((item) => (
              <div
                key={item.id}
                onClick={() => navigateTo('track', item.id)}
                className="bg-surface-container-lowest border border-outline-variant rounded-lg p-md hover:shadow-card hover:border-primary transition-all cursor-pointer flex flex-col justify-between"
              >
                <div>
                  <div className="flex justify-between items-center mb-2">
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
                  </div>
                  <h3 className="text-sm font-bold text-on-surface line-clamp-1 mb-1">{item.title}</h3>
                  <p className="text-xs text-on-surface-variant line-clamp-2 mb-3">{item.description}</p>
                </div>

                <div className="border-t border-outline-variant pt-2 flex items-center justify-between text-[11px] text-on-surface-variant">
                  <span className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-xs">location_on</span>
                    <span className="truncate max-w-[140px]">{item.location}</span>
                  </span>
                  <span>{item.dateFiled}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="w-full bg-gradient-to-r from-primary-container to-primary text-white py-xl text-center">
        <div className="max-w-3xl mx-auto px-lg">
          <h2 className="font-headline-lg text-2xl sm:text-headline-lg font-bold mb-sm">
            Make Your Ward a Better Place
          </h2>
          <p className="text-sm text-primary-fixed-dim mb-lg max-w-xl mx-auto">
            Take a picture, record a note, or write a description. Our automated routing system assigns it directly to the responsible engineer in your district.
          </p>
          <button
            onClick={() => navigateTo('submit')}
            className="bg-gov-saffron text-primary font-bold px-8 py-3 rounded text-sm hover:bg-white transition-all shadow-lg active:scale-95 inline-flex items-center gap-2"
          >
            <span className="material-symbols-outlined">add_circle</span>
            File Your Grievance Now
          </button>
        </div>
      </section>
    </div>
  );
}

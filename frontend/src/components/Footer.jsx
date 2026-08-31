import React from 'react';
import { useCivic } from '../context/CivicContext';
import kalyanSetuLogo from '../assets/kalyan-setu-logo.png';

export default function Footer() {
  const { navigateTo } = useCivic();

  return (
    <footer className="bg-primary text-white border-t-4 border-gov-saffron mt-auto">
      <div className="max-w-container-max mx-auto px-lg py-xl">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-xl">
          {/* Col 1: Brand & Ministry */}
          <div className="flex flex-col gap-sm md:col-span-1">
            <div className="flex items-center gap-sm">
              <img
                src={kalyanSetuLogo}
                alt="Kalyan Setu Logo"
                className="h-12 w-auto object-contain brightness-0 invert"
              />
            </div>
            <p className="font-body-sm text-xs text-primary-fixed-dim mt-2 leading-relaxed">
              An official civic engagement platform developed under the National e-Governance Plan (NeGP) to facilitate rapid grievance redressal and transparent civic administration.
            </p>
          </div>

          {/* Col 2: Citizen Portals */}
          <div className="flex flex-col gap-sm">
            <h3 className="font-label-md text-sm font-bold text-gov-saffron uppercase tracking-wider">
              Citizen Services
            </h3>
            <ul className="flex flex-col gap-2 font-body-sm text-xs text-primary-fixed-dim">
              <li>
                <button onClick={() => navigateTo('submit')} className="hover:text-white transition-colors">
                  Report a Civic Problem
                </button>
              </li>
              <li>
                <button onClick={() => navigateTo('track')} className="hover:text-white transition-colors">
                  Track Grievance Status
                </button>
              </li>
              <li>
                <button onClick={() => navigateTo('citizen_dashboard')} className="hover:text-white transition-colors">
                  Citizen Dashboard
                </button>
              </li>
              <li>
                <button onClick={() => navigateTo('contact')} className="hover:text-white transition-colors">
                  Grievance Redressal Mechanism
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3: Government Portals */}
          <div className="flex flex-col gap-sm">
            <h3 className="font-label-md text-sm font-bold text-gov-saffron uppercase tracking-wider">
              Administrative Portals
            </h3>
            <ul className="flex flex-col gap-2 font-body-sm text-xs text-primary-fixed-dim">
              <li>
                <button onClick={() => navigateTo('admin_overview')} className="hover:text-white transition-colors">
                  State Overview & Analytics
                </button>
              </li>
              <li>
                <button onClick={() => navigateTo('admin_complaints')} className="hover:text-white transition-colors">
                  Complaints Management
                </button>
              </li>
              <li>
                <button onClick={() => navigateTo('admin_ai')} className="hover:text-white transition-colors">
                  AI Sentiment & Hotspot Analysis
                </button>
              </li>
              <li>
                <button onClick={() => navigateTo('admin_action')} className="hover:text-white transition-colors">
                  Take Action Directives
                </button>
              </li>
            </ul>
          </div>

          {/* Col 4: Support & Helplines */}
          <div className="flex flex-col gap-sm">
            <h3 className="font-label-md text-sm font-bold text-gov-saffron uppercase tracking-wider">
              Support & Emergency
            </h3>
            <div className="font-body-sm text-xs text-primary-fixed-dim flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-sm text-gov-saffron">call</span>
                <span>Toll-Free Helpline: <strong>1800-111-2222</strong></span>
              </div>
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-sm text-gov-saffron">mail</span>
                <span>support@peoplespriorities.gov.in</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-sm text-gov-saffron">location_on</span>
                <span>MeitY, CGO Complex, New Delhi</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom copyright & National portal badge */}
        <div className="border-t border-white/10 mt-xl pt-md flex flex-col md:flex-row justify-between items-center text-xs text-primary-fixed-dim gap-4">
          <p>© 2026 Government of India. All rights reserved. Platform hosted by National Informatics Centre (NIC).</p>
          <div className="flex gap-4">
            <a href="#" className="hover:underline">Privacy Policy</a>
            <a href="#" className="hover:underline">Terms of Service</a>
            <a href="#" className="hover:underline">Hyperlinking Policy</a>
            <a href="#" className="hover:underline">Accessibility Statement</a>
          </div>
        </div>
      </div>
    </footer>
  );
}

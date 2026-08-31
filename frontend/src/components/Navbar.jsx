import React, { useState } from 'react';
import { useCivic } from '../context/CivicContext';
import kalyanSetuLogo from '../assets/kalyan-setu-logo.png';

export default function Navbar() {
  const { activeTab, navigateTo, userRole, setUserRole, openAuth, currentUser } = useCivic();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [langMenuOpen, setLangMenuOpen] = useState(false);
  const [selectedLang, setSelectedLang] = useState('EN');

  const isOfficial = userRole === 'official';

  return (
    <header className="bg-surface border-b border-outline-variant w-full sticky top-0 z-50 shadow-sm">
      {/* Top micro-bar for Government official banner */}
      <div className="bg-primary-container text-on-primary py-1 px-lg text-xs font-label-sm flex justify-between items-center">
        <div className="flex items-center gap-2 max-w-container-max mx-auto w-full">
          <div className="flex items-center gap-1.5 font-medium">
            <span className="inline-block w-2 h-2 rounded-full bg-gov-green animate-pulse"></span>
            <span>Government of India • Ministry of Rural Development . Kalyan Setu</span>
          </div>
          <div className="ml-auto flex items-center gap-4">
            <button
              onClick={() => {
                const newRole = isOfficial ? 'citizen' : 'official';
                setUserRole(newRole);
                if (newRole === 'official') {
                  navigateTo('admin_overview');
                } else {
                  navigateTo('home');
                }
              }}
              className="text-primary-fixed-dim hover:text-white transition-colors underline flex items-center gap-1 cursor-pointer font-bold"
            >
              <span className="material-symbols-outlined text-[14px]">swap_horiz</span>
              Switch to {isOfficial ? 'Citizen Portal' : 'Government Administration'}
            </button>
            <div className="relative">
              <button 
                onClick={() => setLangMenuOpen(!langMenuOpen)}
                className="hover:text-primary-fixed-dim flex items-center gap-0.5"
              >
                <span>{selectedLang}</span>
                <span className="material-symbols-outlined text-[14px]">arrow_drop_down</span>
              </button>
              {langMenuOpen && (
                <div className="absolute right-0 mt-1 bg-surface-container-lowest text-on-surface border border-outline-variant rounded shadow-lg py-1 w-24 z-50">
                  {['English (EN)', 'हिंदी (HI)', 'বাংলা (BN)', 'मराठी (MR)', 'తెలుగు (TE)'].map((lang) => (
                    <button
                      key={lang}
                      onClick={() => {
                        setSelectedLang(lang.slice(-3, -1));
                        setLangMenuOpen(false);
                      }}
                      className="w-full text-left px-3 py-1 text-xs hover:bg-surface-container-high"
                    >
                      {lang}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="flex justify-between items-center w-full px-lg py-md max-w-container-max mx-auto">
        {/* Brand */}
        <div 
          onClick={() => navigateTo('home')}
          className="flex items-center cursor-pointer group"
        >
          <img
            src={kalyanSetuLogo}
            alt="Kalyan Setu Logo"
            className="h-12 w-auto object-contain group-hover:scale-105 transition-transform"
          />
        </div>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-gutter h-full pt-1">
          <button
            onClick={() => navigateTo('home')}
            className={`font-label-md text-label-md transition-all pb-1 ${
              activeTab === 'home'
                ? 'text-primary font-bold border-b-2 border-primary'
                : 'text-on-surface-variant font-medium hover:text-primary hover:bg-surface-container-high px-sm py-xs rounded'
            }`}
          >
            Home
          </button>

          <button
            onClick={() => navigateTo('citizen_dashboard')}
            className={`font-label-md text-label-md transition-all pb-1 ${
              activeTab === 'citizen_dashboard'
                ? 'text-primary font-bold border-b-2 border-primary'
                : 'text-on-surface-variant font-medium hover:text-primary hover:bg-surface-container-high px-sm py-xs rounded'
            }`}
          >
            Citizen Dashboard
          </button>

          <button
            onClick={() => navigateTo('submit')}
            className={`font-label-md text-label-md transition-all pb-1 ${
              activeTab === 'submit'
                ? 'text-primary font-bold border-b-2 border-primary'
                : 'text-on-surface-variant font-medium hover:text-primary hover:bg-surface-container-high px-sm py-xs rounded'
            }`}
          >
            Report a Problem
          </button>

          <button
            onClick={() => navigateTo('track')}
            className={`font-label-md text-label-md transition-all pb-1 ${
              activeTab === 'track'
                ? 'text-primary font-bold border-b-2 border-primary'
                : 'text-on-surface-variant font-medium hover:text-primary hover:bg-surface-container-high px-sm py-xs rounded'
            }`}
          >
            Track Status
          </button>

          <button
            onClick={() => navigateTo('contact')}
            className={`font-label-md text-label-md transition-all pb-1 ${
              activeTab === 'contact'
                ? 'text-primary font-bold border-b-2 border-primary'
                : 'text-on-surface-variant font-medium hover:text-primary hover:bg-surface-container-high px-sm py-xs rounded'
            }`}
          >
            Grievance Redressal / Contact
          </button>

          {isOfficial && (
            <button
              onClick={() => navigateTo('admin_overview')}
              className="font-label-md text-label-md bg-secondary-container/20 text-on-secondary-container px-2.5 py-1 rounded border border-secondary-container font-bold hover:bg-secondary-container/30 transition-colors flex items-center gap-1"
            >
              <span className="material-symbols-outlined text-[16px]">admin_panel_settings</span>
              Official Portal
            </button>
          )}
        </nav>

        {/* Action Controls */}
        <div className="flex items-center gap-md">
          <div className="hidden md:flex gap-sm mr-sm border-r border-outline-variant pr-md">
            <button
              onClick={() => navigateTo('contact')}
              aria-label="Help & Support"
              title="Help & Support"
              className="text-on-surface-variant hover:text-primary hover:bg-surface-container-high transition-colors p-sm rounded-full"
            >
              <span className="material-symbols-outlined">help</span>
            </button>
          </div>

          <button
            onClick={() => openAuth('citizen', 'login')}
            className="font-label-md text-label-md text-primary-container border border-primary-container rounded px-md py-sm hover:bg-surface-container transition-colors font-medium active:scale-95"
          >
            Sign In
          </button>

          <button
            onClick={() => openAuth('citizen', 'register')}
            className="font-label-md text-label-md bg-primary-container text-on-primary rounded px-md py-sm hover:bg-primary transition-all shadow-sm font-semibold active:scale-95"
          >
            Register
          </button>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden text-on-surface-variant p-sm hover:bg-surface-container rounded"
            aria-label="Toggle menu"
          >
            <span className="material-symbols-outlined">{mobileMenuOpen ? 'close' : 'menu'}</span>
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-surface-container-lowest border-b border-outline-variant px-lg py-md flex flex-col gap-sm animate-in slide-in-from-top duration-200">
          <button
            onClick={() => { navigateTo('home'); setMobileMenuOpen(false); }}
            className={`text-left py-2 px-3 rounded font-label-md ${activeTab === 'home' ? 'bg-primary-container text-on-primary' : 'text-on-surface hover:bg-surface-container'}`}
          >
            Home
          </button>
          <button
            onClick={() => { navigateTo('citizen_dashboard'); setMobileMenuOpen(false); }}
            className={`text-left py-2 px-3 rounded font-label-md ${activeTab === 'citizen_dashboard' ? 'bg-primary-container text-on-primary' : 'text-on-surface hover:bg-surface-container'}`}
          >
            Citizen Dashboard
          </button>
          <button
            onClick={() => { navigateTo('submit'); setMobileMenuOpen(false); }}
            className={`text-left py-2 px-3 rounded font-label-md ${activeTab === 'submit' ? 'bg-primary-container text-on-primary' : 'text-on-surface hover:bg-surface-container'}`}
          >
            Report a Problem
          </button>
          <button
            onClick={() => { navigateTo('track'); setMobileMenuOpen(false); }}
            className={`text-left py-2 px-3 rounded font-label-md ${activeTab === 'track' ? 'bg-primary-container text-on-primary' : 'text-on-surface hover:bg-surface-container'}`}
          >
            Track Status
          </button>
          <button
            onClick={() => { navigateTo('contact'); setMobileMenuOpen(false); }}
            className={`text-left py-2 px-3 rounded font-label-md ${activeTab === 'contact' ? 'bg-primary-container text-on-primary' : 'text-on-surface hover:bg-surface-container'}`}
          >
            Contact & Support
          </button>
          <button
            onClick={() => {
              const newRole = isOfficial ? 'citizen' : 'official';
              setUserRole(newRole);
              navigateTo(newRole === 'official' ? 'admin_overview' : 'home');
              setMobileMenuOpen(false);
            }}
            className="text-left py-2 px-3 rounded font-label-md bg-surface-container text-primary font-bold flex items-center justify-between"
          >
            <span>{isOfficial ? 'Switch to Citizen Mode' : 'Switch to Government Portal'}</span>
            <span className="material-symbols-outlined text-sm">swap_horiz</span>
          </button>
        </div>
      )}
    </header>
  );
}

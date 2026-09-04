import React, { useState } from 'react';
import { useCivic } from '../context/CivicContext';
import kalyanSetuLogo from '../assets/kalyan-setu-logo.png';

export default function Navbar() {
  const {
    activeTab,
    navigateTo,
    userRole,
    setUserRole,
    openAuth,
    currentUser,
    authToken,
    logoutUser
  } = useCivic();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [langMenuOpen, setLangMenuOpen] = useState(false);
  const [selectedLang, setSelectedLang] = useState('EN');

  const isAuthenticated = Boolean(currentUser || authToken);
  const isOfficial = userRole === 'official';

  const handlePortalSwitch = () => {
    if (isOfficial) {
      setUserRole('citizen');
      navigateTo('home');
    } else {
      if (!isAuthenticated || userRole !== 'official') {
        openAuth('official', 'login');
      } else {
        setUserRole('official');
        navigateTo('admin_overview');
      }
    }
  };

  const displayName = currentUser?.officer_name || currentUser?.full_name || currentUser?.name || currentUser?.email || (isOfficial ? 'Gov Official' : 'Citizen');

  return (
    <header className="bg-surface border-b border-outline-variant w-full sticky top-0 z-50 shadow-sm">
      {/* Top micro-bar for Government official banner */}
      <div className="bg-primary-container text-on-primary py-1 px-lg text-xs font-label-sm flex justify-between items-center">
        <div className="flex items-center gap-2 max-w-container-max mx-auto w-full">
          <div className="flex items-center gap-1.5 font-medium">
            <span className="inline-block w-2 h-2 rounded-full bg-gov-green animate-pulse"></span>
            <span>Government of India • Ministry of Rural Development • Kalyan Setu</span>
          </div>
          <div className="ml-auto flex items-center gap-4">
            {!isOfficial && (
              <button
                onClick={handlePortalSwitch}
                className="text-primary-fixed-dim hover:text-white transition-colors underline flex items-center gap-1 cursor-pointer font-bold"
              >
                <span className="material-symbols-outlined text-[14px]">swap_horiz</span>
                <span>Switch to Government Portal</span>
              </button>
            )}
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
          onClick={() => navigateTo(isOfficial ? 'admin_overview' : 'home')}
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
          {/* Home is visible to everyone except logged-in Government Officials */}
          {(!isAuthenticated || !isOfficial) && (
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
          )}

          {/* Citizen links visible ONLY when logged in as Citizen */}
          {isAuthenticated && !isOfficial && (
            <>
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

              <button
                onClick={() => navigateTo('profile')}
                className={`font-label-md text-label-md transition-all pb-1 ${
                  activeTab === 'profile'
                    ? 'text-primary font-bold border-b-2 border-primary'
                    : 'text-on-surface-variant font-medium hover:text-primary hover:bg-surface-container-high px-sm py-xs rounded'
                }`}
              >
                My Profile
              </button>
            </>
          )}

          {/* Government Officer links visible ONLY when logged in as Official */}
          {isAuthenticated && isOfficial && (
            <>
              <button
                onClick={() => navigateTo('admin_overview')}
                className={`font-label-md text-label-md transition-all pb-1 ${
                  activeTab === 'admin_overview'
                    ? 'text-primary font-bold border-b-2 border-primary'
                    : 'text-on-surface-variant font-medium hover:text-primary hover:bg-surface-container-high px-sm py-xs rounded'
                }`}
              >
                Official Overview
              </button>

              <button
                onClick={() => navigateTo('admin_ai')}
                className={`font-label-md text-label-md transition-all pb-1 ${
                  activeTab === 'admin_ai'
                    ? 'text-primary font-bold border-b-2 border-primary'
                    : 'text-on-surface-variant font-medium hover:text-primary hover:bg-surface-container-high px-sm py-xs rounded'
                }`}
              >
                AI Neural Insights
              </button>

              <button
                onClick={() => navigateTo('admin_complaints')}
                className={`font-label-md text-label-md transition-all pb-1 ${
                  activeTab === 'admin_complaints'
                    ? 'text-primary font-bold border-b-2 border-primary'
                    : 'text-on-surface-variant font-medium hover:text-primary hover:bg-surface-container-high px-sm py-xs rounded'
                }`}
              >
                Grievance Management
              </button>

              <button
                onClick={() => navigateTo('admin_action')}
                className={`font-label-md text-label-md transition-all pb-1 ${
                  activeTab === 'admin_action'
                    ? 'text-primary font-bold border-b-2 border-primary'
                    : 'text-on-surface-variant font-medium hover:text-primary hover:bg-surface-container-high px-sm py-xs rounded'
                }`}
              >
                Take Action
              </button>
            </>
          )}
        </nav>

        {/* Action Controls */}
        <div className="flex items-center gap-md">
          {!isAuthenticated ? (
            <>
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
            </>
          ) : (
            <div className="flex items-center gap-sm">
              <div
                onClick={() => !isOfficial && navigateTo('profile')}
                className={`flex items-center gap-2 bg-surface-container border border-outline-variant rounded-full px-3 py-1 text-xs ${!isOfficial ? 'cursor-pointer hover:border-primary transition-colors' : ''}`}
                title={!isOfficial ? 'View Citizen Profile' : 'Government Official Account'}
              >
                <span className="material-symbols-outlined text-primary text-sm">
                  {isOfficial ? 'admin_panel_settings' : 'account_circle'}
                </span>
                <span className="font-bold text-on-surface max-w-[120px] truncate">{displayName}</span>
              </div>

              <button
                onClick={logoutUser}
                className="font-label-md text-xs text-error border border-error/30 rounded px-2.5 py-1 hover:bg-error/10 transition-colors font-semibold"
              >
                Sign Out
              </button>
            </div>
          )}

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
          {(!isAuthenticated || !isOfficial) && (
            <button
              onClick={() => { navigateTo('home'); setMobileMenuOpen(false); }}
              className={`text-left py-2 px-3 rounded font-label-md ${activeTab === 'home' ? 'bg-primary-container text-on-primary' : 'text-on-surface hover:bg-surface-container'}`}
            >
              Home
            </button>
          )}

          {isAuthenticated && !isOfficial && (
            <>
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
                onClick={() => { navigateTo('profile'); setMobileMenuOpen(false); }}
                className={`text-left py-2 px-3 rounded font-label-md ${activeTab === 'profile' ? 'bg-primary-container text-on-primary' : 'text-on-surface hover:bg-surface-container'}`}
              >
                My Profile
              </button>
            </>
          )}

          {isAuthenticated && isOfficial && (
            <>
              <button
                onClick={() => { navigateTo('admin_overview'); setMobileMenuOpen(false); }}
                className={`text-left py-2 px-3 rounded font-label-md ${activeTab === 'admin_overview' ? 'bg-primary-container text-on-primary' : 'text-on-surface hover:bg-surface-container'}`}
              >
                Official Overview
              </button>
              <button
                onClick={() => { navigateTo('admin_ai'); setMobileMenuOpen(false); }}
                className={`text-left py-2 px-3 rounded font-label-md ${activeTab === 'admin_ai' ? 'bg-primary-container text-on-primary' : 'text-on-surface hover:bg-surface-container'}`}
              >
                AI Neural Insights
              </button>
              <button
                onClick={() => { navigateTo('admin_complaints'); setMobileMenuOpen(false); }}
                className={`text-left py-2 px-3 rounded font-label-md ${activeTab === 'admin_complaints' ? 'bg-primary-container text-on-primary' : 'text-on-surface hover:bg-surface-container'}`}
              >
                Grievance Management
              </button>
              <button
                onClick={() => { navigateTo('admin_action'); setMobileMenuOpen(false); }}
                className={`text-left py-2 px-3 rounded font-label-md ${activeTab === 'admin_action' ? 'bg-primary-container text-on-primary' : 'text-on-surface hover:bg-surface-container'}`}
              >
                Take Action
              </button>
            </>
          )}

          {!isOfficial && (
            <button
              onClick={() => {
                handlePortalSwitch();
                setMobileMenuOpen(false);
              }}
              className="text-left py-2 px-3 rounded font-label-md bg-surface-container text-primary font-bold flex items-center justify-between mt-2"
            >
              <span>Switch to Government Portal</span>
              <span className="material-symbols-outlined text-sm">swap_horiz</span>
            </button>
          )}
        </div>
      )}
    </header>
  );
}

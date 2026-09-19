import React, { useState } from 'react';
import { useCivic } from '../context/CivicContext';
import { useLanguage } from '../context/LanguageContext';
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

  const {
    currentLanguage,
    selectedLanguageMeta,
    supportedLanguages,
    changeLanguage,
    t
  } = useLanguage();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [langMenuOpen, setLangMenuOpen] = useState(false);

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

  const displayName = currentUser?.officer_name || currentUser?.full_name || currentUser?.name || currentUser?.email || (isOfficial ? t('navbar.officialBadge') : t('navbar.citizenBadge'));

  return (
    <header className="bg-surface border-b border-outline-variant w-full sticky top-0 z-50 shadow-sm">
      {/* Top micro-bar for Government official banner */}
      <div className="bg-primary-container text-on-primary py-1 px-3 sm:px-lg text-xs font-label-sm flex justify-between items-center">
        <div className="flex items-center gap-2 max-w-container-max mx-auto w-full">
          <div className="flex items-center gap-1.5 font-medium min-w-0">
            <span className="inline-block w-2 h-2 rounded-full bg-gov-green animate-pulse shrink-0"></span>
            <span className="truncate">
              {isOfficial ? (
                <>
                  <span className="sm:hidden text-[11px]">{t('navbar.adminBannerShort')}</span>
                  <span className="hidden sm:inline">{t('navbar.adminBanner')}</span>
                </>
              ) : (
                <>
                  <span className="sm:hidden text-[11px]">{t('navbar.citizenBannerShort')}</span>
                  <span className="hidden sm:inline">{t('navbar.citizenBanner')}</span>
                </>
              )}
            </span>
          </div>
          <div className="ml-auto flex items-center gap-2 sm:gap-4 shrink-0">
            {!isOfficial && (
              <button
                onClick={handlePortalSwitch}
                className="hidden sm:flex text-primary-fixed-dim hover:text-white transition-colors underline items-center gap-1 cursor-pointer font-bold text-xs"
              >
                <span className="material-symbols-outlined text-[14px]">swap_horiz</span>
                <span>{t('navbar.switchToGov')}</span>
              </button>
            )}
            <div className="relative">
              <button 
                onClick={() => setLangMenuOpen(!langMenuOpen)}
                className="hover:text-primary-fixed-dim flex items-center gap-0.5 text-xs font-semibold px-2 py-0.5 rounded bg-white/10 hover:bg-white/20 transition-all cursor-pointer"
                aria-label={t('navbar.selectLanguage')}
              >
                <span>{selectedLanguageMeta.label}</span>
                <span className="material-symbols-outlined text-[14px]">arrow_drop_down</span>
              </button>
              {langMenuOpen && (
                <div className="absolute right-0 mt-1 bg-surface-container-lowest text-on-surface border border-outline-variant rounded shadow-xl py-1 w-36 z-50">
                  {supportedLanguages.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => {
                        changeLanguage(lang.code);
                        setLangMenuOpen(false);
                      }}
                      className={`w-full text-left px-3 py-2 text-xs hover:bg-surface-container-high font-medium flex items-center justify-between cursor-pointer ${currentLanguage === lang.code ? 'text-primary font-bold bg-primary-container/10' : ''}`}
                    >
                      <span>{lang.label}</span>
                      {currentLanguage === lang.code && (
                        <span className="material-symbols-outlined text-xs text-primary">check</span>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="flex justify-between items-center w-full px-3 sm:px-lg py-2 sm:py-md max-w-container-max mx-auto">
        {/* Brand */}
        <div 
          onClick={() => { navigateTo(isOfficial ? 'admin_overview' : 'home'); setMobileMenuOpen(false); }}
          className="flex items-center cursor-pointer group shrink-0"
        >
          <img
            src={kalyanSetuLogo}
            alt={t('navbar.title')}
            className="h-9 sm:h-12 w-auto object-contain group-hover:scale-105 transition-transform"
          />
        </div>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-gutter h-full pt-1">
          {(!isAuthenticated || !isOfficial) && (
            <button
              onClick={() => navigateTo('home')}
              className={`font-label-md text-label-md transition-all pb-1 cursor-pointer ${
                activeTab === 'home'
                  ? 'text-primary font-bold border-b-2 border-primary'
                  : 'text-on-surface-variant font-medium hover:text-primary hover:bg-surface-container-high px-sm py-xs rounded'
              }`}
            >
              {t('navbar.home')}
            </button>
          )}

          {isAuthenticated && !isOfficial && (
            <>
              <button
                onClick={() => navigateTo('citizen_dashboard')}
                className={`font-label-md text-label-md transition-all pb-1 cursor-pointer ${
                  activeTab === 'citizen_dashboard'
                    ? 'text-primary font-bold border-b-2 border-primary'
                    : 'text-on-surface-variant font-medium hover:text-primary hover:bg-surface-container-high px-sm py-xs rounded'
                }`}
              >
                {t('navbar.dashboard')}
              </button>

              <button
                onClick={() => navigateTo('submit')}
                className={`font-label-md text-label-md transition-all pb-1 cursor-pointer ${
                  activeTab === 'submit'
                    ? 'text-primary font-bold border-b-2 border-primary'
                    : 'text-on-surface-variant font-medium hover:text-primary hover:bg-surface-container-high px-sm py-xs rounded'
                }`}
              >
                {t('navbar.reportProblem')}
              </button>

              <button
                onClick={() => navigateTo('track')}
                className={`font-label-md text-label-md transition-all pb-1 cursor-pointer ${
                  activeTab === 'track'
                    ? 'text-primary font-bold border-b-2 border-primary'
                    : 'text-on-surface-variant font-medium hover:text-primary hover:bg-surface-container-high px-sm py-xs rounded'
                }`}
              >
                {t('navbar.trackProblem')}
              </button>

              <button
                onClick={() => navigateTo('contact')}
                className={`font-label-md text-label-md transition-all pb-1 cursor-pointer ${
                  activeTab === 'contact'
                    ? 'text-primary font-bold border-b-2 border-primary'
                    : 'text-on-surface-variant font-medium hover:text-primary hover:bg-surface-container-high px-sm py-xs rounded'
                }`}
              >
                {t('navbar.contact')}
              </button>

              <button
                onClick={() => navigateTo('profile')}
                className={`font-label-md text-label-md transition-all pb-1 cursor-pointer ${
                  activeTab === 'profile'
                    ? 'text-primary font-bold border-b-2 border-primary'
                    : 'text-on-surface-variant font-medium hover:text-primary hover:bg-surface-container-high px-sm py-xs rounded'
                }`}
              >
                {t('navbar.profile')}
              </button>
            </>
          )}

          {isAuthenticated && isOfficial && (
            <>
              <button
                onClick={() => navigateTo('admin_overview')}
                className={`font-label-md text-label-md transition-all pb-1 cursor-pointer ${
                  activeTab === 'admin_overview'
                    ? 'text-primary font-bold border-b-2 border-primary'
                    : 'text-on-surface-variant font-medium hover:text-primary hover:bg-surface-container-high px-sm py-xs rounded'
                }`}
              >
                {t('navbar.overview')}
              </button>

              <button
                onClick={() => navigateTo('admin_ai')}
                className={`font-label-md text-label-md transition-all pb-1 cursor-pointer ${
                  activeTab === 'admin_ai'
                    ? 'text-primary font-bold border-b-2 border-primary'
                    : 'text-on-surface-variant font-medium hover:text-primary hover:bg-surface-container-high px-sm py-xs rounded'
                }`}
              >
                {t('navbar.aiAnalysis')}
              </button>

              <button
                onClick={() => navigateTo('admin_complaints')}
                className={`font-label-md text-label-md transition-all pb-1 cursor-pointer ${
                  activeTab === 'admin_complaints'
                    ? 'text-primary font-bold border-b-2 border-primary'
                    : 'text-on-surface-variant font-medium hover:text-primary hover:bg-surface-container-high px-sm py-xs rounded'
                }`}
              >
                {t('navbar.complaints')}
              </button>

              <button
                onClick={() => navigateTo('admin_action')}
                className={`font-label-md text-label-md transition-all pb-1 cursor-pointer ${
                  activeTab === 'admin_action'
                    ? 'text-primary font-bold border-b-2 border-primary'
                    : 'text-on-surface-variant font-medium hover:text-primary hover:bg-surface-container-high px-sm py-xs rounded'
                }`}
              >
                {t('navbar.takeAction')}
              </button>
            </>
          )}
        </nav>

        {/* Action Controls */}
        <div className="flex items-center gap-1.5 sm:gap-md">
          {!isAuthenticated ? (
            <>
              <button
                onClick={() => openAuth('citizen', 'login')}
                className="font-label-md text-xs sm:text-label-md text-primary-container border border-primary-container rounded px-2.5 sm:px-md py-1 sm:py-sm hover:bg-surface-container transition-colors font-medium active:scale-95 cursor-pointer"
              >
                {t('navbar.signIn')}
              </button>

              <button
                onClick={() => openAuth('citizen', 'register')}
                className="hidden sm:inline-flex font-label-md text-label-md bg-primary-container text-on-primary rounded px-md py-sm hover:bg-primary transition-all shadow-sm font-semibold active:scale-95 cursor-pointer"
              >
                {t('navbar.register')}
              </button>
            </>
          ) : (
            <div className="flex items-center gap-1.5 sm:gap-sm">
              <div
                onClick={() => !isOfficial && navigateTo('profile')}
                className={`flex items-center gap-1.5 bg-surface-container border border-outline-variant rounded-full px-2 sm:px-3 py-1 text-xs ${!isOfficial ? 'cursor-pointer hover:border-primary transition-colors' : ''}`}
                title={!isOfficial ? t('navbar.profile') : t('navbar.officialBadge')}
              >
                <span className="material-symbols-outlined text-primary text-sm">
                  {isOfficial ? 'admin_panel_settings' : 'account_circle'}
                </span>
                <span className="font-bold text-on-surface max-w-[80px] sm:max-w-[120px] truncate">{displayName}</span>
              </div>

              <button
                onClick={logoutUser}
                className="font-label-md text-[11px] sm:text-xs text-error border border-error/30 rounded px-2 sm:px-2.5 py-1 hover:bg-error/10 transition-colors font-semibold shrink-0 cursor-pointer"
              >
                {t('navbar.logout')}
              </button>
            </div>
          )}

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden text-on-surface-variant p-1.5 sm:p-sm hover:bg-surface-container rounded cursor-pointer"
            aria-label="Toggle menu"
          >
            <span className="material-symbols-outlined text-[24px]">{mobileMenuOpen ? 'close' : 'menu'}</span>
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-surface-container-lowest border-b border-outline-variant px-4 py-3 flex flex-col gap-1.5 shadow-xl animate-in slide-in-from-top duration-200 max-h-[80vh] overflow-y-auto">
          {(!isAuthenticated || !isOfficial) && (
            <button
              onClick={() => { navigateTo('home'); setMobileMenuOpen(false); }}
              className={`text-left py-2.5 px-3 rounded font-label-md flex items-center gap-2.5 ${activeTab === 'home' ? 'bg-primary-container text-on-primary font-bold' : 'text-on-surface hover:bg-surface-container'}`}
            >
              <span className="material-symbols-outlined text-lg">home</span>
              <span>{t('navbar.home')}</span>
            </button>
          )}

          {isAuthenticated && !isOfficial && (
            <>
              <button
                onClick={() => { navigateTo('citizen_dashboard'); setMobileMenuOpen(false); }}
                className={`text-left py-2.5 px-3 rounded font-label-md flex items-center gap-2.5 ${activeTab === 'citizen_dashboard' ? 'bg-primary-container text-on-primary font-bold' : 'text-on-surface hover:bg-surface-container'}`}
              >
                <span className="material-symbols-outlined text-lg">dashboard</span>
                <span>{t('navbar.dashboard')}</span>
              </button>
              <button
                onClick={() => { navigateTo('submit'); setMobileMenuOpen(false); }}
                className={`text-left py-2.5 px-3 rounded font-label-md flex items-center gap-2.5 ${activeTab === 'submit' ? 'bg-primary-container text-on-primary font-bold' : 'text-on-surface hover:bg-surface-container'}`}
              >
                <span className="material-symbols-outlined text-lg">add_circle</span>
                <span>{t('navbar.reportProblem')}</span>
              </button>
              <button
                onClick={() => { navigateTo('track'); setMobileMenuOpen(false); }}
                className={`text-left py-2.5 px-3 rounded font-label-md flex items-center gap-2.5 ${activeTab === 'track' ? 'bg-primary-container text-on-primary font-bold' : 'text-on-surface hover:bg-surface-container'}`}
              >
                <span className="material-symbols-outlined text-lg">my_location</span>
                <span>{t('navbar.trackProblem')}</span>
              </button>
              <button
                onClick={() => { navigateTo('contact'); setMobileMenuOpen(false); }}
                className={`text-left py-2.5 px-3 rounded font-label-md flex items-center gap-2.5 ${activeTab === 'contact' ? 'bg-primary-container text-on-primary font-bold' : 'text-on-surface hover:bg-surface-container'}`}
              >
                <span className="material-symbols-outlined text-lg">contact_support</span>
                <span>{t('navbar.contact')}</span>
              </button>
              <button
                onClick={() => { navigateTo('profile'); setMobileMenuOpen(false); }}
                className={`text-left py-2.5 px-3 rounded font-label-md flex items-center gap-2.5 ${activeTab === 'profile' ? 'bg-primary-container text-on-primary font-bold' : 'text-on-surface hover:bg-surface-container'}`}
              >
                <span className="material-symbols-outlined text-lg">person</span>
                <span>{t('navbar.profile')}</span>
              </button>
            </>
          )}

          {isAuthenticated && isOfficial && (
            <>
              <button
                onClick={() => { navigateTo('admin_overview'); setMobileMenuOpen(false); }}
                className={`text-left py-2.5 px-3 rounded font-label-md flex items-center gap-2.5 ${activeTab === 'admin_overview' ? 'bg-primary-container text-on-primary font-bold' : 'text-on-surface hover:bg-surface-container'}`}
              >
                <span className="material-symbols-outlined text-lg">dashboard</span>
                <span>{t('navbar.overview')}</span>
              </button>
              <button
                onClick={() => { navigateTo('admin_ai'); setMobileMenuOpen(false); }}
                className={`text-left py-2.5 px-3 rounded font-label-md flex items-center gap-2.5 ${activeTab === 'admin_ai' ? 'bg-primary-container text-on-primary font-bold' : 'text-on-surface hover:bg-surface-container'}`}
              >
                <span className="material-symbols-outlined text-lg">analytics</span>
                <span>{t('navbar.aiAnalysis')}</span>
              </button>
              <button
                onClick={() => { navigateTo('admin_complaints'); setMobileMenuOpen(false); }}
                className={`text-left py-2.5 px-3 rounded font-label-md flex items-center gap-2.5 ${activeTab === 'admin_complaints' ? 'bg-primary-container text-on-primary font-bold' : 'text-on-surface hover:bg-surface-container'}`}
              >
                <span className="material-symbols-outlined text-lg">assignment_late</span>
                <span>{t('navbar.complaints')}</span>
              </button>
              <button
                onClick={() => { navigateTo('admin_action'); setMobileMenuOpen(false); }}
                className={`text-left py-2.5 px-3 rounded font-label-md flex items-center gap-2.5 ${activeTab === 'admin_action' ? 'bg-primary-container text-on-primary font-bold' : 'text-on-surface hover:bg-surface-container'}`}
              >
                <span className="material-symbols-outlined text-lg">gavel</span>
                <span>{t('navbar.takeAction')}</span>
              </button>
            </>
          )}

          {!isAuthenticated && (
            <button
              onClick={() => { openAuth('citizen', 'register'); setMobileMenuOpen(false); }}
              className="text-left py-2.5 px-3 rounded font-label-md bg-primary-container text-on-primary font-bold flex items-center gap-2.5 mt-1"
            >
              <span className="material-symbols-outlined text-lg">person_add</span>
              <span>{t('navbar.register')}</span>
            </button>
          )}

          {!isOfficial ? (
            <button
              onClick={() => {
                handlePortalSwitch();
                setMobileMenuOpen(false);
              }}
              className="text-left py-2.5 px-3 rounded font-label-md bg-surface-container text-primary font-bold flex items-center justify-between mt-2 border border-outline-variant"
            >
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-sm text-gov-green">shield_person</span>
                <span>{t('navbar.switchToGov')}</span>
              </div>
              <span className="material-symbols-outlined text-sm">swap_horiz</span>
            </button>
          ) : (
            <button
              onClick={() => {
                handlePortalSwitch();
                setMobileMenuOpen(false);
              }}
              className="text-left py-2.5 px-3 rounded font-label-md bg-surface-container text-primary font-bold flex items-center justify-between mt-2 border border-outline-variant"
            >
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-sm text-primary">public</span>
                <span>{t('navbar.switchToCitizen')}</span>
              </div>
              <span className="material-symbols-outlined text-sm">swap_horiz</span>
            </button>
          )}
        </div>
      )}
    </header>
  );
}

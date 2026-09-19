import React from 'react';
import { useCivic } from '../context/CivicContext';
import { useLanguage } from '../context/LanguageContext';
import kalyanSetuLogo from '../assets/kalyan-setu-logo.png';

export default function Footer() {
  const { navigateTo } = useCivic();
  const { t } = useLanguage();

  return (
    <footer className="bg-primary text-white border-t-4 border-gov-saffron mt-auto">
      <div className="max-w-container-max mx-auto px-4 sm:px-lg py-8 sm:py-xl">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 md:gap-xl">
          {/* Col 1: Brand & Ministry */}
          <div className="flex flex-col gap-sm md:col-span-1">
            <div className="flex items-center gap-sm">
              <img
                src={kalyanSetuLogo}
                alt={t('navbar.title')}
                className="h-10 sm:h-12 w-auto object-contain brightness-0 invert"
              />
            </div>
            <p className="font-body-sm text-xs text-primary-fixed-dim mt-2 leading-relaxed">
              {t('footer.platformDesc')}
            </p>
          </div>

          {/* Col 2: Citizen Portals */}
          <div className="flex flex-col gap-sm">
            <h3 className="font-label-md text-sm font-bold text-gov-saffron uppercase tracking-wider">
              {t('footer.citizenServices')}
            </h3>
            <ul className="flex flex-col gap-2 font-body-sm text-xs text-primary-fixed-dim">
              <li>
                <button onClick={() => navigateTo('submit')} className="hover:text-white transition-colors cursor-pointer text-left">
                  {t('footer.reportCivicProblem')}
                </button>
              </li>
              <li>
                <button onClick={() => navigateTo('track')} className="hover:text-white transition-colors cursor-pointer text-left">
                  {t('footer.trackGrievanceStatus')}
                </button>
              </li>
              <li>
                <button onClick={() => navigateTo('citizen_dashboard')} className="hover:text-white transition-colors cursor-pointer text-left">
                  {t('footer.citizenDashboard')}
                </button>
              </li>
              <li>
                <button onClick={() => navigateTo('contact')} className="hover:text-white transition-colors cursor-pointer text-left">
                  {t('footer.grievanceMechanism')}
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3: Government Portals */}
          <div className="flex flex-col gap-sm">
            <h3 className="font-label-md text-sm font-bold text-gov-saffron uppercase tracking-wider">
              {t('footer.adminPortals')}
            </h3>
            <ul className="flex flex-col gap-2 font-body-sm text-xs text-primary-fixed-dim">
              <li>
                <button onClick={() => navigateTo('admin_overview')} className="hover:text-white transition-colors cursor-pointer text-left">
                  {t('footer.stateOverview')}
                </button>
              </li>
              <li>
                <button onClick={() => navigateTo('admin_complaints')} className="hover:text-white transition-colors cursor-pointer text-left">
                  {t('footer.complaintsManagement')}
                </button>
              </li>
              <li>
                <button onClick={() => navigateTo('admin_ai')} className="hover:text-white transition-colors cursor-pointer text-left">
                  {t('footer.aiHotspotAnalysis')}
                </button>
              </li>
              <li>
                <button onClick={() => navigateTo('admin_action')} className="hover:text-white transition-colors cursor-pointer text-left">
                  {t('footer.takeActionDirectives')}
                </button>
              </li>
            </ul>
          </div>

          {/* Col 4: Support & Helplines */}
          <div className="flex flex-col gap-sm">
            <h3 className="font-label-md text-sm font-bold text-gov-saffron uppercase tracking-wider">
              {t('footer.supportHelplines')}
            </h3>
            <div className="font-body-sm text-xs text-primary-fixed-dim flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-sm text-gov-saffron">call</span>
                <span>{t('footer.tollFree')}: <strong>1800-111-555</strong></span>
              </div>
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-sm text-gov-saffron">mail</span>
                <span>{t('footer.emailSupport')}</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="material-symbols-outlined text-sm text-gov-saffron shrink-0 mt-0.5">location_on</span>
                <span>{t('footer.address')}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom copyright & National portal badge */}
        <div className="border-t border-white/10 mt-xl pt-md flex flex-col md:flex-row justify-between items-center text-xs text-primary-fixed-dim gap-4">
          <p>{t('footer.copyright')}</p>
          <div className="flex flex-wrap gap-4">
            <a href="#" className="hover:underline">{t('footer.privacyPolicy')}</a>
            <a href="#" className="hover:underline">{t('footer.termsOfService')}</a>
            <a href="#" className="hover:underline">{t('footer.hyperlinkingPolicy')}</a>
            <a href="#" className="hover:underline">{t('footer.accessibility')}</a>
          </div>
        </div>
      </div>
    </footer>
  );
}

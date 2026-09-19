import React from 'react';
import { useCivic } from '../context/CivicContext';
import { useLanguage } from '../context/LanguageContext';
import parliamentBg from '../assets/parliament-bg.jpg';

export default function HomePage() {
  const { navigateTo, complaints } = useCivic();
  const { t } = useLanguage();

  return (
    <div className="flex flex-col flex-grow w-full">
      {/* Hero Section */}
      <section className="relative w-full min-h-[480px] sm:min-h-[560px] flex items-center bg-surface-variant">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <img
            alt="Indian Parliament Building (Sansad Bhavan)"
            className="w-full h-full object-cover"
            src={parliamentBg}
          />
          <div className="absolute inset-0 hero-overlay"></div>
        </div>

        <div className="relative z-10 w-full max-w-container-max mx-auto px-4 sm:px-lg py-10 sm:py-xl">
          <div className="max-w-3xl">
            <span className="inline-block bg-white/15 backdrop-blur-sm text-primary-fixed text-[11px] sm:text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full mb-3 sm:mb-4 border border-white/20">
              {t('home.badge')}
            </span>
            <h1 className="font-display-lg text-3xl sm:text-5xl lg:text-display-lg text-white mb-2 sm:mb-sm leading-tight font-bold">
              {t('home.heroTitle')}
            </h1>
            <p className="font-headline-sm text-base sm:text-headline-sm text-gov-saffron mb-3 sm:mb-lg uppercase tracking-wide font-semibold">
              {t('home.heroTagline')}
            </p>
            <p className="font-body-lg text-sm sm:text-body-lg text-white/90 mb-6 sm:mb-xl max-w-2xl leading-relaxed">
              {t('home.heroDesc')}
            </p>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-md w-full sm:w-auto">
              <button
                onClick={() => navigateTo('submit')}
                className="font-label-md text-sm bg-gov-saffron text-primary font-bold rounded px-6 sm:px-lg py-3 sm:py-md hover:bg-white hover:text-primary transition-all flex items-center justify-center gap-2 shadow-lg active:scale-95 w-full sm:w-auto cursor-pointer"
              >
                <span className="material-symbols-outlined filled-icon text-xl">report_problem</span>
                {t('home.reportButton')}
              </button>
              <button
                onClick={() => navigateTo('track')}
                className="font-label-md text-sm bg-transparent border-2 border-white text-white font-bold rounded px-6 sm:px-lg py-3 sm:py-md hover:bg-white/10 transition-all flex items-center justify-center gap-2 active:scale-95 w-full sm:w-auto cursor-pointer"
              >
                <span className="material-symbols-outlined text-xl">my_location</span>
                {t('home.trackButton')}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Live Metrics Counter Bar */}
      <section className="w-full bg-primary-container text-white py-6 sm:py-lg border-b border-outline-variant">
        <div className="max-w-container-max mx-auto px-4 sm:px-lg grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-lg text-center">
          <div className="p-2.5 sm:p-3 border-r border-white/10">
            <div className="font-display-lg text-2xl sm:text-3xl font-bold text-gov-saffron">2,48,910+</div>
            <div className="font-label-sm text-[11px] sm:text-xs text-primary-fixed-dim mt-1 uppercase tracking-wider">{t('home.stats.issuesLogged')}</div>
          </div>
          <div className="p-2.5 sm:p-3 md:border-r border-white/10">
            <div className="font-display-lg text-2xl sm:text-3xl font-bold text-gov-green">89.4%</div>
            <div className="font-label-sm text-[11px] sm:text-xs text-primary-fixed-dim mt-1 uppercase tracking-wider">{t('home.stats.resolutionRate')}</div>
          </div>
          <div className="p-2.5 sm:p-3 border-r border-white/10">
            <div className="font-display-lg text-2xl sm:text-3xl font-bold text-white">48 Hours</div>
            <div className="font-label-sm text-[11px] sm:text-xs text-primary-fixed-dim mt-1 uppercase tracking-wider">{t('home.stats.avgTriage')}</div>
          </div>
          <div className="p-2.5 sm:p-3">
            <div className="font-display-lg text-2xl sm:text-3xl font-bold text-gov-saffron">750+</div>
            <div className="font-label-sm text-[11px] sm:text-xs text-primary-fixed-dim mt-1 uppercase tracking-wider">{t('home.stats.districtsCovered')}</div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="w-full py-10 sm:py-xxl bg-surface">
        <div className="max-w-container-max mx-auto px-4 sm:px-lg">
          <div className="text-center mb-xl">
            <span className="font-label-sm text-xs text-primary-container uppercase tracking-[0.15em] font-bold block mb-1">
              {t('home.workflow.subtitle')}
            </span>
            <h2 className="font-headline-lg text-2xl sm:text-headline-lg text-on-surface font-bold">
              {t('home.workflow.title')}
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
                {t('home.workflow.step1Title')}
              </h3>
              <p className="font-body-md text-sm text-on-surface-variant leading-relaxed">
                {t('home.workflow.step1Desc')}
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
                {t('home.workflow.step2Title')}
              </h3>
              <p className="font-body-md text-sm text-on-surface-variant leading-relaxed">
                {t('home.workflow.step2Desc')}
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
                {t('home.workflow.step3Title')}
              </h3>
              <p className="font-body-md text-sm text-on-surface-variant leading-relaxed">
                {t('home.workflow.step3Desc')}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Recent Grievances Feed */}
      <section className="w-full py-8 sm:py-xl bg-surface">
        <div className="max-w-container-max mx-auto px-4 sm:px-lg">
          <div className="flex justify-between items-end mb-4 sm:mb-lg">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-primary-container">
                {t('citizen.recentReports')}
              </span>
              <h2 className="text-xl sm:text-2xl font-bold text-on-surface">
                {t('home.categories.subtitle')}
              </h2>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-md">
            {complaints.slice(0, 3).map((item) => (
              <div
                key={item.id}
                onClick={() => navigateTo('track', item.id)}
                className="bg-surface-container-lowest border border-outline-variant rounded-lg p-4 sm:p-md hover:shadow-card hover:border-primary transition-all cursor-pointer flex flex-col justify-between"
              >
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs font-mono font-bold text-primary">#{item.display_id || item.id}</span>
                    <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                      item.status === 'Resolved' 
                        ? 'bg-gov-green/10 text-gov-green border border-gov-green/30'
                        : item.status === 'Rejected'
                        ? 'bg-error/10 text-error border border-error/30 font-bold'
                        : 'bg-secondary-container/30 text-on-secondary-fixed-variant'
                    }`}>
                      {t(`status.${item.status}`, item.status)}
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-on-surface line-clamp-1 mb-1">{item.title}</h3>
                  <p className="text-xs text-on-surface-variant line-clamp-2 mb-3 leading-relaxed">{item.description}</p>
                </div>

                <div className="border-t border-outline-variant pt-2 flex items-center justify-between text-[11px] text-on-surface-variant">
                  <span className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-xs">location_on</span>
                    <span className="truncate max-w-[140px]">{item.location}</span>
                  </span>
                  <span>{item.dateFiled || item.date}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="w-full bg-gradient-to-r from-primary-container to-primary text-white py-10 sm:py-xl text-center">
        <div className="max-w-3xl mx-auto px-4 sm:px-lg">
          <h2 className="font-headline-lg text-2xl sm:text-headline-lg font-bold mb-2 sm:mb-sm">
            {t('home.cta.title')}
          </h2>
          <p className="text-sm text-primary-fixed-dim mb-6 sm:mb-lg max-w-xl mx-auto leading-relaxed">
            {t('home.cta.subtitle')}
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
            <button
              onClick={() => navigateTo('submit')}
              className="bg-gov-saffron text-primary font-bold px-6 sm:px-8 py-3 rounded text-sm hover:bg-white transition-all shadow-lg active:scale-95 inline-flex items-center justify-center gap-2 w-full sm:w-auto cursor-pointer"
            >
              <span className="material-symbols-outlined">add_circle</span>
              {t('home.cta.fileButton')}
            </button>
            <button
              onClick={() => navigateTo('track')}
              className="bg-transparent border border-white text-white font-bold px-6 sm:px-8 py-3 rounded text-sm hover:bg-white/10 transition-all active:scale-95 inline-flex items-center justify-center gap-2 w-full sm:w-auto cursor-pointer"
            >
              <span className="material-symbols-outlined">my_location</span>
              {t('home.cta.trackButton')}
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}

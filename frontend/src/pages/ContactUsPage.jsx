import React, { useState } from 'react';
import { useCivic } from '../context/CivicContext';
import { useLanguage } from '../context/LanguageContext';

export default function ContactUsPage() {
  const { showNotification } = useCivic();
  const { t } = useLanguage();
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    subject: '',
    department: 'General Support',
    message: ''
  });
  const [submitted, setSubmitted] = useState(false);
  const [ticketId, setTicketId] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:8000/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          full_name: formData.fullName,
          email: formData.email,
          phone: formData.phone,
          department: formData.department,
          subject: formData.subject,
          message: formData.message
        })
      });
      if (response.ok) {
        const data = await response.json();
        setTicketId(data.ticket_id || 'TKT-PENDING');
      } else {
        setTicketId('TKT-PENDING');
      }
    } catch (err) {
      console.warn("Backend contact call failed, using fallback:", err);
      setTicketId('TKT-PENDING');
    }
    setSubmitted(true);
    showNotification(t('contact.successMessage'));
  };

  return (
    <div className="flex-grow w-full max-w-container-max mx-auto px-3 sm:px-lg py-4 sm:py-xl flex flex-col gap-md sm:gap-lg">
      {/* Header */}
      <div className="border-b border-outline-variant pb-md">
        <span className="font-label-sm text-xs text-primary-container uppercase tracking-wider font-bold">
          {t('contact.nodalAuthority')}
        </span>
        <h1 className="font-headline-lg text-2xl sm:text-3xl font-bold text-primary mt-1">
          {t('contact.title')} ☏
        </h1>
        <p className="font-body-lg text-xs sm:text-sm text-on-surface-variant mt-1 max-w-2xl leading-relaxed">
          {t('contact.subtitle')}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-md sm:gap-lg">
        {/* Left Column: Official Details (5 cols) */}
        <div className="md:col-span-5 flex flex-col gap-md">
          {/* Department Card */}
          <div className="bg-surface-container-lowest border border-outline-variant p-4 sm:p-lg rounded-lg shadow-ambient">
            <h2 className="font-headline-sm text-sm sm:text-base font-bold text-primary mb-md border-b border-outline-variant pb-sm">
              {t('contact.nodalTitle')}
            </h2>

            <div className="flex items-start gap-md mb-md">
              <span className="material-symbols-outlined text-primary text-2xl mt-0.5 filled-icon">
                corporate_fare
              </span>
              <div>
                <p className="font-label-md text-xs font-bold text-on-surface">{t('contact.nodalAuthority')}</p>
                <p className="font-body-md text-xs text-on-surface-variant mt-0.5">
                  {t('contact.ministryName')}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-md">
              <span className="material-symbols-outlined text-primary text-2xl mt-0.5 filled-icon">
                location_on
              </span>
              <div>
                <p className="font-label-md text-xs font-bold text-on-surface">{t('footer.address')}</p>
                <p className="font-body-md text-xs text-on-surface-variant mt-0.5 leading-relaxed">
                  Kartavya Bhavan 3, Central Secretariat,<br />
                  New Delhi - 110003
                </p>
              </div>
            </div>
          </div>

          {/* Support Channels Card */}
          <div className="bg-surface-container-lowest border border-outline-variant p-4 sm:p-lg rounded-lg shadow-ambient">
            <h2 className="font-headline-sm text-sm sm:text-base font-bold text-primary mb-md border-b border-outline-variant pb-sm">
              {t('contact.helplineTitle')}
            </h2>

            <div className="flex items-center gap-md mb-md">
              <span className="material-symbols-outlined text-primary text-2xl filled-icon shrink-0">
                mail
              </span>
              <div className="min-w-0">
                <p className="font-label-md text-xs font-bold text-on-surface">{t('footer.emailSupport')}</p>
                <p className="font-body-md text-xs text-primary font-semibold break-all">
                  support@kalyansetu.gov.in
                </p>
              </div>
            </div>

            <div className="flex items-center gap-md mb-md">
              <span className="material-symbols-outlined text-primary text-2xl filled-icon shrink-0">
                support_agent
              </span>
              <div>
                <p className="font-label-md text-xs font-bold text-on-surface">{t('contact.tollFree')}</p>
                <p className="font-body-md text-sm text-gov-saffron font-bold">
                  1800-111-555 (24x7)
                </p>
              </div>
            </div>

            <div className="flex items-center gap-md">
              <span className="material-symbols-outlined text-primary text-2xl filled-icon shrink-0">
                emergency
              </span>
              <div>
                <p className="font-label-md text-xs font-bold text-on-surface">{t('footer.supportHelplines')}</p>
                <p className="font-body-md text-xs text-error font-bold">
                  112 (National Emergency Helpline)
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Contact Message Form (7 cols) */}
        <div className="md:col-span-7">
          <div className="bg-surface-container-lowest border border-outline-variant p-4 sm:p-lg md:p-xl rounded-lg shadow-ambient">
            <h2 className="font-headline-sm text-sm sm:text-base font-bold text-primary mb-md border-b border-outline-variant pb-sm">
              {t('contact.sendMessage')}
            </h2>

            {submitted ? (
              <div className="p-4 sm:p-lg bg-gov-green/10 border border-gov-green/30 rounded-lg text-center flex flex-col items-center gap-2">
                <span className="material-symbols-outlined text-4xl text-gov-green">check_circle</span>
                <h3 className="text-sm font-bold text-on-surface">Ticket #{ticketId}</h3>
                <p className="text-xs text-on-surface-variant max-w-md">
                  {t('contact.successMessage')}
                </p>
                <button
                  onClick={() => setSubmitted(false)}
                  className="mt-3 text-xs bg-primary-container text-on-primary px-4 py-2.5 rounded font-bold min-h-[44px] cursor-pointer"
                >
                  {t('common.clear')}
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col gap-md">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-md">
                  <div>
                    <label className="block text-xs font-bold text-on-surface mb-1">{t('contact.fullName')}</label>
                    <input
                      type="text"
                      required
                      value={formData.fullName}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                      placeholder="e.g. Aaditya Sharma"
                      className="w-full px-3 py-2.5 text-xs bg-surface border border-outline-variant rounded focus:border-primary outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-on-surface mb-1">{t('contact.email')}</label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="e.g. citizen@gmail.com"
                      className="w-full px-3 py-2.5 text-xs bg-surface border border-outline-variant rounded focus:border-primary outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-md">
                  <div>
                    <label className="block text-xs font-bold text-on-surface mb-1">{t('contact.phone')}</label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="+91 90*** ****0"
                      className="w-full px-3 py-2.5 text-xs bg-surface border border-outline-variant rounded focus:border-primary outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-on-surface mb-1">{t('contact.department')}</label>
                    <select
                      value={formData.department}
                      onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                      className="w-full px-3 py-2.5 text-xs bg-surface border border-outline-variant rounded focus:border-primary outline-none"
                    >
                      <option>{t('category.Road Infrastructure')}</option>
                      <option>{t('category.Drainage & Water Supply')}</option>
                      <option>{t('category.Electricity & Lighting')}</option>
                      <option>{t('category.Solid Waste & Sanitation')}</option>
                      <option>{t('category.Public Safety')}</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-on-surface mb-1">{t('contact.subject')}</label>
                  <input
                    type="text"
                    required
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    placeholder="Brief summary..."
                    className="w-full px-3 py-2.5 text-xs bg-surface border border-outline-variant rounded focus:border-primary outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-on-surface mb-1">{t('contact.message')}</label>
                  <textarea
                    rows={5}
                    required
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder="Provide relevant details..."
                    className="w-full px-3 py-2.5 text-xs bg-surface border border-outline-variant rounded focus:border-primary outline-none resize-none leading-relaxed"
                  ></textarea>
                </div>

                <button
                  type="submit"
                  className="w-full sm:w-auto bg-primary-container text-on-primary font-bold text-xs px-8 py-3 rounded hover:bg-primary transition-all shadow-md active:scale-95 flex items-center justify-center gap-2 self-start min-h-[44px] cursor-pointer"
                >
                  <span className="material-symbols-outlined text-sm">send</span>
                  <span>{t('contact.sendButton')}</span>
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

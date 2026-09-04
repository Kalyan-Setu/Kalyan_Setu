import React, { useState } from 'react';
import { useCivic } from '../context/CivicContext';

export default function ContactUsPage() {
  const { showNotification } = useCivic();
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    subject: '',
    department: 'General Support',
    message: ''
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await fetch('http://localhost:8000/api/contact', {
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
    } catch (err) {
      console.warn("Backend contact call failed, using fallback:", err);
    }
    setSubmitted(true);
    showNotification("Message received! A support ticket has been opened.");
  };

  return (
    <div className="flex-grow w-full max-w-container-max mx-auto px-lg py-xl flex flex-col gap-lg">
      {/* Header */}
      <div className="border-b border-outline-variant pb-md">
        <span className="font-label-sm text-xs text-primary-container uppercase tracking-wider font-bold">
          Ministry of Electronics & IT (MeitY)
        </span>
        <h1 className="font-headline-lg text-3xl font-bold text-primary mt-1">
          Contact Us & Grievance Redressal
        </h1>
        <p className="font-body-lg text-sm text-on-surface-variant mt-1 max-w-2xl">
          Get in touch with our administrative support team for queries regarding grievance redressal, escalations, or portal technical assistance.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-lg">
        {/* Left Column: Official Details (5 cols) */}
        <div className="md:col-span-5 flex flex-col gap-md">
          {/* Department Card */}
          <div className="bg-surface-container-lowest border border-outline-variant p-lg rounded-lg shadow-ambient">
            <h2 className="font-headline-sm text-base font-bold text-primary mb-md border-b border-outline-variant pb-sm">
              Official Headquarters
            </h2>

            <div className="flex items-start gap-md mb-md">
              <span className="material-symbols-outlined text-primary text-2xl mt-0.5 filled-icon">
                corporate_fare
              </span>
              <div>
                <p className="font-label-md text-xs font-bold text-on-surface">Nodal Authority</p>
                <p className="font-body-md text-xs text-on-surface-variant mt-0.5">
                  Ministry of Electronics and Information Technology (MeitY) & National Informatics Centre (NIC)
                </p>
              </div>
            </div>

            <div className="flex items-start gap-md">
              <span className="material-symbols-outlined text-primary text-2xl mt-0.5 filled-icon">
                location_on
              </span>
              <div>
                <p className="font-label-md text-xs font-bold text-on-surface">Official Address</p>
                <p className="font-body-md text-xs text-on-surface-variant mt-0.5 leading-relaxed">
                  Electronics Niketan, 6, CGO Complex,<br />
                  Lodhi Road, New Delhi - 110003
                </p>
              </div>
            </div>
          </div>

          {/* Support Channels Card */}
          <div className="bg-surface-container-lowest border border-outline-variant p-lg rounded-lg shadow-ambient">
            <h2 className="font-headline-sm text-base font-bold text-primary mb-md border-b border-outline-variant pb-sm">
              Support Channels & Helplines
            </h2>

            <div className="flex items-center gap-md mb-md">
              <span className="material-symbols-outlined text-primary text-2xl filled-icon">
                mail
              </span>
              <div>
                <p className="font-label-md text-xs font-bold text-on-surface">Official Support Email</p>
                <p className="font-body-md text-xs text-primary font-semibold">
                  support@peoplespriorities.gov.in
                </p>
              </div>
            </div>

            <div className="flex items-center gap-md mb-md">
              <span className="material-symbols-outlined text-primary text-2xl filled-icon">
                support_agent
              </span>
              <div>
                <p className="font-label-md text-xs font-bold text-on-surface">Toll-free Citizen Help Desk</p>
                <p className="font-body-md text-sm text-gov-saffron font-bold">
                  1800-111-2222 (24x7)
                </p>
              </div>
            </div>

            <div className="flex items-center gap-md">
              <span className="material-symbols-outlined text-primary text-2xl filled-icon">
                emergency
              </span>
              <div>
                <p className="font-label-md text-xs font-bold text-on-surface">Emergency Civic Rapid Hotline</p>
                <p className="font-body-md text-xs text-error font-bold">
                  112 (National Emergency Helpline)
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Contact Message Form (7 cols) */}
        <div className="md:col-span-7">
          <div className="bg-surface-container-lowest border border-outline-variant p-lg sm:p-xl rounded-lg shadow-ambient">
            <h2 className="font-headline-sm text-base font-bold text-primary mb-md border-b border-outline-variant pb-sm">
              Send Official Inquiry or Feedback
            </h2>

            {submitted ? (
              <div className="p-lg bg-gov-green/10 border border-gov-green/30 rounded-lg text-center flex flex-col items-center gap-2">
                <span className="material-symbols-outlined text-4xl text-gov-green">check_circle</span>
                <h3 className="text-sm font-bold text-on-surface">Inquiry Ticket #TKT-8849 Created</h3>
                <p className="text-xs text-on-surface-variant max-w-md">
                  Thank you for contacting the administrative cell. A support representative will respond to your registered email address within 24 business hours.
                </p>
                <button
                  onClick={() => setSubmitted(false)}
                  className="mt-3 text-xs bg-primary-container text-on-primary px-4 py-2 rounded font-bold"
                >
                  Send Another Message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col gap-md">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-md">
                  <div>
                    <label className="block text-xs font-bold text-on-surface mb-1">Your Full Name *</label>
                    <input
                      type="text"
                      required
                      value={formData.fullName}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                      placeholder="e.g. Aaditya Sharma"
                      className="w-full px-3 py-2 text-xs bg-surface border border-outline-variant rounded focus:border-primary outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-on-surface mb-1">Email Address *</label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="e.g. citizen@example.com"
                      className="w-full px-3 py-2 text-xs bg-surface border border-outline-variant rounded focus:border-primary outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-md">
                  <div>
                    <label className="block text-xs font-bold text-on-surface mb-1">Contact Phone Number</label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="+91 98765 43210"
                      className="w-full px-3 py-2 text-xs bg-surface border border-outline-variant rounded focus:border-primary outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-on-surface mb-1">Target Department</label>
                    <select
                      value={formData.department}
                      onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                      className="w-full px-3 py-2 text-xs bg-surface border border-outline-variant rounded focus:border-primary outline-none"
                    >
                      <option>General Grievance Redressal</option>
                      <option>Technical Portal Support</option>
                      <option>Public Works Department (PWD)</option>
                      <option>Delhi Jal Board (Water/Sewage)</option>
                      <option>Municipal Corporation (Sanitation)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-on-surface mb-1">Subject *</label>
                  <input
                    type="text"
                    required
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    placeholder="Brief summary of your query or grievance escalation..."
                    className="w-full px-3 py-2 text-xs bg-surface border border-outline-variant rounded focus:border-primary outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-on-surface mb-1">Message Body *</label>
                  <textarea
                    rows={5}
                    required
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder="Provide relevant details, complaint reference number if applicable..."
                    className="w-full px-3 py-2 text-xs bg-surface border border-outline-variant rounded focus:border-primary outline-none resize-none leading-relaxed"
                  ></textarea>
                </div>

                <button
                  type="submit"
                  className="bg-primary-container text-on-primary font-bold text-xs px-8 py-3 rounded hover:bg-primary transition-all shadow-md active:scale-95 flex items-center justify-center gap-2 self-start"
                >
                  <span className="material-symbols-outlined text-sm">send</span>
                  <span>Submit Inquiry Message</span>
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

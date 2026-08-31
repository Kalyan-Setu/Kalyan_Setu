import React, { useState } from 'react';
import { useCivic } from '../context/CivicContext';
import kalyanSetuLogo from '../assets/kalyan-setu-logo.png';

export default function AuthModal() {
  const { 
    authModalOpen, 
    setAuthModalOpen, 
    authInitialType, 
    authInitialTab, 
    setUserRole, 
    showNotification,
    navigateTo 
  } = useCivic();

  const [userType, setUserType] = useState(authInitialType || 'citizen'); // 'citizen' or 'official'
  const [authTab, setAuthTab] = useState(authInitialTab || 'login'); // 'login' or 'register'
  
  const [formData, setFormData] = useState({
    identifier: '',
    password: '',
    otp: '',
    fullName: '',
    phone: '',
    district: 'Central Delhi',
    officialDepartment: 'PWD'
  });

  const [otpSent, setOtpSent] = useState(false);

  if (!authModalOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (userType === 'citizen') {
      setUserRole('citizen');
      showNotification(authTab === 'login' ? 'Citizen login successful! Welcome back.' : 'Citizen registration completed.');
      setAuthModalOpen(false);
      navigateTo('citizen_dashboard');
    } else {
      setUserRole('official');
      showNotification('Official Authentication Verified via Parichay SSO.');
      setAuthModalOpen(false);
      navigateTo('admin_overview');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-primary/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-surface-container-lowest rounded-xl shadow-2xl border border-outline-variant w-full max-w-4xl overflow-hidden flex flex-col md:flex-row relative max-h-[90vh]">
        {/* Close Button */}
        <button
          onClick={() => setAuthModalOpen(false)}
          className="absolute top-3 right-3 z-20 text-on-surface-variant hover:text-primary bg-surface/80 p-1.5 rounded-full hover:bg-surface-container transition-colors"
          aria-label="Close dialog"
        >
          <span className="material-symbols-outlined text-[20px]">close</span>
        </button>

        {/* Left Side: National Portal Artwork */}
        <div className="hidden md:flex md:w-1/2 relative flex-col justify-between p-lg text-white bg-primary-container overflow-hidden">
          <img
            src="https://lh3.googleusercontent.com/aida/AEtjO1XHXHzqVGrN9TM-8pEtdS-HrS4yb8c48tnxmTuLPPssX0uFy2upHAfGsZ9iHeT2JHfdljbhqE_QU6cCCX5iFQIBzvG84RIJ_raLI_3GhIcxY3smMuGLbRtrHGf4-SO1anRCFc8rcJQhjGPZ6f2Bij_26VWwXuXLnrWE3c4gkzCD8pdn9FPvDMc6xHF5nx8y3fEJgbgjSRMMhJup6FyPDHkNNK3kodGYlCxuNEUk50R0qg62qz_loUL8V1A"
            alt="National Portal"
            className="absolute inset-0 w-full h-full object-cover opacity-35"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-primary-container via-primary-container/80 to-transparent"></div>

          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-2">
              <img
                src={kalyanSetuLogo}
                alt="Kalyan Setu Logo"
                className="h-14 w-auto object-contain brightness-0 invert"
              />
            </div>
            <p className="text-xs text-primary-fixed-dim leading-relaxed mt-2">
              Empowering 1.4 Billion Citizens with Transparent, Time-Bound Civic Action.
            </p>
          </div>

          <div className="relative z-10 bg-white/10 backdrop-blur-md p-md rounded-lg border border-white/15">
            <div className="flex items-center gap-2 text-xs font-bold text-gov-saffron mb-1">
              <span className="material-symbols-outlined text-sm">verified_user</span>
              <span>National Unified SSO Portal</span>
            </div>
            <p className="text-[11px] text-white/90">
              Integrated with DigiLocker, MeriPehchaan & Parichay Single Sign-On for seamless authentication.
            </p>
          </div>
        </div>

        {/* Right Side: Auth Form */}
        <div className="w-full md:w-1/2 p-lg sm:p-xl overflow-y-auto bg-surface flex flex-col justify-center">
          <div className="max-w-md mx-auto w-full">
            {/* User Type Switcher (Citizen vs Official) */}
            <div className="relative grid grid-cols-2 gap-1 p-1 bg-surface-container rounded-md mb-md border border-outline-variant/60">
              <button
                type="button"
                onClick={() => setUserType('citizen')}
                className={`py-2 px-3 rounded font-label-md text-xs font-bold transition-all ${
                  userType === 'citizen'
                    ? 'bg-primary-container text-white shadow-sm'
                    : 'text-on-surface-variant hover:text-primary'
                }`}
              >
                Citizen Portal
              </button>
              <button
                type="button"
                onClick={() => setUserType('official')}
                className={`py-2 px-3 rounded font-label-md text-xs font-bold transition-all ${
                  userType === 'official'
                    ? 'bg-primary-container text-white shadow-sm'
                    : 'text-on-surface-variant hover:text-primary'
                }`}
              >
                Government Official
              </button>
            </div>

            {/* Login / Register Tabs */}
            <div className="flex border-b border-outline-variant mb-md">
              <button
                type="button"
                onClick={() => setAuthTab('login')}
                className={`flex-1 pb-2 font-label-md text-sm transition-colors text-center ${
                  authTab === 'login'
                    ? 'text-primary font-bold border-b-2 border-primary'
                    : 'text-on-surface-variant hover:text-primary'
                }`}
              >
                Sign In
              </button>
              {userType === 'citizen' && (
                <button
                  type="button"
                  onClick={() => setAuthTab('register')}
                  className={`flex-1 pb-2 font-label-md text-sm transition-colors text-center ${
                    authTab === 'register'
                      ? 'text-primary font-bold border-b-2 border-primary'
                      : 'text-on-surface-variant hover:text-primary'
                  }`}
                >
                  New Registration
                </button>
              )}
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="flex flex-col gap-md">
              {userType === 'citizen' ? (
                <>
                  {authTab === 'login' ? (
                    <>
                      <div>
                        <label className="block text-xs font-bold text-on-surface mb-1">
                          Mobile Number or Aadhaar
                        </label>
                        <div className="relative">
                          <span className="material-symbols-outlined absolute left-3 top-2.5 text-on-surface-variant text-lg">
                            phone_iphone
                          </span>
                          <input
                            type="text"
                            required
                            value={formData.identifier}
                            onChange={(e) => setFormData({ ...formData, identifier: e.target.value })}
                            placeholder="Enter 10-digit mobile number"
                            className="w-full pl-10 pr-3 py-2 text-sm bg-white border border-outline-variant rounded focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                          />
                        </div>
                      </div>

                      {otpSent ? (
                        <div>
                          <label className="block text-xs font-bold text-on-surface mb-1">
                            Enter 6-Digit OTP
                          </label>
                          <input
                            type="text"
                            maxLength={6}
                            placeholder="• • • • • •"
                            className="w-full text-center tracking-widest text-lg font-bold py-2 bg-white border border-outline-variant rounded focus:border-primary outline-none"
                            required
                          />
                          <p className="text-[11px] text-gov-green mt-1 flex items-center gap-1">
                            <span className="material-symbols-outlined text-[14px]">check_circle</span>
                            OTP sent to +91 ******4321
                          </p>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setOtpSent(true)}
                          className="text-xs text-primary font-bold hover:underline self-start flex items-center gap-1"
                        >
                          <span className="material-symbols-outlined text-sm">send_to_mobile</span>
                          Request OTP on Phone
                        </button>
                      )}
                    </>
                  ) : (
                    <>
                      <div>
                        <label className="block text-xs font-bold text-on-surface mb-1">
                          Full Name (as per ID)
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Aaditya Sharma"
                          className="w-full px-3 py-2 text-sm bg-white border border-outline-variant rounded focus:border-primary outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-on-surface mb-1">
                          Mobile Number
                        </label>
                        <input
                          type="tel"
                          required
                          placeholder="10-digit phone number"
                          className="w-full px-3 py-2 text-sm bg-white border border-outline-variant rounded focus:border-primary outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-on-surface mb-1">
                          District / City
                        </label>
                        <select className="w-full px-3 py-2 text-sm bg-white border border-outline-variant rounded focus:border-primary outline-none">
                          <option>Central Delhi</option>
                          <option>South Delhi</option>
                          <option>North Delhi</option>
                          <option>East Delhi</option>
                          <option>West Delhi</option>
                        </select>
                      </div>
                    </>
                  )}
                </>
              ) : (
                /* Official Login Form */
                <>
                  <div>
                    <label className="block text-xs font-bold text-on-surface mb-1">
                      Official Gov Email / Employee ID
                    </label>
                    <div className="relative">
                      <span className="material-symbols-outlined absolute left-3 top-2.5 text-on-surface-variant text-lg">
                        badge
                      </span>
                      <input
                        type="text"
                        required
                        defaultValue="rajesh.kumar@pwd.delhi.gov.in"
                        className="w-full pl-10 pr-3 py-2 text-sm bg-white border border-outline-variant rounded focus:border-primary outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-on-surface mb-1">
                      Parichay SSO PIN / Password
                    </label>
                    <div className="relative">
                      <span className="material-symbols-outlined absolute left-3 top-2.5 text-on-surface-variant text-lg">
                        lock
                      </span>
                      <input
                        type="password"
                        required
                        defaultValue="••••••••••••"
                        className="w-full pl-10 pr-3 py-2 text-sm bg-white border border-outline-variant rounded focus:border-primary outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-on-surface mb-1">
                      Department Jurisdiction
                    </label>
                    <select className="w-full px-3 py-2 text-sm bg-white border border-outline-variant rounded focus:border-primary outline-none">
                      <option>Public Works Department (PWD)</option>
                      <option>Delhi Jal Board (Water & Sewage)</option>
                      <option>Municipal Corporation of Delhi (MCD)</option>
                      <option>DISCOM / Power Distribution Wing</option>
                    </select>
                  </div>
                </>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                className="w-full py-2.5 px-4 bg-primary-container text-on-primary rounded font-label-md text-sm font-bold shimmer-btn shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 mt-2"
              >
                <span className="material-symbols-outlined text-sm">lock_open</span>
                <span>
                  {userType === 'official'
                    ? 'Authenticate with Parichay SSO'
                    : authTab === 'login'
                    ? 'Verify & Sign In'
                    : 'Create Citizen Account'}
                </span>
              </button>
            </form>

            <div className="mt-md text-center">
              <p className="text-[11px] text-on-surface-variant">
                By accessing this portal, you agree to the{' '}
                <a href="#" className="text-primary underline">
                  Terms of Service
                </a>{' '}
                and Privacy Safeguards.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

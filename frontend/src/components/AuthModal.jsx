import React, { useState, useEffect } from 'react';
import { useCivic, API_BASE } from '../context/CivicContext';
import kalyanSetuLogo from '../assets/kalyan-setu-logo.png';
import parliamentBackground from '../assets/parliament-bg.jpg';

export default function AuthModal() {
  const { 
    authModalOpen, 
    setAuthModalOpen, 
    authInitialType, 
    authInitialTab, 
    setUserRole, 
    setCurrentUser,
    setAuthToken,
    setActiveTab,
    showNotification,
    navigateTo 
  } = useCivic();

  const [userType, setUserType] = useState(authInitialType || 'citizen');
  const [authTab, setAuthTab] = useState(authInitialTab || 'login');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showOfficialPassword, setShowOfficialPassword] = useState(false);

  const EMPTY_FORM = {
    identifier: '',
    password: '',
    fullName: '',
    phone: '',
    email: '',
    state: 'Delhi NCR',
    district: '',
    officialEmail: '',
    officialPassword: '',
    officialDepartment: ''
  };

  const [formData, setFormData] = useState(EMPTY_FORM);

  // Reset all fields, errors and password visibility to blank slate
  const resetForm = () => {
    setFormData(EMPTY_FORM);
    setErrorMessage('');
    setShowPassword(false);
    setShowOfficialPassword(false);
  };

  // Reset form whenever modal opens or tab/type changes externally
  useEffect(() => {
    if (authModalOpen) {
      setUserType(authInitialType || 'citizen');
      setAuthTab(authInitialTab || 'login');
      resetForm();
    }
  }, [authModalOpen, authInitialType, authInitialTab]);

  if (!authModalOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage('');

    try {
      if (userType === 'citizen') {
        if (authTab === 'login') {
          const res = await fetch(`${API_BASE}/auth/citizen/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              identifier: (formData.identifier || formData.phone || '').trim(),
              password: formData.password
            })
          });

          if (!res.ok) {
            const err = await res.json().catch(() => ({}));
            let msg = 'Login failed. Please check your credentials.';
            if (typeof err.detail === 'string') {
              msg = err.detail;
            } else if (Array.isArray(err.detail) && err.detail.length > 0) {
              msg = err.detail[0].msg ? err.detail[0].msg.replace('Value error, ', '') : 'Invalid credentials.';
            }
            setErrorMessage(msg);
            return;
          }

          const data = await res.json();
          setAuthToken(data.access_token);
          setCurrentUser(data.user);
          setUserRole('citizen');
          showNotification(`Welcome back, ${data.user.full_name || 'Citizen'}!`);
          setAuthModalOpen(false);
          setActiveTab('citizen_dashboard'); // direct — avoids stale-closure auth guard
          window.scrollTo({ top: 0, behavior: 'smooth' });
          return;
        } else {
          // Citizen Registration Client-Side Validations
          const phoneClean = (formData.phone || '').trim().replace(/\D/g, '');
          if (phoneClean.length !== 10) {
            setErrorMessage('Mobile number must be exactly 10 digits.');
            return;
          }

          const emailClean = (formData.email || '').trim().toLowerCase();
          const gmailRegex = /^[a-zA-Z0-9._%+-]+@gmail\.com$/i;
          if (!emailClean) {
            setErrorMessage('Email address is required.');
            return;
          }
          if (!gmailRegex.test(emailClean)) {
            setErrorMessage('Email must be a valid @gmail.com address (e.g. yourname@gmail.com). Random text is not allowed.');
            return;
          }

          const res = await fetch(`${API_BASE}/auth/citizen/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              full_name: (formData.fullName || '').trim() || "Citizen User",
              phone: phoneClean,
              email: emailClean,
              password: formData.password,
              state: formData.state || "Delhi NCR",
              district: formData.district || "Central Delhi"
            })
          });

          if (!res.ok) {
            const err = await res.json().catch(() => ({}));
            let msg = 'Registration failed. Please check your details.';
            if (typeof err.detail === 'string') {
              msg = err.detail;
            } else if (Array.isArray(err.detail) && err.detail.length > 0) {
              msg = err.detail[0].msg ? err.detail[0].msg.replace('Value error, ', '') : 'Invalid registration details.';
            }
            setErrorMessage(msg);
            return;
          }

          const data = await res.json();
          setAuthToken(data.access_token);
          setCurrentUser(data.user);
          setUserRole('citizen');
          showNotification('Citizen registration completed successfully.');
          setAuthModalOpen(false);
          setActiveTab('citizen_dashboard'); // direct — avoids stale-closure auth guard
          window.scrollTo({ top: 0, behavior: 'smooth' });
          return;
        }
      } else {
        // Official Login
        const res = await fetch(`${API_BASE}/auth/official/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: formData.officialEmail,
            password: formData.officialPassword
          })
        });

        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          let msg = 'Official authentication failed.';
          if (typeof err.detail === 'string') {
            msg = err.detail;
          }
          setErrorMessage(msg);
          return;
        }

        const data = await res.json();
        setAuthToken(data.access_token);
        setCurrentUser(data.user);
        setUserRole('official');
        showNotification('Official Authentication Verified.');
        setAuthModalOpen(false);
        setActiveTab('admin_overview'); // direct — avoids stale-closure auth guard
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }
    } catch (err) {
      console.error("API Auth Exception:", err);
      setErrorMessage(err.message || 'Unable to connect to the authentication service.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-primary/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-surface-container-lowest rounded-xl shadow-2xl border border-outline-variant w-full max-w-4xl overflow-hidden flex flex-col md:flex-row relative max-h-[90vh]">
        {/* Close Button */}
        <button
          onClick={() => { resetForm(); setAuthModalOpen(false); }}
          className="absolute top-3 right-3 z-20 text-on-surface-variant hover:text-primary bg-surface/80 p-1.5 rounded-full hover:bg-surface-container transition-colors"
          aria-label="Close dialog"
        >
          <span className="material-symbols-outlined text-[20px]">close</span>
        </button>

        {/* Left Side: National Portal Artwork */}
        <div className="hidden md:flex md:w-1/2 relative flex-col justify-between p-lg text-white bg-primary-container overflow-hidden">
          <img
            src={parliamentBackground}
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
          </div>
        </div>

        {/* Right Side: Auth Form */}
        <div className="w-full md:w-1/2 p-lg sm:p-xl overflow-y-auto bg-surface flex flex-col justify-center">
          <div className="max-w-md mx-auto w-full">
            {/* User Type Switcher (Citizen vs Official) */}
            <div className="relative grid grid-cols-2 gap-1 p-1 bg-surface-container rounded-md mb-md border border-outline-variant/60">
              <button
                type="button"
                onClick={() => { resetForm(); setUserType('citizen'); setAuthTab('login'); }}
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
                onClick={() => { resetForm(); setUserType('official'); }}
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
                onClick={() => { resetForm(); setAuthTab('login'); }}
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
                  onClick={() => { resetForm(); setAuthTab('register'); }}
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

            {errorMessage && (
              <div className="mb-3 p-2 text-xs bg-error/10 border border-error/30 text-error rounded font-medium">
                {errorMessage}
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="flex flex-col gap-md">
              {userType === 'citizen' ? (
                <>
                  {authTab === 'login' ? (
                    <>
                      <div>
                        <label className="block text-xs font-bold text-on-surface mb-1">
                          Mobile Number or Email
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
                            placeholder="10-digit mobile or email"
                            className="w-full pl-10 pr-3 py-2 text-sm bg-white border border-outline-variant rounded focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-on-surface mb-1">
                          Password
                        </label>
                        <div className="relative">
                          <input
                            type={showPassword ? 'text' : 'password'}
                            required
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            placeholder="Enter your password"
                            className="w-full pl-3 pr-10 py-2 text-sm bg-white border border-outline-variant rounded focus:border-primary outline-none"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(p => !p)}
                            className="absolute right-3 top-2.5 text-on-surface-variant hover:text-primary transition-colors"
                            aria-label={showPassword ? 'Hide password' : 'Show password'}
                          >
                            <span className="material-symbols-outlined text-lg">
                              {showPassword ? 'visibility_off' : 'visibility'}
                            </span>
                          </button>
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
                      <div>
                        <label className="block text-xs font-bold text-on-surface mb-1">
                          Full Name (as per ID) *
                        </label>
                        <input
                          type="text"
                          required
                          value={formData.fullName}
                          onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                          placeholder="e.g. Aaditya Sharma"
                          className="w-full px-3 py-2 text-sm bg-white border border-outline-variant rounded focus:border-primary outline-none"
                        />
                      </div>
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="block text-xs font-bold text-on-surface">
                            Mobile Number *
                          </label>
                          <span className={`text-[10px] font-mono font-medium ${
                            formData.phone.length === 10 ? 'text-gov-green font-bold' :
                            formData.phone.length > 0 ? 'text-error' : 'text-on-surface-variant'
                          }`}>
                            {formData.phone.length}/10 digits
                          </span>
                        </div>
                        <div className="relative">
                          <span className={`material-symbols-outlined absolute left-3 top-2.5 text-lg ${
                            formData.phone.length === 10 ? 'text-gov-green' :
                            formData.phone.length > 0 ? 'text-error' : 'text-on-surface-variant'
                          }`}>
                            phone_iphone
                          </span>
                          <input
                            type="tel"
                            required
                            maxLength={10}
                            inputMode="numeric"
                            pattern="[0-9]{10}"
                            value={formData.phone}
                            onKeyDown={(e) => {
                              // Block any non-numeric key except control keys
                              const allowed = ['Backspace','Delete','ArrowLeft','ArrowRight','Tab','Enter'];
                              if (!allowed.includes(e.key) && !/^[0-9]$/.test(e.key)) {
                                e.preventDefault();
                              }
                            }}
                            onPaste={(e) => {
                              e.preventDefault();
                              const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 10);
                              setFormData({ ...formData, phone: pasted });
                            }}
                            onChange={(e) => {
                              const digits = e.target.value.replace(/\D/g, '').slice(0, 10);
                              setFormData({ ...formData, phone: digits });
                            }}
                            onInvalid={(e) => {
                              e.target.setCustomValidity(
                                formData.phone.length === 0
                                  ? 'Please enter your 10-digit mobile number.'
                                  : `Mobile number must be exactly 10 digits. You entered ${formData.phone.length} digit(s).`
                              );
                            }}
                            onInput={(e) => e.target.setCustomValidity('')}
                            placeholder="Enter 10-digit mobile number"
                            className={`w-full pl-10 pr-10 py-2 text-sm bg-white border rounded focus:ring-1 outline-none transition-colors ${
                              formData.phone.length === 10
                                ? 'border-gov-green focus:border-gov-green focus:ring-gov-green'
                                : formData.phone.length > 0
                                ? 'border-error focus:border-error focus:ring-error'
                                : 'border-outline-variant focus:border-primary focus:ring-primary'
                            }`}
                          />
                          {formData.phone.length === 10 && (
                            <span className="material-symbols-outlined absolute right-3 top-2.5 text-gov-green text-lg">check_circle</span>
                          )}
                          {formData.phone.length > 0 && formData.phone.length < 10 && (
                            <span className="material-symbols-outlined absolute right-3 top-2.5 text-error text-lg">error</span>
                          )}
                        </div>
                        {formData.phone.length > 0 && formData.phone.length < 10 ? (
                          <p className="text-[10px] text-error mt-1 font-medium">
                            ⚠ Mobile number must be exactly 10 digits ({formData.phone.length}/10 entered).
                          </p>
                        ) : (
                          <p className="text-[10px] text-on-surface-variant mt-1">
                            Only digits allowed · Must be exactly 10 digits (e.g. 9876543210).
                          </p>
                        )}
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-on-surface mb-1">
                          Email Address (@gmail.com) *
                        </label>
                        <div className="relative">
                          <span className={`material-symbols-outlined absolute left-3 top-2.5 text-lg ${
                            formData.email.length > 0 && /^[a-zA-Z0-9._%+-]+@gmail\.com$/i.test(formData.email)
                              ? 'text-gov-green'
                              : formData.email.length > 0
                              ? 'text-error'
                              : 'text-on-surface-variant'
                          }`}>
                            mail
                          </span>
                          <input
                            type="text"
                            required
                            value={formData.email}
                            onChange={(e) => {
                              const val = e.target.value.trim();
                              setFormData({ ...formData, email: val });
                            }}
                            onBlur={(e) => {
                              const val = e.target.value.trim();
                              const gmailRegex = /^[a-zA-Z0-9._%+-]+@gmail\.com$/i;
                              if (val && !gmailRegex.test(val)) {
                                e.target.setCustomValidity('Please enter a valid @gmail.com address (e.g. yourname@gmail.com). Other email providers are not accepted.');
                              } else {
                                e.target.setCustomValidity('');
                              }
                            }}
                            onInput={(e) => e.target.setCustomValidity('')}
                            placeholder="e.g. yourname@gmail.com"
                            className={`w-full pl-10 pr-10 py-2 text-sm bg-white border rounded focus:ring-1 outline-none transition-colors ${
                              formData.email.length > 0 && /^[a-zA-Z0-9._%+-]+@gmail\.com$/i.test(formData.email)
                                ? 'border-gov-green focus:border-gov-green focus:ring-gov-green'
                                : formData.email.length > 0
                                ? 'border-error focus:border-error focus:ring-error'
                                : 'border-outline-variant focus:border-primary focus:ring-primary'
                            }`}
                          />
                          {formData.email.length > 0 && /^[a-zA-Z0-9._%+-]+@gmail\.com$/i.test(formData.email) && (
                            <span className="material-symbols-outlined absolute right-3 top-2.5 text-gov-green text-lg">check_circle</span>
                          )}
                          {formData.email.length > 0 && !/^[a-zA-Z0-9._%+-]+@gmail\.com$/i.test(formData.email) && (
                            <span className="material-symbols-outlined absolute right-3 top-2.5 text-error text-lg">error</span>
                          )}
                        </div>
                        {formData.email.length > 0 && !/^[a-zA-Z0-9._%+-]+@gmail\.com$/i.test(formData.email) ? (
                          <p className="text-[10px] text-error mt-1 font-medium">
                            ⚠ Only <span className="font-bold">@gmail.com</span> addresses are accepted. Random text or other providers (e.g. @yahoo.com, @outlook.com) are not allowed.
                          </p>
                        ) : (
                          <p className="text-[10px] text-on-surface-variant mt-1">
                            Only verified <span className="font-semibold text-primary">@gmail.com</span> addresses are accepted.
                          </p>
                        )}
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-on-surface mb-1">
                          District / City *
                        </label>
                        <input
                          type="text"
                          required
                          value={formData.district}
                          onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                          placeholder="Enter your district name"
                          className="w-full px-3 py-2 text-sm bg-white border border-outline-variant rounded focus:border-primary outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-on-surface mb-1">
                          Create Password *
                        </label>
                        <div className="relative">
                          <input
                            type={showPassword ? 'text' : 'password'}
                            required
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            placeholder="Enter a strong password"
                            className="w-full pl-3 pr-10 py-2 text-sm bg-white border border-outline-variant rounded focus:border-primary outline-none"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(p => !p)}
                            className="absolute right-3 top-2.5 text-on-surface-variant hover:text-primary transition-colors"
                            aria-label={showPassword ? 'Hide password' : 'Show password'}
                          >
                            <span className="material-symbols-outlined text-lg">
                              {showPassword ? 'visibility_off' : 'visibility'}
                            </span>
                          </button>
                        </div>
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
                        type="email"
                        required
                        value={formData.officialEmail}
                        onChange={(e) => setFormData({ ...formData, officialEmail: e.target.value })}
                        placeholder="e.g. officer@dept.gov.in"
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
                        type={showOfficialPassword ? 'text' : 'password'}
                        required
                        value={formData.officialPassword}
                        onChange={(e) => setFormData({ ...formData, officialPassword: e.target.value })}
                        placeholder="Enter your SSO password"
                        className="w-full pl-10 pr-10 py-2 text-sm bg-white border border-outline-variant rounded focus:border-primary outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => setShowOfficialPassword(p => !p)}
                        className="absolute right-3 top-2.5 text-on-surface-variant hover:text-primary transition-colors"
                        aria-label={showOfficialPassword ? 'Hide password' : 'Show password'}
                      >
                        <span className="material-symbols-outlined text-lg">
                          {showOfficialPassword ? 'visibility_off' : 'visibility'}
                        </span>
                      </button>
                    </div>
                  </div>

                </>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 px-4 bg-primary-container text-on-primary rounded font-label-md text-sm font-bold shimmer-btn shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 mt-2 disabled:opacity-50"
              >
                <span className="material-symbols-outlined text-sm">{loading ? 'sync' : 'lock_open'}</span>
                <span>
                  {loading ? 'Authenticating...' : userType === 'official'
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

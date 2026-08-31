import React, { useState, useEffect, useRef } from 'react';
import { useCivic } from '../context/CivicContext';

export default function SubmitProblemPage() {
  const { addComplaint, navigateTo, currentUser } = useCivic();

  const [currentStep, setCurrentStep] = useState(1); // 1: Classification/Method, 2: Details, 3: Review
  const [evidenceMethod, setEvidenceMethod] = useState('text'); // 'photo', 'text', 'voice'

  // Form Fields
  const [category, setCategory] = useState('Road Infrastructure');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [district, setDistrict] = useState('South District');
  const [priority, setPriority] = useState('High');
  const [photoPreview, setPhotoPreview] = useState(null);

  // Voice recording state
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [recordedAudio, setRecordedAudio] = useState(false);
  const [voiceTranscript, setVoiceTranscript] = useState('');
  const timerRef = useRef(null);

  // Voice timer effect
  useEffect(() => {
    if (isRecording) {
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [isRecording]);

  const toggleRecording = () => {
    if (!isRecording) {
      setIsRecording(true);
      setRecordedAudio(false);
      setRecordingTime(0);
      setVoiceTranscript('');
    } else {
      setIsRecording(false);
      setRecordedAudio(true);
      // Generate simulated transcript
      const sampleTranscript = `Reporting a critical ${category.toLowerCase()} issue at ${location || 'local ward'}. Urgent intervention requested as this is causing significant public inconvenience.`;
      setVoiceTranscript(sampleTranscript);
      if (!description) {
        setDescription(sampleTranscript);
      }
      if (!title) {
        setTitle(`Voice Report: ${category} issue in ${district}`);
      }
    }
  };

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setPhotoPreview(url);
    }
  };

  const handleUseLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        () => {
          setLocation("Main Ring Road, Near AIIMS Flyover, Sector 3");
        },
        () => {
          setLocation("Central Market Road, Sector 4, New Delhi");
        }
      );
    } else {
      setLocation("Central Market Road, Sector 4, New Delhi");
    }
  };

  const handleFinalSubmit = (e) => {
    e.preventDefault();
    const created = addComplaint({
      title: title || `${category} issue in ${district}`,
      description: description || voiceTranscript || "Civic issue submitted by citizen.",
      category,
      location: location || "Delhi Urban District",
      district,
      priority,
      evidenceType: evidenceMethod,
      imageUrl: photoPreview || (evidenceMethod === 'photo' ? "https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=600&auto=format&fit=crop&q=80" : ""),
      audioLength: recordedAudio ? `0:${recordingTime < 10 ? '0' + recordingTime : recordingTime}` : "",
      voiceTranscript
    });

    navigateTo('track', created.id);
  };

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m < 10 ? '0' + m : m}:${s < 10 ? '0' + s : s}`;
  };

  return (
    <div className="flex-grow w-full max-w-container-max mx-auto px-lg py-xl flex flex-col gap-xl">
      {/* Header & Stepper */}
      <section className="flex flex-col gap-md items-center text-center max-w-3xl mx-auto w-full">
        <span className="font-label-sm text-xs text-primary-container uppercase tracking-wider font-bold">
          Step-by-Step Grievance Registration
        </span>
        <h1 className="font-display-lg text-3xl sm:text-4xl font-bold text-primary">
          Submit a New Problem
        </h1>
        <p className="font-body-lg text-sm text-on-surface-variant max-w-2xl">
          Please provide details of the civic issue. Your submission helps maintain and improve our urban infrastructure.
        </p>

        {/* Stepper */}
        <div className="w-full mt-md flex items-center justify-between relative max-w-xl">
          <div className="absolute left-[15%] right-[15%] top-1/2 -translate-y-1/2 h-1 bg-outline-variant -z-0">
            <div
              className="h-full bg-primary-container transition-all duration-300"
              style={{ width: currentStep === 1 ? '0%' : currentStep === 2 ? '50%' : '100%' }}
            ></div>
          </div>

          {/* Step 1 */}
          <div className="flex flex-col items-center gap-1 relative z-10">
            <button
              onClick={() => setCurrentStep(1)}
              className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition-all ${
                currentStep >= 1 ? 'bg-primary-container text-on-primary' : 'bg-surface-variant text-outline'
              }`}
            >
              {currentStep > 1 ? <span className="material-symbols-outlined text-sm">check</span> : '1'}
            </button>
            <span className="font-label-sm text-xs font-bold text-primary">1. Method</span>
          </div>

          {/* Step 2 */}
          <div className="flex flex-col items-center gap-1 relative z-10">
            <button
              onClick={() => setCurrentStep(2)}
              className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition-all ${
                currentStep >= 2 ? 'bg-primary-container text-on-primary ring-4 ring-primary-container/20' : 'bg-surface-variant text-outline'
              }`}
            >
              {currentStep > 2 ? <span className="material-symbols-outlined text-sm">check</span> : '2'}
            </button>
            <span className={`font-label-sm text-xs ${currentStep >= 2 ? 'font-bold text-primary' : 'text-outline'}`}>
              2. Details
            </span>
          </div>

          {/* Step 3 */}
          <div className="flex flex-col items-center gap-1 relative z-10">
            <button
              onClick={() => setCurrentStep(3)}
              className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition-all ${
                currentStep === 3 ? 'bg-primary-container text-on-primary' : 'bg-surface-variant text-outline'
              }`}
            >
              3
            </button>
            <span className={`font-label-sm text-xs ${currentStep === 3 ? 'font-bold text-primary' : 'text-outline'}`}>
              3. Review
            </span>
          </div>
        </div>
      </section>

      {/* STEP 1: Classification & Method Selection */}
      {currentStep === 1 && (
        <div className="max-w-3xl mx-auto w-full flex flex-col gap-lg bg-surface-container-lowest p-lg sm:p-xl rounded-lg border border-outline-variant shadow-ambient">
          <div className="text-center">
            <h2 className="text-xl font-bold text-primary mb-1">Choose Reporting Evidence Format</h2>
            <p className="text-xs text-on-surface-variant">
              Select how you would like to describe the issue for optimal field dispatch.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-md">
            {/* Text Option */}
            <button
              type="button"
              onClick={() => setEvidenceMethod('text')}
              className={`p-lg rounded-lg border-2 flex flex-col items-center text-center gap-3 transition-all ${
                evidenceMethod === 'text'
                  ? 'border-primary bg-primary-fixed/20 shadow-md scale-102'
                  : 'border-outline-variant hover:border-primary/50 bg-surface'
              }`}
            >
              <div className="w-12 h-12 rounded-full bg-primary-container text-on-primary flex items-center justify-center">
                <span className="material-symbols-outlined text-2xl">description</span>
              </div>
              <div>
                <h3 className="font-bold text-sm text-on-surface">Text Description</h3>
                <p className="text-[11px] text-on-surface-variant mt-1 leading-relaxed">
                  Type structured details, category, landmark, and complaint notes.
                </p>
              </div>
            </button>

            {/* Photo Option */}
            <button
              type="button"
              onClick={() => setEvidenceMethod('photo')}
              className={`p-lg rounded-lg border-2 flex flex-col items-center text-center gap-3 transition-all ${
                evidenceMethod === 'photo'
                  ? 'border-primary bg-primary-fixed/20 shadow-md scale-102'
                  : 'border-outline-variant hover:border-primary/50 bg-surface'
              }`}
            >
              <div className="w-12 h-12 rounded-full bg-primary-container text-on-primary flex items-center justify-center">
                <span className="material-symbols-outlined text-2xl">add_a_photo</span>
              </div>
              <div>
                <h3 className="font-bold text-sm text-on-surface">Photo / Camera</h3>
                <p className="text-[11px] text-on-surface-variant mt-1 leading-relaxed">
                  Upload photographic evidence showing potholes, leaks, or debris.
                </p>
              </div>
            </button>

            {/* Voice Option */}
            <button
              type="button"
              onClick={() => setEvidenceMethod('voice')}
              className={`p-lg rounded-lg border-2 flex flex-col items-center text-center gap-3 transition-all ${
                evidenceMethod === 'voice'
                  ? 'border-primary bg-primary-fixed/20 shadow-md scale-102'
                  : 'border-outline-variant hover:border-primary/50 bg-surface'
              }`}
            >
              <div className="w-12 h-12 rounded-full bg-primary-container text-on-primary flex items-center justify-center">
                <span className="material-symbols-outlined text-2xl">mic</span>
              </div>
              <div>
                <h3 className="font-bold text-sm text-on-surface">Voice Recording</h3>
                <p className="text-[11px] text-on-surface-variant mt-1 leading-relaxed">
                  Speak in Hindi, English, or regional language with automated speech-to-text.
                </p>
              </div>
            </button>
          </div>

          <div className="flex justify-end pt-md border-t border-outline-variant">
            <button
              onClick={() => setCurrentStep(2)}
              className="bg-primary-container text-on-primary font-bold text-xs px-6 py-2.5 rounded hover:bg-primary transition-all flex items-center gap-2"
            >
              <span>Continue to Form Details</span>
              <span className="material-symbols-outlined text-sm">arrow_forward</span>
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: Problem Details & Evidence Input */}
      {currentStep === 2 && (
        <div className="max-w-4xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-lg">
          {/* Left / Top Side: Evidence Input (Voice / Photo / Text Preview) */}
          <div className="lg:col-span-5 bg-surface-container-lowest p-lg rounded-lg border border-outline-variant shadow-ambient flex flex-col gap-md">
            <h2 className="text-base font-bold text-primary border-b border-outline-variant pb-2 flex items-center gap-2">
              <span className="material-symbols-outlined text-lg text-primary">
                {evidenceMethod === 'voice' ? 'mic' : evidenceMethod === 'photo' ? 'photo_camera' : 'edit_note'}
              </span>
              <span>
                {evidenceMethod === 'voice' ? 'Voice Recording' : evidenceMethod === 'photo' ? 'Photo Evidence' : 'Text Summary'}
              </span>
            </h2>

            {/* Voice Mode */}
            {evidenceMethod === 'voice' && (
              <div className="flex flex-col items-center justify-center py-6 gap-4 text-center">
                <div className="relative flex items-center justify-center w-28 h-28">
                  <div className={`absolute inset-0 rounded-full border-4 border-primary/20 ${isRecording ? 'pulse-recording' : ''}`}></div>
                  <button
                    type="button"
                    onClick={toggleRecording}
                    className={`w-20 h-20 rounded-full flex items-center justify-center text-white transition-all shadow-lg z-10 ${
                      isRecording ? 'bg-error scale-105' : 'bg-primary-container hover:bg-primary'
                    }`}
                  >
                    <span className="material-symbols-outlined text-3xl">
                      {isRecording ? 'stop' : 'mic'}
                    </span>
                  </button>
                </div>

                <div>
                  <div className="text-xl font-mono font-bold text-primary">
                    {formatTime(recordingTime)}
                  </div>
                  <p className="text-xs text-on-surface-variant mt-0.5">
                    {isRecording ? 'Recording live... Click to stop.' : recordedAudio ? 'Recording saved!' : 'Click microphone to record voice.'}
                  </p>
                </div>

                {/* Animated Waveform */}
                <div className="w-full flex items-center justify-center gap-1 h-10 px-4">
                  {[4, 8, 16, 24, 12, 28, 36, 18, 30, 22, 14, 8, 20, 32, 10].map((h, i) => (
                    <div
                      key={i}
                      className={`w-1 rounded-full transition-all duration-150 ${
                        isRecording ? 'bg-gov-saffron animate-pulse' : recordedAudio ? 'bg-gov-green' : 'bg-outline-variant'
                      }`}
                      style={{ height: isRecording ? `${Math.max(6, (h * Math.random() + 8))}px` : `${h}px` }}
                    ></div>
                  ))}
                </div>

                {voiceTranscript && (
                  <div className="w-full text-left bg-surface p-3 rounded border border-outline-variant text-xs">
                    <span className="font-bold text-primary block mb-1 flex items-center gap-1">
                      <span className="material-symbols-outlined text-xs text-gov-green">record_voice_over</span>
                      Live AI Speech Transcription:
                    </span>
                    <p className="text-on-surface-variant italic">"{voiceTranscript}"</p>
                  </div>
                )}
              </div>
            )}

            {/* Photo Mode */}
            {evidenceMethod === 'photo' && (
              <div className="flex flex-col gap-3">
                <label className="border-2 border-dashed border-outline-variant hover:border-primary p-6 rounded-lg flex flex-col items-center justify-center text-center cursor-pointer bg-surface hover:bg-surface-container transition-colors">
                  <span className="material-symbols-outlined text-3xl text-primary mb-2">cloud_upload</span>
                  <span className="text-xs font-bold text-primary">Click to upload photo or take picture</span>
                  <span className="text-[10px] text-on-surface-variant mt-1">Supports JPG, PNG up to 10MB</span>
                  <input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
                </label>

                {photoPreview && (
                  <div className="relative rounded overflow-hidden border border-outline-variant">
                    <img src={photoPreview} alt="Preview" className="w-full h-40 object-cover" />
                    <button
                      type="button"
                      onClick={() => setPhotoPreview(null)}
                      className="absolute top-2 right-2 bg-error text-white p-1 rounded-full shadow"
                    >
                      <span className="material-symbols-outlined text-xs">delete</span>
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Text Mode Info */}
            {evidenceMethod === 'text' && (
              <div className="bg-surface p-4 rounded text-xs text-on-surface-variant flex flex-col gap-2">
                <div className="flex items-center gap-1 text-primary font-bold">
                  <span className="material-symbols-outlined text-sm">tips_and_updates</span>
                  <span>Reporting Tips</span>
                </div>
                <p>• Include specific landmarks (e.g. Near Gate 3, Opposite Metro Pillar #124).</p>
                <p>• Mention if safety is immediately at risk for pedestrians or traffic.</p>
                <p>• Provide accurate contact info for engineer callback verification.</p>
              </div>
            )}

            <button
              type="button"
              onClick={() => setEvidenceMethod(evidenceMethod === 'text' ? 'photo' : evidenceMethod === 'photo' ? 'voice' : 'text')}
              className="text-xs text-primary underline font-bold mt-auto self-start flex items-center gap-1"
            >
              <span className="material-symbols-outlined text-sm">swap_horiz</span>
              Switch evidence format
            </button>
          </div>

          {/* Right Side: Form Inputs */}
          <div className="lg:col-span-7 bg-surface-container-lowest p-lg sm:p-xl rounded-lg border border-outline-variant shadow-ambient">
            <h2 className="text-base font-bold text-primary mb-md pb-2 border-b border-outline-variant">
              Grievance Specifics
            </h2>

            <div className="flex flex-col gap-md">
              {/* Category */}
              <div>
                <label className="block text-xs font-bold text-on-surface mb-1">
                  Department / Problem Category *
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-surface border border-outline-variant rounded focus:border-primary outline-none font-medium"
                >
                  <option>Road Infrastructure (Potholes, Broken Footpaths)</option>
                  <option>Drainage & Water Supply (Leakage, Overflow)</option>
                  <option>Sanitation & Waste (Garbage, Open Dumps)</option>
                  <option>Electricity & Lighting (Streetlight Outage, Exposed Wire)</option>
                  <option>Public Safety & Traffic (Broken Signals, Missing Signs)</option>
                  <option>Health & Hygiene (Stagnant Water, Mosquito Breeding)</option>
                </select>
              </div>

              {/* Title */}
              <div>
                <label className="block text-xs font-bold text-on-surface mb-1">
                  Short Title / Heading *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Deep pothole causing two-wheeler accidents"
                  className="w-full px-3 py-2 text-xs bg-surface border border-outline-variant rounded focus:border-primary outline-none"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-bold text-on-surface mb-1">
                  Detailed Description *
                </label>
                <textarea
                  rows={4}
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe the severity, duration, and exact issue..."
                  className="w-full px-3 py-2 text-xs bg-surface border border-outline-variant rounded focus:border-primary outline-none resize-none leading-relaxed"
                ></textarea>
              </div>

              {/* Location & GPS */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-xs font-bold text-on-surface">Exact Location & Landmark *</label>
                  <button
                    type="button"
                    onClick={handleUseLocation}
                    className="text-[11px] text-primary font-bold hover:underline flex items-center gap-0.5"
                  >
                    <span className="material-symbols-outlined text-xs">my_location</span>
                    Detect My Location
                  </button>
                </div>
                <input
                  type="text"
                  required
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g. Sector 4 Market Road, opposite Metro Pillar #45"
                  className="w-full px-3 py-2 text-xs bg-surface border border-outline-variant rounded focus:border-primary outline-none"
                />
              </div>

              {/* District & Priority */}
              <div className="grid grid-cols-2 gap-md">
                <div>
                  <label className="block text-xs font-bold text-on-surface mb-1">District</label>
                  <select
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-surface border border-outline-variant rounded focus:border-primary outline-none"
                  >
                    <option>South District</option>
                    <option>Central District</option>
                    <option>East District</option>
                    <option>North District</option>
                    <option>West District</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-on-surface mb-1">Urgency / Severity</label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-surface border border-outline-variant rounded focus:border-primary outline-none"
                  >
                    <option>High</option>
                    <option>Critical</option>
                    <option>Medium</option>
                    <option>Low</option>
                  </select>
                </div>
              </div>

              {/* Stepper navigation */}
              <div className="flex justify-between pt-md border-t border-outline-variant mt-2">
                <button
                  type="button"
                  onClick={() => setCurrentStep(1)}
                  className="text-xs font-bold text-on-surface-variant hover:text-primary px-4 py-2"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={() => setCurrentStep(3)}
                  disabled={!title || !location}
                  className="bg-primary-container text-on-primary font-bold text-xs px-6 py-2.5 rounded hover:bg-primary transition-all disabled:opacity-50 flex items-center gap-2"
                >
                  <span>Review Submission</span>
                  <span className="material-symbols-outlined text-sm">arrow_forward</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* STEP 3: Review & Submit */}
      {currentStep === 3 && (
        <div className="max-w-2xl mx-auto w-full bg-surface-container-lowest p-lg sm:p-xl rounded-lg border border-outline-variant shadow-ambient flex flex-col gap-md">
          <div className="border-b border-outline-variant pb-md">
            <span className="text-xs font-bold text-gov-green uppercase tracking-wider block mb-1">
              Final Step
            </span>
            <h2 className="text-xl font-bold text-primary">Review Grievance Information</h2>
            <p className="text-xs text-on-surface-variant mt-0.5">
              Please verify the information before official filing into the central queue.
            </p>
          </div>

          <div className="bg-surface p-md rounded-lg border border-outline-variant flex flex-col gap-3 text-xs">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <span className="text-[10px] uppercase font-bold text-on-surface-variant block">Category</span>
                <span className="font-bold text-primary">{category}</span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-on-surface-variant block">Priority</span>
                <span className="font-bold text-error">{priority}</span>
              </div>
            </div>

            <div>
              <span className="text-[10px] uppercase font-bold text-on-surface-variant block">Title</span>
              <span className="font-bold text-on-surface text-sm">{title}</span>
            </div>

            <div>
              <span className="text-[10px] uppercase font-bold text-on-surface-variant block">Description</span>
              <p className="text-on-surface-variant leading-relaxed">{description || voiceTranscript}</p>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <span className="text-[10px] uppercase font-bold text-on-surface-variant block">Location</span>
                <span className="text-on-surface font-medium">{location}, {district}</span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-on-surface-variant block">Filing Citizen</span>
                <span className="text-on-surface font-medium">{currentUser.name} ({currentUser.phone})</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 p-3 bg-gov-green/10 rounded border border-gov-green/30 text-[11px] text-gov-green font-medium">
            <span className="material-symbols-outlined text-base">verified_user</span>
            <span>A digital acknowledgement tracking token will be issued immediately upon submission.</span>
          </div>

          <div className="flex justify-between pt-md border-t border-outline-variant">
            <button
              type="button"
              onClick={() => setCurrentStep(2)}
              className="text-xs font-bold text-on-surface-variant hover:text-primary px-4 py-2"
            >
              Edit Details
            </button>

            <button
              type="button"
              onClick={handleFinalSubmit}
              className="bg-primary-container text-on-primary font-bold text-xs px-8 py-3 rounded hover:bg-primary transition-all shadow-md active:scale-95 flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-base">send</span>
              <span>Confirm & File Grievance</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

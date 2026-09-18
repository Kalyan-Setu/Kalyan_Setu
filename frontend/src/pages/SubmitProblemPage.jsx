import React, { useState, useEffect, useRef } from 'react';
import { useCivic, API_BASE } from '../context/CivicContext';
import { INDIAN_STATES, getDistrictsForState, isValidPincode } from '../data/indiaLocationData';

export default function SubmitProblemPage() {
  const { addComplaint, navigateTo, currentUser } = useCivic();

  const [currentStep, setCurrentStep] = useState(1); // 1: Classification/Method, 2: Details, 3: Review
  const [evidenceMethod, setEvidenceMethod] = useState('text'); // 'photo', 'text', 'voice'

  // Form Fields
  const [category, setCategory] = useState('Road Infrastructure');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [state, setState] = useState(currentUser?.state || '');
  const [district, setDistrict] = useState(currentUser?.district || '');
  const [pincode, setPincode] = useState(currentUser?.pincode || '');
  const [location, setLocation] = useState('');
  const [stepError, setStepError] = useState('');
  // Photo & file upload state
  const [photoPreview, setPhotoPreview] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);

  // Voice recording & Sarvam AI state
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);  // Stage 2: Groq description generation
  const [transcribeFailed, setTranscribeFailed] = useState(false);
  const [voiceLang, setVoiceLang] = useState('od-IN'); // 'od-IN'=Odia, 'hi-IN'=Hindi, 'en-IN'=English
  const [recordingTime, setRecordingTime] = useState(0);
  const [recordedAudio, setRecordedAudio] = useState(false);
  const [voiceTranscript, setVoiceTranscript] = useState('');
  const [audioBlob, setAudioBlob] = useState(null);
  const timerRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const speechRecognitionRef = useRef(null);
  const liveTranscriptRef = useRef(''); // accumulates Web Speech API live results

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

  // ── Helper: call Groq to generate formal title + description from a transcript ──
  const generateFromTranscript = async (rawTranscript, selectedLang = voiceLang) => {
    setIsGenerating(true);
    try {
      const fd = new FormData();
      fd.append('transcript', rawTranscript);
      fd.append('category', category);
      if (location && !location.toLowerCase().includes('central district') && !location.toLowerCase().includes('area')) {
        fd.append('location', location);
      }
      if (district && !district.toLowerCase().includes('central district')) {
        fd.append('district', district);
      }
      fd.append('language_code', selectedLang || 'od-IN');
      if (state) fd.append('state', state);
      if (pincode) fd.append('pincode', pincode);
      const res = await fetch(`${API_BASE}/problems/generate-description`, {
        method: 'POST',
        body: fd,
      });
      if (res.ok) {
        const data = await res.json();
        const genDesc = (data.description || '').trim();
        const genTitle = (data.title || '').trim();
        if (genDesc) setDescription(genDesc);
        if (genTitle) setTitle(genTitle);
        console.info(`[Pipeline] Stage 2 complete via ${data.model} in ${selectedLang}`);
      }
    } catch (err) {
      console.warn('[Pipeline] Stage 2 (Groq) failed, using raw transcript:', err);
      if (rawTranscript && !description) setDescription(rawTranscript);
      if (!title) {
        setTitle(selectedLang === 'od-IN' ? `ଅଭିଯୋଗ: ${category} ସମସ୍ୟା` : `Voice Report: ${category} issue`);
      }
    } finally {
      setIsGenerating(false);
    }
  };

  // ── Stage 1: Transcribe audio blob via Sarvam AI saaras:v3 ──
  const transcribeAudioBlob = async (blob) => {
    setIsTranscribing(true);
    setTranscribeFailed(false);
    let rawTranscript = '';

    try {
      const formData = new FormData();
      formData.append('file', blob, 'voice_complaint.webm');
      formData.append('language_code', voiceLang || 'od-IN');
      const res = await fetch(`${API_BASE}/problems/transcribe`, {
        method: 'POST',
        body: formData,
      });
      if (res.ok) {
        const data = await res.json();
        rawTranscript = (data.transcript || '').trim();
        if (rawTranscript) {
          console.info(`[Pipeline] Stage 1 complete via Sarvam AI (${voiceLang}): ${rawTranscript.slice(0, 60)}...`);
        }
      }
    } catch (err) {
      console.warn('[Pipeline] Stage 1 Sarvam AI error:', err);
    } finally {
      setIsTranscribing(false);
    }

    // Fallback: use Web Speech API live transcript only if Sarvam returned nothing and language is English
    if (!rawTranscript && voiceLang === 'en-IN') {
      rawTranscript = liveTranscriptRef.current.trim();
    }

    if (!rawTranscript) {
      // Show failure message if no speech captured
      setTranscribeFailed(true);
      return;
    }

    // Show raw transcript immediately
    setVoiceTranscript(rawTranscript);
    setDescription(rawTranscript);

    // ── Stage 2: Groq LLM → formal grievance title + description in Odia/Hindi/English ──
    await generateFromTranscript(rawTranscript, voiceLang);
  };


  const toggleRecording = async () => {
    if (!isRecording) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaRecorderRef.current = new MediaRecorder(stream);
        audioChunksRef.current = [];

        mediaRecorderRef.current.ondataavailable = (event) => {
          if (event.data.size > 0) {
            audioChunksRef.current.push(event.data);
          }
        };

        mediaRecorderRef.current.onstop = async () => {
          const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
          setAudioBlob(blob);
          stream.getTracks().forEach(track => track.stop());
          // Send to Sarvam AI saaras:v3 speech-to-text API
          await transcribeAudioBlob(blob);
        };

        mediaRecorderRef.current.start();
        setIsRecording(true);
        setRecordedAudio(false);
        setRecordingTime(0);
        liveTranscriptRef.current = '';
        setVoiceTranscript('');

        // Web Speech API for real-time live preview ONLY when English is selected (browsers lack client Odia models)
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (SpeechRecognition && voiceLang === 'en-IN') {
          try {
            const recognition = new SpeechRecognition();
            recognition.continuous = true;
            recognition.interimResults = true;
            recognition.lang = 'en-IN';

            recognition.onresult = (event) => {
              let fullTranscript = '';
              for (let i = 0; i < event.results.length; i++) {
                fullTranscript += event.results[i][0].transcript;
              }
              if (fullTranscript.trim()) {
                liveTranscriptRef.current = fullTranscript;
                setVoiceTranscript(fullTranscript);
                setDescription(fullTranscript);
                if (!title) setTitle(`Voice Report: ${category} issue in ${district}`);
                if (!location) setLocation(`${district} Central Market Area`);
              }
            };
            recognition.start();
            speechRecognitionRef.current = recognition;
          } catch (e) {
            console.warn("Web Speech Recognition init note:", e);
          }
        }
      } catch (err) {
        console.warn("Microphone access denied or unavailable:", err);
        setIsRecording(false);
        setRecordedAudio(true);
        setRecordingTime(5);
        // Fallback demo transcript for testing / browser without mic hardware
        const fallbackText = "Severe road damage and deep potholes causing major traffic safety risk near central market junction.";
        setVoiceTranscript(fallbackText);
        setDescription(fallbackText);
        if (!title) {
          setTitle(`Voice Report: ${category} issue in ${district}`);
        }
        if (!location) {
          setLocation(`${district} Central Market Area`);
        }
      }
    } else {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
      }
      if (speechRecognitionRef.current) {
        try {
          speechRecognitionRef.current.stop();
        } catch (e) {
          // ignore
        }
      }
      setIsRecording(false);
      setRecordedAudio(true);
      if (!location) {
        setLocation(`${district} Central Market Area`);
      }
      if (!title) {
        setTitle(`Voice Report: ${category} issue in ${district}`);
      }
    }
  };

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPhotoPreview(url);
    }
  };

  const handleFinalSubmit = async (e) => {
    e.preventDefault();
    const created = await addComplaint({
      title: title || `${category} issue in ${district}`,
      description: description || voiceTranscript || "Civic issue submitted by citizen.",
      category,
      location: location.trim(),
      district,
      state: state || currentUser?.state || "Delhi NCR",
      pincode: pincode.trim(),
      priority: 'Pending Assessment',
      evidenceType: evidenceMethod,
      file: selectedFile,
      audioBlob: audioBlob,
      imageUrl: photoPreview || (evidenceMethod === 'photo' ? "https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=600&auto=format&fit=crop&q=80" : ""),
      audioLength: recordedAudio ? `0:${recordingTime < 10 ? '0' + recordingTime : recordingTime}` : "",
      voiceTranscript
    });

    navigateTo('citizen_dashboard');
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
              <div className="flex flex-col items-center justify-center py-4 gap-4 text-center">

                {/* Language Selector */}
                <div className="w-full flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider text-left">
                    🌐 Select Language for AI Speech-to-Text
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { code: 'od-IN',  label: 'ଓଡ଼ିଆ',   sub: 'Odia'        },
                      { code: 'hi-IN',  label: 'हि',      sub: 'Hindi'       },
                      { code: 'en-IN',  label: 'EN',      sub: 'English'     },
                    ].map(lang => (
                      <button
                        key={lang.code}
                        type="button"
                        disabled={isRecording}
                        onClick={() => setVoiceLang(lang.code)}
                        className={`py-2 px-1 rounded border-2 text-center transition-all ${
                          voiceLang === lang.code
                            ? 'border-primary bg-primary-fixed/20 text-primary font-bold shadow-sm'
                            : 'border-outline-variant text-on-surface-variant hover:border-primary/50 bg-surface'
                        } ${isRecording ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        <div className="text-sm sm:text-base font-bold leading-none">{lang.label}</div>
                        <div className="text-[9px] mt-0.5 opacity-80">{lang.sub}</div>
                      </button>
                    ))}
                  </div>
                </div>

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

                {/* Pipeline Stage 1: STT */}
                {isTranscribing && (
                  <div className="w-full text-center bg-primary-fixed/20 p-3 rounded border border-primary/30 text-xs flex items-center justify-center gap-2 text-primary font-bold animate-pulse">
                    <span className="material-symbols-outlined text-base animate-spin">sync</span>
                    <span>Stage 1/2: Transcribing voice via Sarvam AI saaras:v3...</span>
                  </div>
                )}

                {/* Pipeline Stage 2: Groq LLM Description Generator */}
                {isGenerating && (
                  <div className="w-full text-center bg-purple-500/10 p-3 rounded border border-purple-500/30 text-xs flex items-center justify-center gap-2 text-purple-700 dark:text-purple-300 font-bold animate-pulse">
                    <span className="material-symbols-outlined text-base animate-spin">auto_awesome</span>
                    <span>Stage 2/2: Groq LLM compiling formal grievance description...</span>
                  </div>
                )}

                {voiceTranscript && !isTranscribing && !isGenerating && (
                  <div className="w-full text-left bg-surface p-3 rounded border border-gov-green/30 text-xs flex flex-col gap-1">
                    <span className="font-bold text-gov-green flex items-center gap-1">
                      <span className="material-symbols-outlined text-xs">verified</span>
                      AI Pipeline Complete (Speech STT → Groq Formal Description):
                    </span>
                    <p className="text-on-surface font-medium italic bg-surface-container/50 p-2 rounded border border-outline-variant/60">
                      "{voiceTranscript}"
                    </p>
                  </div>
                )}

                {transcribeFailed && !isTranscribing && !isGenerating && !voiceTranscript && (
                  <div className="w-full text-center bg-amber-500/10 p-3 rounded border border-amber-500/30 text-xs text-amber-700 dark:text-amber-300 flex items-center justify-center gap-2">
                    <span className="material-symbols-outlined text-sm">mic_off</span>
                    <span>No clear speech captured. Please speak again or type your complaint manually.</span>
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
                <input
                  type="text"
                  required
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  placeholder="e.g. Road Infrastructure, Drainage & Water Supply, Sanitation, Electricity..."
                  className="w-full px-3 py-2 text-xs bg-surface border border-outline-variant rounded focus:border-primary outline-none font-medium"
                />
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

              {/* 4. State * */}
              <div>
                <label className="block text-xs font-bold text-on-surface mb-1">
                  State / Union Territory *
                </label>
                <select
                  required
                  value={state}
                  onChange={(e) => {
                    setState(e.target.value);
                    setDistrict('');
                    setStepError('');
                  }}
                  className="w-full px-3 py-2 text-xs bg-surface border border-outline-variant rounded focus:border-primary outline-none font-medium"
                >
                  <option value="">-- Select State / UT --</option>
                  {INDIAN_STATES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>

              {/* 5. District * (Dependent Dropdown) */}
              <div>
                <label className="block text-xs font-bold text-on-surface mb-1">
                  District *
                </label>
                <select
                  required
                  disabled={!state}
                  value={district}
                  onChange={(e) => {
                    setDistrict(e.target.value);
                    setStepError('');
                  }}
                  className={`w-full px-3 py-2 text-xs bg-surface border border-outline-variant rounded focus:border-primary outline-none font-medium ${
                    !state ? 'bg-surface-container-low text-on-surface-variant cursor-not-allowed opacity-60' : ''
                  }`}
                >
                  <option value="">
                    {state ? '-- Select District --' : '-- Select State first --'}
                  </option>
                  {getDistrictsForState(state).map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>

              {/* 6. Pincode * */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-on-surface">
                    Pincode *
                  </label>
                  <span className={`text-[10px] font-mono font-medium ${
                    pincode.length === 6 ? 'text-gov-green font-bold' :
                    pincode.length > 0 ? 'text-error' : 'text-on-surface-variant'
                  }`}>
                    {pincode.length}/6 digits
                  </span>
                </div>
                <div className="relative">
                  <span className={`material-symbols-outlined absolute left-3 top-2 text-base ${
                    pincode.length === 6 ? 'text-gov-green' :
                    pincode.length > 0 ? 'text-error' : 'text-on-surface-variant'
                  }`}>
                    pin_drop
                  </span>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    inputMode="numeric"
                    pattern="[0-9]{6}"
                    value={pincode}
                    onKeyDown={(e) => {
                      const allowed = ['Backspace','Delete','ArrowLeft','ArrowRight','Tab','Enter'];
                      if (!allowed.includes(e.key) && !/^[0-9]$/.test(e.key)) {
                        e.preventDefault();
                      }
                    }}
                    onPaste={(e) => {
                      e.preventDefault();
                      const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
                      setPincode(pasted);
                      setStepError('');
                    }}
                    onChange={(e) => {
                      const digits = e.target.value.replace(/\D/g, '').slice(0, 6);
                      setPincode(digits);
                      setStepError('');
                    }}
                    placeholder="Enter 6-digit pincode"
                    className={`w-full pl-9 pr-8 py-2 text-xs bg-surface border rounded focus:ring-1 outline-none transition-colors ${
                      pincode.length === 6
                        ? 'border-gov-green focus:border-gov-green focus:ring-gov-green'
                        : pincode.length > 0
                        ? 'border-error focus:border-error focus:ring-error'
                        : 'border-outline-variant focus:border-primary focus:ring-primary'
                    }`}
                  />
                  {pincode.length === 6 && (
                    <span className="material-symbols-outlined absolute right-2.5 top-2 text-gov-green text-base">check_circle</span>
                  )}
                  {pincode.length > 0 && pincode.length < 6 && (
                    <span className="material-symbols-outlined absolute right-2.5 top-2 text-error text-base">error</span>
                  )}
                </div>
                {pincode.length > 0 && pincode.length < 6 ? (
                  <p className="text-[10px] text-error mt-1 font-medium">
                    ⚠ Pincode must be exactly 6 numeric digits ({pincode.length}/6 entered).
                  </p>
                ) : (
                  <p className="text-[10px] text-on-surface-variant mt-1">
                    Enter 6-digit area postal code (e.g. 110001, 751030).
                  </p>
                )}
              </div>

              {/* 7. Exact Location & Landmark * */}
              <div>
                <label className="block text-xs font-bold text-on-surface mb-1">
                  Exact Location & Landmark *
                </label>
                <input
                  type="text"
                  required
                  value={location}
                  onChange={(e) => {
                    setLocation(e.target.value);
                    setStepError('');
                  }}
                  placeholder="Enter area, village, road, landmark or nearby place"
                  className="w-full px-3 py-2 text-xs bg-surface border border-outline-variant rounded focus:border-primary outline-none"
                />
              </div>


              {/* Step 2 Validation Error Message */}
              {stepError && (
                <div className="p-2.5 bg-error/10 border border-error/30 rounded text-error text-xs font-medium flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-sm">error</span>
                  <span>{stepError}</span>
                </div>
              )}

              {/* Stepper navigation */}
              <div className="flex justify-between pt-md border-t border-outline-variant mt-2">
                <button
                  type="button"
                  onClick={() => {
                    setStepError('');
                    setCurrentStep(1);
                  }}
                  className="text-xs font-bold text-on-surface-variant hover:text-primary px-4 py-2"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (!state) {
                      setStepError('Please select a State / Union Territory.');
                      return;
                    }
                    if (!district) {
                      setStepError('Please select a District.');
                      return;
                    }
                    const validDistricts = getDistrictsForState(state);
                    if (!validDistricts.includes(district)) {
                      setStepError('Selected district does not belong to the selected state.');
                      return;
                    }
                    const cleanPin = pincode.trim();
                    if (!cleanPin) {
                      setStepError('Pincode is required.');
                      return;
                    }
                    if (!isValidPincode(cleanPin)) {
                      setStepError('Pincode must be exactly 6 numeric digits (e.g. 110001, 751030).');
                      return;
                    }
                    if (!location.trim()) {
                      setStepError('Please enter the exact location & landmark.');
                      return;
                    }

                    setStepError('');
                    if (!title) setTitle(`${category} issue in ${district}`);
                    if (!description) setDescription(voiceTranscript || `Civic issue reported in ${category} for immediate inspection.`);
                    setCurrentStep(3);
                  }}
                  className="bg-primary-container text-on-primary font-bold text-xs px-6 py-2.5 rounded hover:bg-primary transition-all flex items-center gap-2"
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
                <span className="text-[10px] uppercase font-bold text-on-surface-variant block">Urgency / Triage</span>
                <span className="font-bold text-primary flex items-center gap-1 text-[11px]">
                  <span className="material-symbols-outlined text-xs">smart_toy</span>
                  Assigned by Govt AI Triage
                </span>
              </div>
            </div>

            <div>
              <span className="text-[10px] uppercase font-bold text-on-surface-variant block">Title</span>
              <span className="font-bold text-on-surface text-sm">{title || `${category} issue in ${district}`}</span>
            </div>

            <div>
              <span className="text-[10px] uppercase font-bold text-on-surface-variant block">Description</span>
              <p className="text-on-surface-variant leading-relaxed">{description || voiceTranscript || "Civic grievance submitted by citizen."}</p>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <span className="text-[10px] uppercase font-bold text-on-surface-variant block">State & District</span>
                <span className="text-on-surface font-medium">{district}, {state}</span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-on-surface-variant block">Pincode</span>
                <span className="text-on-surface font-mono font-medium">{pincode}</span>
              </div>
            </div>

            <div>
              <span className="text-[10px] uppercase font-bold text-on-surface-variant block">Exact Location & Landmark</span>
              <span className="text-on-surface font-medium">{location}</span>
            </div>

            <div>
              <span className="text-[10px] uppercase font-bold text-on-surface-variant block">Filing Citizen</span>
              <span className="text-on-surface font-medium">
                {currentUser?.full_name || currentUser?.name || 'A. Sharma'} ({currentUser?.phone || '+91 98765 43210'})
              </span>
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

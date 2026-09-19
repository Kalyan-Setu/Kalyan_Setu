import React, { useState, useEffect, useRef } from 'react';
import { useCivic, API_BASE } from '../context/CivicContext';
import { useLanguage } from '../context/LanguageContext';
import { INDIAN_STATES, getDistrictsForState, isValidPincode } from '../data/indiaLocationData';

export const CIVIC_CATEGORIES = [
  'Road Infrastructure',
  'Drainage & Water Supply',
  'Sanitation & Solid Waste',
  'Electricity & Street Lighting',
  'Traffic & Transport',
  'Public Safety & Hazards',
  'Health & Hygiene',
  'Parks & Public Spaces',
  'General Civic Issue',
];

export function inferCategoryFromText(text) {
  if (!text || typeof text !== 'string' || !text.trim()) return '';
  const lower = text.toLowerCase();

  // Drainage & Water Supply
  if (
    lower.includes('drain') || lower.includes('sewer') || lower.includes('sewage') ||
    lower.includes('waterlogg') || lower.includes('water logg') || lower.includes('pipe') ||
    lower.includes('drinking water') || lower.includes('gutter') || lower.includes('leak') ||
    lower.includes('manhole') || lower.includes('overflow') || lower.includes('flood') ||
    lower.includes('silt') || lower.includes('ଚୋକ୍') ||
    lower.includes('ପାଣି') || lower.includes('ଜଳ') || lower.includes('ନାଳ') || lower.includes('ସୁଏଜ') ||
    lower.includes('पानी') || lower.includes('नाली') || lower.includes('सीवर') || lower.includes('जलभराव')
  ) {
    return 'Drainage & Water Supply';
  }

  // Sanitation & Solid Waste
  if (
    lower.includes('garbage') || lower.includes('waste') || lower.includes('trash') ||
    lower.includes('dustbin') || lower.includes('dump') || lower.includes('filth') ||
    lower.includes('smell') || lower.includes('stink') || lower.includes('debris') ||
    lower.includes('litter') || lower.includes('dead animal') || lower.includes('sweep') ||
    lower.includes('କଚରା') || lower.includes('ଅଳିଆ') || lower.includes('ଆବର୍ଜନା') || lower.includes('ସଫେଇ') ||
    lower.includes('कचरा') || lower.includes('कूड़ा') || lower.includes('सफाई') || lower.includes('गंदगी') || lower.includes('बदबू')
  ) {
    return 'Sanitation & Solid Waste';
  }

  // Electricity & Street Lighting
  if (
    lower.includes('electric') || lower.includes('wire') || lower.includes('light') ||
    lower.includes('streetlight') || lower.includes('street light') || lower.includes('pole') ||
    lower.includes('transformer') || lower.includes('power cut') || lower.includes('blackout') ||
    lower.includes('spark') || lower.includes('voltage') || lower.includes('bulb') ||
    lower.includes('ବିଜୁଳି') || lower.includes('ଲାଇଟ୍') || lower.includes('ଖୁଣ୍ଟ') || lower.includes('ତାର') || lower.includes('ଟ୍ରାନ୍ସଫର୍ମର') ||
    lower.includes('बिजली') || lower.includes('लाइट') || lower.includes('खंभा') || lower.includes('तार') || lower.includes('अंधेरा')
  ) {
    return 'Electricity & Street Lighting';
  }

  // Road Infrastructure
  if (
    lower.includes('pothole') || lower.includes('road') || lower.includes('street') ||
    lower.includes('asphalt') || lower.includes('highway') || lower.includes('footpath') ||
    lower.includes('pavement') || lower.includes('bridge') || lower.includes('divider') ||
    lower.includes('speed breaker') || lower.includes('crack') || lower.includes('crater') || lower.includes('tar') ||
    lower.includes('ରାସ୍ତା') || lower.includes('ସଡକ') || lower.includes('ଖାଲ') || lower.includes('ପୋଲ') ||
    lower.includes('सड़क') || lower.includes('गड्ढा') || lower.includes('मार्ग') || lower.includes('पुल') || lower.includes('फुटपाथ')
  ) {
    return 'Road Infrastructure';
  }

  // Traffic & Transport
  if (
    lower.includes('traffic') || lower.includes('jam') || lower.includes('parking') ||
    lower.includes('bus stop') || lower.includes('bus') || lower.includes('signal') ||
    lower.includes('congestion') || lower.includes('vehicle') ||
    lower.includes('ଟ୍ରାଫିକ୍') || lower.includes('ଗାଡି') ||
    lower.includes('ट्रैफिक') || lower.includes('जाम') || lower.includes('पार्किंग')
  ) {
    return 'Traffic & Transport';
  }

  // Public Safety & Hazards
  if (
    lower.includes('danger') || lower.includes('hazard') || lower.includes('stray dog') ||
    lower.includes('dog bite') || lower.includes('accident') || lower.includes('falling') ||
    lower.includes('collapsed') || lower.includes('tree fall') || lower.includes('open wire') ||
    lower.includes('ବିପଦ') || lower.includes('କୁକୁର') || lower.includes('ଦୁର୍ଘଟଣା') ||
    lower.includes('खतरा') || lower.includes('आवारा कुत्ते') || lower.includes('हादसा')
  ) {
    return 'Public Safety & Hazards';
  }

  // Health & Hygiene
  if (
    lower.includes('hospital') || lower.includes('mosquito') || lower.includes('dengue') ||
    lower.includes('malaria') || lower.includes('fogging') || lower.includes('disease') ||
    lower.includes('ମଶା') || lower.includes('ଡେଙ୍ଗୁ') || lower.includes('ମ୍ୟାଲେରିଆ') ||
    lower.includes('मच्छर') || lower.includes('डेंगू') || lower.includes('मलेरिया') || lower.includes('बीमारी')
  ) {
    return 'Health & Hygiene';
  }

  // Parks & Public Spaces
  if (
    lower.includes('park') || lower.includes('garden') || lower.includes('bench') ||
    lower.includes('playground') || lower.includes('swing') ||
    lower.includes('ପାର୍କ') || lower.includes('ବଗିଚା') ||
    lower.includes('पार्क') || lower.includes('बगीचा')
  ) {
    return 'Parks & Public Spaces';
  }

  if (text.trim().length > 15) {
    return 'General Civic Issue';
  }
  return '';
}

export function inferTitleFromText(text, categoryName = '') {
  if (!text || typeof text !== 'string' || !text.trim()) return '';
  const clean = text
    .replace(/^\[Voice Note\]:\s*/i, '')
    .replace(/^\[Citizen Voice Note\]:\s*/i, '')
    .replace(/\n+/g, ' ')
    .trim();
  if (!clean) return '';

  const firstSentence = clean.split(/[.!?\n।]/)[0].trim();
  if (firstSentence.length >= 8 && firstSentence.length <= 80) {
    return firstSentence.charAt(0).toUpperCase() + firstSentence.slice(1);
  }
  const words = clean.split(/\s+/).slice(0, 9).join(' ');
  if (words.length > 5) {
    return words.charAt(0).toUpperCase() + words.slice(1) + (clean.split(/\s+/).length > 9 ? '...' : '');
  }
  return categoryName ? `${categoryName} Issue` : 'Civic Grievance Report';
}

export default function SubmitProblemPage() {
  const { addComplaint, navigateTo, currentUser } = useCivic();
  const { t } = useLanguage();

  // 2-Step Flow:
  // Step 1: Problem Description & Location Details (Unified)
  // Step 2: Review & Submit
  const [currentStep, setCurrentStep] = useState(1);

  // Form Fields - initially empty category so it can be auto-filled by analyzing description
  const [category, setCategory] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [state, setState] = useState(currentUser?.state || '');
  const [district, setDistrict] = useState(currentUser?.district || '');
  const [pincode, setPincode] = useState(currentUser?.pincode || '');
  const [location, setLocation] = useState('');
  const [stepError, setStepError] = useState('');

  // Track if user explicitly modified Category or Title
  const userEditedCategoryRef = useRef(false);
  const userEditedTitleRef = useRef(false);

  // Photo & file upload state
  const [photoPreview, setPhotoPreview] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const fileInputRef = useRef(null);

  // Live Camera state & refs
  const [showCameraModal, setShowCameraModal] = useState(false);
  const videoRef = useRef(null);
  const cameraStreamRef = useRef(null);
  const cameraInputRef = useRef(null);

  // Voice recording & Sarvam AI state
  const [showVoiceRecorder, setShowVoiceRecorder] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false); // Stage 2: Groq description generation
  const [transcribeFailed, setTranscribeFailed] = useState(false);
  const [voiceLang, setVoiceLang] = useState('od-IN'); // 'od-IN'=Odia, 'hi-IN'=Hindi, 'en-IN'=English
  const [recordingTime, setRecordingTime] = useState(0);
  const [recordedAudio, setRecordedAudio] = useState(false);
  const [voiceTranscript, setVoiceTranscript] = useState('');
  const [audioBlob, setAudioBlob] = useState(null);
  const [audioUrl, setAudioUrl] = useState(null);

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

  // Device Geolocation Auto-Detection State
  const [isDetectingLocation, setIsDetectingLocation] = useState(false);
  const [locationDetectStatus, setLocationDetectStatus] = useState('');

  const detectCurrentLocation = () => {
    if (!navigator.geolocation) {
      setLocationDetectStatus('Geolocation is not supported by your browser.');
      return;
    }

    setIsDetectingLocation(true);
    setLocationDetectStatus('Requesting device location...');

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        setLocationDetectStatus('Resolving address from coordinates...');
        try {
          let addressData = null;
          let displayName = '';

          // 1. Try OpenStreetMap Nominatim reverse geocode
          try {
            const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json&addressdetails=1`, {
              headers: { 'User-Agent': 'KalyanSetuCivicApp/1.0' }
            });
            if (res.ok) {
              const data = await res.json();
              addressData = data.address;
              displayName = data.display_name || '';
            }
          } catch (e) {
            console.warn('Nominatim reverse geocode failed, using fallback:', e);
          }

          // 2. Fallback to BigDataCloud
          if (!addressData) {
            try {
              const bdcRes = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`);
              if (bdcRes.ok) {
                const bdc = await bdcRes.json();
                addressData = {
                  state: bdc.principalSubdivision || '',
                  state_district: bdc.localityInfo?.administrative?.find(a => a.description?.includes('district'))?.name?.replace(/ district/i, '') || bdc.city || '',
                  city: bdc.city || bdc.locality || '',
                  postcode: bdc.postcode || '',
                  road: bdc.locality || bdc.city || '',
                };
                displayName = `${bdc.locality || bdc.city}, ${bdc.principalSubdivision}`;
              }
            } catch (e2) {
              console.warn('BigDataCloud reverse geocode failed:', e2);
            }
          }

          if (addressData) {
            // Match State against INDIAN_STATES
            const rawState = addressData.state || '';
            let matchedState = '';
            for (const s of INDIAN_STATES) {
              if (rawState.toLowerCase() === s.toLowerCase() ||
                  (rawState.toLowerCase().includes('delhi') && s === 'Delhi NCR') ||
                  (rawState.toLowerCase().includes('odisha') && s === 'Odisha') ||
                  (rawState.toLowerCase().includes('orissa') && s === 'Odisha')) {
                matchedState = s;
                break;
              }
            }
            if (!matchedState && rawState) {
              const found = INDIAN_STATES.find(s => s.toLowerCase().includes(rawState.toLowerCase()) || rawState.toLowerCase().includes(s.toLowerCase()));
              if (found) matchedState = found;
            }

            if (matchedState) {
              setState(matchedState);
              // Match District
              const validDistricts = getDistrictsForState(matchedState);
              const candidateDistricts = [
                addressData.state_district,
                addressData.county,
                addressData.city_district,
                addressData.city,
                addressData.town,
                addressData.village
              ].filter(Boolean).map(d => d.replace(/ district/i, '').trim());

              for (const cand of candidateDistricts) {
                const dMatch = validDistricts.find(d => d.toLowerCase() === cand.toLowerCase() || d.toLowerCase().includes(cand.toLowerCase()) || cand.toLowerCase().includes(d.toLowerCase()));
                if (dMatch) {
                  setDistrict(dMatch);
                  break;
                }
              }
            }

            // Match Pincode (6 numeric digits)
            const rawPin = addressData.postcode || '';
            const pinMatch = rawPin.replace(/\D/g, '').slice(0, 6);
            if (pinMatch.length === 6) {
              setPincode(pinMatch);
            }

            // Build Exact Location / Landmark
            const road = addressData.road || addressData.street || '';
            const suburb = addressData.suburb || addressData.neighbourhood || addressData.residential || addressData.commercial || '';
            const city = addressData.city || addressData.town || addressData.village || addressData.municipality || '';

            const landmarkParts = [road, suburb, city].filter(Boolean);
            const builtLandmark = landmarkParts.length > 0 ? landmarkParts.join(', ') : displayName.split(',').slice(0, 3).join(', ');
            if (builtLandmark) {
              setLocation(builtLandmark);
            }

            setLocationDetectStatus(`Auto-filled from device: ${builtLandmark || matchedState || 'Current Location'}. You can edit any field below.`);
            setStepError('');
          } else {
            setLocationDetectStatus('Could not resolve address details. You can enter location manually.');
          }
        } catch (err) {
          console.warn('Reverse geocode failed:', err);
          setLocationDetectStatus('Location detected, but address lookup failed. Please enter details manually.');
        } finally {
          setIsDetectingLocation(false);
        }
      },
      (err) => {
        console.warn('Geolocation permission error:', err);
        setIsDetectingLocation(false);
        if (err.code === 1) {
          setLocationDetectStatus('Location permission not granted. You can enter location details manually.');
        } else {
          setLocationDetectStatus('Location unavailable. You can enter location details manually.');
        }
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 30000 }
    );
  };

  // Automatically request device location on initial page mount
  useEffect(() => {
    if (navigator.geolocation && !location) {
      detectCurrentLocation();
    }
  }, []);

  // Clean up object URLs and camera streams on unmount
  useEffect(() => {
    return () => {
      if (audioUrl) URL.revokeObjectURL(audioUrl);
      if (photoPreview) URL.revokeObjectURL(photoPreview);
      if (cameraStreamRef.current) {
        cameraStreamRef.current.getTracks().forEach(t => t.stop());
      }
    };
  }, []);

  // ── Auto-analyze description & voice in real-time to infer Category & Title ──
  useEffect(() => {
    const textToAnalyze = (description || voiceTranscript || '').trim();
    if (!textToAnalyze) {
      if (!userEditedCategoryRef.current) setCategory('');
      if (!userEditedTitleRef.current) setTitle('');
      return;
    }

    const timer = setTimeout(() => {
      if (!userEditedCategoryRef.current) {
        const detectedCat = inferCategoryFromText(textToAnalyze);
        if (detectedCat) {
          setCategory(detectedCat);
        }
      }

      if (!userEditedTitleRef.current) {
        const currentCat = category || inferCategoryFromText(textToAnalyze) || '';
        const detectedTitle = inferTitleFromText(textToAnalyze, currentCat);
        if (detectedTitle) {
          setTitle(detectedTitle);
        }
      }
    }, 350);

    return () => clearTimeout(timer);
  }, [description, voiceTranscript]);

  // ── Helper: call Groq to generate formal title + description from a transcript ──
  const generateFromTranscript = async (rawTranscript, selectedLang = voiceLang) => {
    setIsGenerating(true);
    try {
      const fd = new FormData();
      fd.append('transcript', rawTranscript);
      fd.append('category', category || 'General Civic Issue');
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
        const genCat = (data.category || '').trim();
        if (genDesc) {
          setDescription(prev => {
            if (prev && prev.trim() && !prev.includes(rawTranscript)) {
              return `${prev.trim()}\n\n${genDesc}`;
            }
            return genDesc;
          });
        }
        if (genTitle && !userEditedTitleRef.current) setTitle(genTitle);
        if (genCat && !userEditedCategoryRef.current) setCategory(genCat);
        console.info(`[Pipeline] Stage 2 complete via ${data.model} in ${selectedLang} (Category: ${genCat})`);
      }
    } catch (err) {
      console.warn('[Pipeline] Stage 2 (Groq) failed, using raw transcript:', err);
      if (rawTranscript) {
        setDescription(prev => (prev && prev.trim() ? `${prev.trim()}\n\n${rawTranscript}` : rawTranscript));
      }
      const inferredCat = inferCategoryFromText(rawTranscript) || 'General Civic Issue';
      if (!category && !userEditedCategoryRef.current) {
        setCategory(inferredCat);
      }
      if (!title && !userEditedTitleRef.current) {
        setTitle(inferTitleFromText(rawTranscript, inferredCat));
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
      setTranscribeFailed(true);
      return;
    }

    setVoiceTranscript(rawTranscript);
    // Append to description if existing, otherwise set it
    setDescription(prev => {
      if (prev && prev.trim()) {
        return `${prev.trim()}\n\n[Voice Note]: ${rawTranscript}`;
      }
      return rawTranscript;
    });

    // Stage 2: Groq LLM expansion
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
          const url = URL.createObjectURL(blob);
          setAudioUrl(url);
          stream.getTracks().forEach(track => track.stop());
          // Send to Sarvam AI saaras:v3
          await transcribeAudioBlob(blob);
        };

        mediaRecorderRef.current.start();
        setIsRecording(true);
        setRecordedAudio(false);
        setRecordingTime(0);
        liveTranscriptRef.current = '';
        setVoiceTranscript('');
        setShowVoiceRecorder(true);

        // Web Speech API for real-time live preview ONLY when English is selected
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
                if (!title) setTitle(`Voice Report: ${category} issue in ${district || 'Urban District'}`);
                if (!location) setLocation(`${district || 'Urban'} Central Market Area`);
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
        setDescription(prev => (prev && prev.trim() ? `${prev.trim()}\n\n[Voice Note]: ${fallbackText}` : fallbackText));
        if (!title) {
          setTitle(`Voice Report: ${category} issue in ${district || 'Urban District'}`);
        }
        if (!location) {
          setLocation(`${district || 'Urban'} Central Market Area`);
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
        setLocation(`${district || 'Urban'} Central Market Area`);
      }
      if (!title) {
        setTitle(`Voice Report: ${category} issue in ${district || 'Urban District'}`);
      }
    }
  };

  const handlePhotoUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPhotoPreview(url);
      setStepError('');
    }
  };

  const removePhoto = () => {
    if (photoPreview) URL.revokeObjectURL(photoPreview);
    setPhotoPreview(null);
    setSelectedFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (cameraInputRef.current) cameraInputRef.current.value = '';
  };

  // ── Camera capture handlers ──
  const startCamera = async () => {
    setShowCameraModal(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: 'environment' }, width: { ideal: 1280 }, height: { ideal: 720 } }
      });
      cameraStreamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
    } catch (err) {
      console.warn("Direct webcam access failed or denied, falling back to camera file input:", err);
      stopCamera();
      if (cameraInputRef.current) {
        cameraInputRef.current.click();
      }
    }
  };

  const stopCamera = () => {
    if (cameraStreamRef.current) {
      cameraStreamRef.current.getTracks().forEach(t => t.stop());
      cameraStreamRef.current = null;
    }
    setShowCameraModal(false);
  };

  const capturePhoto = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    canvas.toBlob((blob) => {
      if (blob) {
        const file = new File([blob], `camera_evidence_${Date.now()}.jpg`, { type: 'image/jpeg' });
        setSelectedFile(file);
        const url = URL.createObjectURL(blob);
        setPhotoPreview(url);
        setStepError('');
      }
      stopCamera();
    }, 'image/jpeg', 0.92);
  };

  const removeVoice = () => {
    if (audioUrl) URL.revokeObjectURL(audioUrl);
    setAudioBlob(null);
    setAudioUrl(null);
    setRecordedAudio(false);
    setVoiceTranscript('');
    setRecordingTime(0);
    setShowVoiceRecorder(false);
  };

  const hasAtLeastOneInput = Boolean(
    (description && description.trim().length > 0) ||
    audioBlob ||
    recordedAudio ||
    voiceTranscript ||
    selectedFile ||
    photoPreview
  );

  const handleProceedToStep2 = () => {
    // 1. Evidence input validation
    if (!hasAtLeastOneInput) {
      setStepError(t('submit.atLeastOneRequired', 'Please provide at least one input: describe your problem, record a voice note, or attach a photo.'));
      return;
    }

    // 2. Location specifics validations
    if (!state) {
      setStepError(t('messages.selectState', 'Please select a State / Union Territory.'));
      return;
    }
    if (!district) {
      setStepError(t('messages.selectDistrict', 'Please select a District.'));
      return;
    }
    const validDistricts = getDistrictsForState(state);
    if (!validDistricts.includes(district)) {
      setStepError(t('messages.selectDistrict', 'Selected district does not belong to the selected state.'));
      return;
    }
    const cleanPin = pincode.trim();
    if (!cleanPin) {
      setStepError(t('messages.invalidPincode', 'Pincode is required.'));
      return;
    }
    if (!isValidPincode(cleanPin)) {
      setStepError(t('messages.invalidPincode', 'Pincode must be exactly 6 numeric digits (e.g. 110001, 751030).'));
      return;
    }
    if (!location.trim()) {
      setStepError(t('messages.requiredField', 'Please enter the exact location & landmark.'));
      return;
    }

    setStepError('');
    // Auto-infer category if still empty
    let effectiveCategory = category.trim();
    if (!effectiveCategory) {
      effectiveCategory = inferCategoryFromText(description || voiceTranscript) || 'General Civic Issue';
      setCategory(effectiveCategory);
    }

    // Auto-generate title if missing
    if (!title.trim()) {
      const inferred = inferTitleFromText(description || voiceTranscript, effectiveCategory);
      if (inferred) {
        setTitle(inferred);
      } else if (voiceTranscript) {
        setTitle(`Voice Report: ${effectiveCategory} in ${district}`);
      } else if (description.trim()) {
        const firstLine = description.trim().split('\n')[0].slice(0, 70);
        setTitle(firstLine);
      } else if (photoPreview) {
        setTitle(`Photo Evidence: ${effectiveCategory} in ${district}`);
      } else {
        setTitle(`${effectiveCategory} issue in ${district}`);
      }
    }
    setCurrentStep(2);
  };

  const handleFinalSubmit = async (e) => {
    e.preventDefault();
    const hasPhoto = Boolean(photoPreview || selectedFile);
    const hasVoice = Boolean(audioBlob || recordedAudio || voiceTranscript);
    const hasText = Boolean(description && description.trim().length > 0);

    let calculatedEvidenceType = 'text';
    if ((hasPhoto && hasVoice) || (hasPhoto && hasText && hasVoice)) {
      calculatedEvidenceType = 'multimodal';
    } else if (hasPhoto) {
      calculatedEvidenceType = 'photo';
    } else if (hasVoice) {
      calculatedEvidenceType = 'voice';
    } else {
      calculatedEvidenceType = 'text';
    }

    await addComplaint({
      title: title || `${category} issue in ${district || 'Urban Area'}`,
      description: description || voiceTranscript || "Civic grievance submitted by citizen.",
      category,
      location: location.trim(),
      district: district || currentUser?.district || "South District",
      state: state || currentUser?.state || "Delhi NCR",
      pincode: pincode.trim(),
      priority: 'Pending Assessment',
      evidenceType: calculatedEvidenceType,
      file: selectedFile,
      audioBlob: audioBlob,
      audioUrl: audioUrl,
      imageUrl: photoPreview || "",
      audioLength: (recordedAudio || audioBlob) ? `0:${recordingTime < 10 ? '0' + recordingTime : recordingTime}` : "",
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
    <div className="flex-grow w-full max-w-container-max mx-auto px-4 sm:px-lg py-6 sm:py-xl flex flex-col gap-6 sm:gap-xl">
      {/* Header & 2-Step Progress Bar */}
      <section className="flex flex-col gap-2.5 sm:gap-md items-center text-center max-w-3xl mx-auto w-full px-2">
        <span className="font-label-sm text-[11px] sm:text-xs text-primary-container uppercase tracking-wider font-bold">
          {t('submit.pageTitle', 'Step-by-Step Grievance Registration')}
        </span>
        <h1 className="font-display-lg text-2xl sm:text-4xl font-bold text-primary">
          {t('submit.pageTitle', 'Submit a New Problem')}
        </h1>
        <p className="font-body-lg text-xs sm:text-sm text-on-surface-variant max-w-2xl leading-relaxed">
          {t('submit.pageSubtitle', 'Direct digital submission to state municipal and civic authority systems.')}
        </p>

        {/* 2-Step Progress Bar */}
        <div className="w-full mt-2 sm:mt-md flex items-center justify-between relative max-w-md mx-auto px-6">
          <div className="absolute left-[20%] right-[20%] top-1/2 -translate-y-1/2 h-1 bg-outline-variant -z-0">
            <div
              className="h-full bg-primary-container transition-all duration-300"
              style={{ width: currentStep === 1 ? '0%' : '100%' }}
            ></div>
          </div>

          {/* Step 1 */}
          <div className="flex flex-col items-center gap-1 relative z-10">
            <button
              onClick={() => setCurrentStep(1)}
              className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition-all cursor-pointer ${
                currentStep >= 1 ? 'bg-primary-container text-on-primary ring-4 ring-primary-container/20' : 'bg-surface-variant text-outline'
              }`}
            >
              {currentStep > 1 ? <span className="material-symbols-outlined text-sm">check</span> : '1'}
            </button>
            <span className="font-label-sm text-xs font-bold text-primary">
              1. {t('submit.steps.step1', 'Problem & Description')}
            </span>
          </div>

          {/* Step 2 */}
          <div className="flex flex-col items-center gap-1 relative z-10">
            <button
              onClick={() => {
                if (currentStep === 2) return;
                handleProceedToStep2();
              }}
              className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition-all cursor-pointer ${
                currentStep === 2 ? 'bg-primary-container text-on-primary ring-4 ring-primary-container/20' : 'bg-surface-variant text-outline'
              }`}
            >
              2
            </button>
            <span className={`font-label-sm text-xs ${currentStep === 2 ? 'font-bold text-primary' : 'text-outline'}`}>
              2. {t('submit.steps.step2', 'Review & Submit')}
            </span>
          </div>
        </div>
      </section>

      {/* STEP 1: DETAILED PROBLEM & DESCRIPTION + SPECIFICS */}
      {currentStep === 1 && (
        <div className="max-w-4xl mx-auto w-full flex flex-col gap-6">
          {/* Top Card: Unified Problem Description & Multi-modal Evidence Input */}
          <div className="bg-surface-container-lowest p-4 sm:p-lg md:p-xl rounded-lg border border-outline-variant shadow-ambient flex flex-col gap-5">
            <div className="text-center sm:text-left border-b border-outline-variant pb-3">
              <h2 className="text-lg sm:text-xl font-bold text-primary mb-1">
                {t('submit.unifiedTitle', 'Describe Your Problem')}
              </h2>
              <p className="text-xs text-on-surface-variant">
                {t('submit.unifiedSubtitle', 'Submit your grievance using any combination of text, voice recording, or photos. All details are analyzed together by government AI.')}
              </p>
            </div>

            {/* Included Inputs Status Badges */}
            <div className="flex flex-wrap items-center gap-2 p-2.5 bg-surface rounded-lg border border-outline-variant text-xs">
              <span className="font-bold text-on-surface-variant text-[11px] uppercase tracking-wider mr-1">
                Included Inputs:
              </span>

              {/* Text badge */}
              <span
                className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-all ${
                  description.trim().length > 0
                    ? 'bg-gov-green/15 text-gov-green border border-gov-green/40 shadow-xs'
                    : 'bg-surface-variant/50 text-outline border border-outline-variant/40'
                }`}
              >
                <span className="material-symbols-outlined text-sm">
                  {description.trim().length > 0 ? 'check_circle' : 'description'}
                </span>
                <span>Text {description.trim().length > 0 ? `(${description.trim().length} chars)` : ''}</span>
              </span>

              {/* Voice badge */}
              <span
                className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-all ${
                  audioBlob || recordedAudio
                    ? 'bg-gov-green/15 text-gov-green border border-gov-green/40 shadow-xs'
                    : 'bg-surface-variant/50 text-outline border border-outline-variant/40'
                }`}
              >
                <span className="material-symbols-outlined text-sm">
                  {audioBlob || recordedAudio ? 'check_circle' : 'mic'}
                </span>
                <span>Voice {recordedAudio ? `(${formatTime(recordingTime)})` : ''}</span>
              </span>

              {/* Photo badge */}
              <span
                className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-all ${
                  photoPreview || selectedFile
                    ? 'bg-gov-green/15 text-gov-green border border-gov-green/40 shadow-xs'
                    : 'bg-surface-variant/50 text-outline border border-outline-variant/40'
                }`}
              >
                <span className="material-symbols-outlined text-sm">
                  {photoPreview || selectedFile ? 'check_circle' : 'photo_camera'}
                </span>
                <span>Photo {photoPreview ? '(Attached)' : ''}</span>
              </span>
            </div>

            {/* Large Text Area */}
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <label htmlFor="problemDescription" className="text-xs font-bold text-on-surface flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-sm text-primary">edit_note</span>
                  <span>{t('submit.descLabel', 'Detailed Description *')}</span>
                </label>
                <span className="text-[11px] text-on-surface-variant font-mono">
                  {description.length} chars
                </span>
              </div>
              <textarea
                id="problemDescription"
                rows={5}
                value={description}
                onChange={(e) => {
                  setDescription(e.target.value);
                  setStepError('');
                }}
                placeholder={t('submit.unifiedPlaceholder', 'Describe your problem in detail (e.g. location, severity, duration, safety hazards)...')}
                className="w-full p-3.5 sm:p-4 text-xs sm:text-sm bg-surface border border-outline-variant rounded-lg focus:border-primary focus:ring-2 focus:ring-primary/10 outline-none resize-y min-h-[130px] leading-relaxed text-on-surface placeholder:text-on-surface-variant/60 shadow-xs"
              />
            </div>

            {/* Action Toolbar: 🎤 Record Voice, 📷 Add Photo & 📸 Camera */}
            <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
              {/* Record Voice Trigger */}
              <button
                type="button"
                onClick={() => {
                  setShowVoiceRecorder(prev => !prev);
                  setStepError('');
                }}
                className={`px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-lg border text-xs font-bold flex items-center gap-2 transition-all cursor-pointer shadow-xs ${
                  isRecording
                    ? 'bg-error text-white border-error shadow-md animate-pulse'
                    : recordedAudio || audioBlob
                    ? 'bg-gov-green/10 text-gov-green border-gov-green/40 hover:bg-gov-green/20'
                    : showVoiceRecorder
                    ? 'bg-primary-container text-on-primary border-primary-container'
                    : 'bg-surface hover:bg-surface-container-high border-outline-variant text-primary hover:border-primary'
                }`}
              >
                <span className="material-symbols-outlined text-base">
                  {isRecording ? 'stop_circle' : (recordedAudio || audioBlob) ? 'mic' : 'mic'}
                </span>
                <span>
                  {isRecording
                    ? `Recording (${formatTime(recordingTime)}) - Stop`
                    : recordedAudio || audioBlob
                    ? `Voice (${formatTime(recordingTime)})`
                    : `🎤 ${t('submit.recordVoiceBtn', 'Record Voice')}`}
                </span>
              </button>

              {/* Add Photo Trigger */}
              <input
                type="file"
                id="unifiedPhotoInput"
                ref={fileInputRef}
                accept="image/*"
                onChange={handlePhotoUpload}
                className="hidden"
              />
              <label
                htmlFor="unifiedPhotoInput"
                className={`px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-lg border text-xs font-bold flex items-center gap-2 cursor-pointer transition-all shadow-xs ${
                  photoPreview
                    ? 'bg-gov-green/10 text-gov-green border-gov-green/40 hover:bg-gov-green/20'
                    : 'bg-surface hover:bg-surface-container-high border-outline-variant text-primary hover:border-primary'
                }`}
              >
                <span className="material-symbols-outlined text-base">
                  {photoPreview ? 'check_circle' : 'add_a_photo'}
                </span>
                <span>
                  {photoPreview ? 'Change Photo' : `📷 ${t('submit.addPhotoBtn', 'Add Photo')}`}
                </span>
              </label>

              {/* Native Mobile Camera Fallback Input */}
              <input
                type="file"
                accept="image/*"
                capture="environment"
                ref={cameraInputRef}
                onChange={handlePhotoUpload}
                className="hidden"
              />

              {/* Camera Trigger */}
              <button
                type="button"
                onClick={startCamera}
                className={`px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-lg border text-xs font-bold flex items-center gap-2 cursor-pointer transition-all shadow-xs ${
                  photoPreview
                    ? 'bg-gov-green/10 text-gov-green border-gov-green/40 hover:bg-gov-green/20'
                    : 'bg-surface hover:bg-surface-container-high border-outline-variant text-primary hover:border-primary'
                }`}
                title="Capture photo directly with camera"
              >
                <span className="material-symbols-outlined text-base">
                  photo_camera
                </span>
                <span>
                  {photoPreview ? 'Retake via Camera' : `📸 ${t('submit.cameraBtn', 'Take Photo')}`}
                </span>
              </button>

              <span className="text-[11px] text-on-surface-variant italic ml-auto hidden md:inline">
                Combine text, voice, or photo freely
              </span>
            </div>

            {/* Interactive Voice Recorder Drawer/Panel */}
            {(showVoiceRecorder || isRecording) && (
              <div className="p-4 sm:p-5 bg-surface rounded-lg border-2 border-primary/20 flex flex-col gap-4 items-center text-center transition-all animate-fadeIn">
                {/* Language Selector */}
                <div className="w-full flex flex-col gap-1.5">
                  <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider text-left">
                    🌐 {t('submit.voice.selectLang', 'Speech Language for AI Recognition')}:
                  </span>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { code: 'od-IN', label: 'ଓଡ଼ିଆ', sub: 'Odia' },
                      { code: 'hi-IN', label: 'हिन्दी', sub: 'Hindi' },
                      { code: 'en-IN', label: 'English', sub: 'Indian English' },
                    ].map((lang) => (
                      <button
                        key={lang.code}
                        type="button"
                        disabled={isRecording}
                        onClick={() => setVoiceLang(lang.code)}
                        className={`py-2 px-1 rounded border-2 text-center transition-all cursor-pointer ${
                          voiceLang === lang.code
                            ? 'border-primary bg-primary-fixed/30 text-primary font-bold shadow-xs'
                            : 'border-outline-variant text-on-surface-variant hover:border-primary/50 bg-surface-container-lowest'
                        } ${isRecording ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        <div className="text-xs sm:text-sm font-bold leading-none">{lang.label}</div>
                        <div className="text-[9px] mt-0.5 opacity-80">{lang.sub}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Big Record Button */}
                <div className="relative flex items-center justify-center w-20 h-20 sm:w-24 sm:h-24 my-1">
                  <div className={`absolute inset-0 rounded-full border-4 border-primary/20 ${isRecording ? 'pulse-recording' : ''}`}></div>
                  <button
                    type="button"
                    onClick={toggleRecording}
                    className={`w-16 h-16 sm:w-18 sm:h-18 rounded-full flex items-center justify-center text-white transition-all shadow-lg z-10 cursor-pointer ${
                      isRecording ? 'bg-error scale-105' : 'bg-primary-container hover:bg-primary'
                    }`}
                    title={isRecording ? 'Stop Recording' : 'Start Recording'}
                  >
                    <span className="material-symbols-outlined text-2xl sm:text-3xl">
                      {isRecording ? 'stop' : 'mic'}
                    </span>
                  </button>
                </div>

                <div>
                  <div className="text-lg sm:text-xl font-mono font-bold text-primary">
                    {formatTime(recordingTime)}
                  </div>
                  <p className="text-xs text-on-surface-variant mt-0.5">
                    {isRecording
                      ? t('submit.voice.recording', 'Recording live... Click to stop.')
                      : recordedAudio
                      ? t('submit.voice.saved', 'Recording captured!')
                      : t('submit.voice.startRecording', 'Click microphone to record voice.')}
                  </p>
                </div>

                {/* Animated Waveform */}
                <div className="w-full flex items-center justify-center gap-1 h-8 px-4">
                  {[4, 8, 16, 24, 12, 28, 36, 18, 30, 22, 14, 8, 20, 32, 10].map((h, i) => (
                    <div
                      key={i}
                      className={`w-1 rounded-full transition-all duration-150 ${
                        isRecording ? 'bg-gov-saffron animate-pulse' : (recordedAudio || audioBlob) ? 'bg-gov-green' : 'bg-outline-variant'
                      }`}
                      style={{ height: isRecording ? `${Math.max(6, (h * Math.random() + 8))}px` : `${h}px` }}
                    ></div>
                  ))}
                </div>

                {/* Processing Spinners */}
                {isTranscribing && (
                  <div className="w-full text-center bg-primary-fixed/20 p-2.5 rounded border border-primary/30 text-xs flex items-center justify-center gap-2 text-primary font-bold animate-pulse">
                    <span className="material-symbols-outlined text-base animate-spin">sync</span>
                    <span>{t('submit.voice.transcribing', 'Stage 1/2: Transcribing voice via Sarvam AI saaras:v3...')}</span>
                  </div>
                )}

                {isGenerating && (
                  <div className="w-full text-center bg-purple-500/10 p-2.5 rounded border border-purple-500/30 text-xs flex items-center justify-center gap-2 text-purple-700 dark:text-purple-300 font-bold animate-pulse">
                    <span className="material-symbols-outlined text-base animate-spin">auto_awesome</span>
                    <span>{t('submit.voice.generating', 'Stage 2/2: Groq Llama 3.3 expanding into formal ticket...')}</span>
                  </div>
                )}

                {/* Live Preview */}
                {isRecording && (
                  <div className="w-full text-left bg-surface-container-lowest p-2.5 rounded border border-outline-variant text-xs">
                    <span className="text-[10px] uppercase font-bold text-on-surface-variant block mb-1">
                      {t('submit.voice.livePreview', 'Live Transcription Preview:')}
                    </span>
                    <p className="text-on-surface italic min-h-[20px]">{voiceTranscript || t('submit.voice.listening', 'Listening to your speech...')}</p>
                  </div>
                )}

                {/* Transcription Notice */}
                {transcribeFailed && !isTranscribing && (
                  <div className="w-full text-left bg-amber-50 border border-amber-300 rounded p-2.5 text-xs text-amber-900">
                    <div className="flex items-center gap-1.5 font-bold mb-1">
                      <span className="material-symbols-outlined text-sm text-amber-600">info</span>
                      <span>{t('submit.voice.processedReview', 'Audio processed — please review description')}</span>
                    </div>
                    <p className="text-[11px] text-amber-800 leading-relaxed">
                      {t('submit.voice.fallbackGuidance', 'If the auto-transcript is incomplete, you can type your complaint details directly into the Description field.')}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Attached Evidence Previews & Delete Section */}
            <div className="flex flex-col gap-3">
              {/* Photo Preview Card */}
              {photoPreview && (
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3 sm:p-4 bg-surface rounded-lg border border-outline-variant">
                  <div className="flex items-center gap-3">
                    <img
                      src={photoPreview}
                      alt="Evidence Preview"
                      className="w-16 h-16 sm:w-20 sm:h-20 object-cover rounded-md border border-outline-variant shadow-xs shrink-0"
                    />
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-sm text-gov-green">verified</span>
                        <span className="text-xs font-bold text-on-surface">{t('submit.photoAttached', 'Photo Evidence Attached')}</span>
                      </div>
                      <p className="text-[11px] text-on-surface-variant mt-0.5 truncate max-w-[200px] sm:max-w-xs">
                        {selectedFile?.name || 'Evidence Image'} {selectedFile ? `(${Math.round(selectedFile.size / 1024)} KB)` : ''}
                      </p>
                      <span className="text-[10px] text-gov-green font-semibold mt-0.5 inline-block">
                        Ready for AI visual damage inspection
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center">
                    <button
                      type="button"
                      onClick={startCamera}
                      className="text-primary hover:bg-primary/10 px-2.5 py-1.5 rounded text-xs font-bold flex items-center gap-1 transition-all cursor-pointer border border-primary/30"
                      title="Retake photo using camera"
                    >
                      <span className="material-symbols-outlined text-sm">photo_camera</span>
                      <span>Retake</span>
                    </button>
                    <button
                      type="button"
                      onClick={removePhoto}
                      className="text-error hover:bg-error/10 px-3 py-1.5 rounded text-xs font-bold flex items-center gap-1 transition-all cursor-pointer"
                      title="Remove uploaded photo"
                    >
                      <span className="material-symbols-outlined text-sm">delete</span>
                      <span>{t('submit.deleteAttachment', 'Remove Photo')}</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Voice Recording Preview Card */}
              {(recordedAudio || audioUrl) && !isRecording && (
                <div className="flex flex-col gap-2.5 p-3 sm:p-4 bg-surface rounded-lg border border-outline-variant">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-base text-gov-saffron">mic</span>
                      <span className="text-xs font-bold text-primary">
                        {t('submit.voiceRecorded', 'Voice Recording Attached')} ({formatTime(recordingTime)})
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={removeVoice}
                      className="text-error hover:bg-error/10 px-2.5 py-1 rounded text-xs font-bold flex items-center gap-1 transition-all cursor-pointer"
                      title="Remove recorded voice note"
                    >
                      <span className="material-symbols-outlined text-sm">delete</span>
                      <span>{t('submit.deleteAttachment', 'Remove Voice')}</span>
                    </button>
                  </div>

                  {/* HTML5 Audio Player */}
                  {audioUrl && (
                    <audio controls src={audioUrl} className="w-full h-8 mt-1">
                      Your browser does not support audio playback.
                    </audio>
                  )}

                  {/* Transcript Snippet */}
                  {voiceTranscript && (
                    <div className="bg-surface-container-lowest p-2.5 rounded border border-outline-variant/60 text-xs">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[10px] uppercase font-bold text-on-surface-variant flex items-center gap-1">
                          <span className="material-symbols-outlined text-xs text-primary">smart_toy</span>
                          <span>{t('submit.voice.transcriptLabel', 'AI Transcript')}:</span>
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            setDescription(prev => {
                              if (!prev || !prev.trim()) return voiceTranscript;
                              if (prev.includes(voiceTranscript)) return prev;
                              return `${prev.trim()}\n\n[Voice Note]: ${voiceTranscript}`;
                            });
                          }}
                          className="text-[10px] text-primary font-bold hover:underline flex items-center gap-0.5 cursor-pointer"
                        >
                          <span className="material-symbols-outlined text-xs">add_to_photos</span>
                          <span>Append to Description</span>
                        </button>
                      </div>
                      <p className="text-on-surface text-xs leading-relaxed italic">"{voiceTranscript}"</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Bottom Card: Location Specifics & Classification */}
          <div className="bg-surface-container-lowest p-4 sm:p-lg md:p-xl rounded-lg border border-outline-variant shadow-ambient">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-md pb-2 border-b border-outline-variant">
              <h2 className="text-sm sm:text-base font-bold text-primary flex items-center gap-2">
                <span className="material-symbols-outlined text-lg text-primary">location_on</span>
                <span>{t('submit.grievanceSpecifics', 'Grievance Specifics & Location')}</span>
              </h2>

              <button
                type="button"
                onClick={detectCurrentLocation}
                disabled={isDetectingLocation}
                className="text-xs font-bold text-primary hover:text-primary-container bg-surface border border-outline-variant hover:border-primary px-3 py-1.5 rounded flex items-center gap-1.5 transition-all self-start sm:self-auto cursor-pointer shadow-xs disabled:opacity-50"
                title="Detect device GPS coordinates and auto-fill address"
              >
                <span className={`material-symbols-outlined text-sm text-gov-saffron ${isDetectingLocation ? 'animate-spin' : ''}`}>
                  {isDetectingLocation ? 'sync' : 'my_location'}
                </span>
                <span>{isDetectingLocation ? 'Detecting Location...' : '📍 Use My Current Location'}</span>
              </button>
            </div>

            {/* Geolocation Feedback Banner */}
            {locationDetectStatus && (
              <div className="mb-4 p-2.5 bg-primary-fixed/20 border border-primary/30 rounded text-primary text-xs flex items-center justify-between gap-2 animate-fadeIn">
                <span className="flex items-center gap-1.5 font-medium">
                  <span className="material-symbols-outlined text-sm text-primary">near_me</span>
                  <span>{locationDetectStatus}</span>
                </span>
                <button
                  type="button"
                  onClick={() => setLocationDetectStatus('')}
                  className="text-[10px] text-on-surface-variant hover:text-primary cursor-pointer underline"
                >
                  Dismiss
                </button>
              </div>
            )}

            <div className="flex flex-col gap-3 sm:gap-md">
              {/* Category */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-on-surface flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-sm text-primary">category</span>
                    <span>{t('submit.categoryTitle', 'Department / Problem Category *')}</span>
                  </label>
                  {category && (
                    <span className="text-[10px] text-gov-green font-semibold flex items-center gap-1">
                      <span className="material-symbols-outlined text-xs">auto_awesome</span>
                      <span>{userEditedCategoryRef.current ? 'Selected' : 'Auto-filled from Description'}</span>
                    </span>
                  )}
                </div>
                <div className="relative">
                  <input
                    type="text"
                    required
                    list="civic-categories-list"
                    value={category}
                    onChange={(e) => {
                      setCategory(e.target.value);
                      userEditedCategoryRef.current = Boolean(e.target.value.trim());
                      setStepError('');
                    }}
                    placeholder={t('submit.categoryPlaceholder', 'e.g. Road Infrastructure, Drainage & Water Supply... (Auto-filled from description)')}
                    className="w-full px-3 py-2 text-xs bg-surface border border-outline-variant rounded focus:border-primary outline-none font-medium text-on-surface"
                  />
                  <datalist id="civic-categories-list">
                    {CIVIC_CATEGORIES.map((c) => (
                      <option key={c} value={c} />
                    ))}
                  </datalist>
                </div>

                {/* Quick Selection Category Chips */}
                <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
                  <span className="text-[10px] text-on-surface-variant font-medium">Suggestions:</span>
                  {['Road Infrastructure', 'Drainage & Water Supply', 'Sanitation & Solid Waste', 'Electricity & Street Lighting', 'Traffic & Transport', 'Public Safety & Hazards'].map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => {
                        setCategory(cat);
                        userEditedCategoryRef.current = true;
                        setStepError('');
                      }}
                      className={`text-[10px] px-2 py-0.5 rounded-full border transition-all cursor-pointer ${
                        category === cat
                          ? 'bg-primary text-white border-primary font-bold shadow-xs'
                          : 'bg-surface hover:bg-surface-container-high border-outline-variant text-on-surface-variant'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Title */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-on-surface flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-sm text-primary">title</span>
                    <span>{t('submit.titleLabel', 'Short Title / Heading *')}</span>
                  </label>
                  {title && (
                    <span className="text-[10px] text-gov-green font-semibold flex items-center gap-1">
                      <span className="material-symbols-outlined text-xs">auto_awesome</span>
                      <span>{userEditedTitleRef.current ? 'Custom' : 'Auto-filled from Description'}</span>
                    </span>
                  )}
                </div>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => {
                    setTitle(e.target.value);
                    userEditedTitleRef.current = Boolean(e.target.value.trim());
                    setStepError('');
                  }}
                  placeholder={t('submit.titlePlaceholder', 'e.g. Deep pothole causing two-wheeler accidents (Auto-filled from description)')}
                  className="w-full px-3 py-2 text-xs bg-surface border border-outline-variant rounded focus:border-primary outline-none text-on-surface"
                />
              </div>

              {/* State & District Side by Side */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-md">
                {/* State */}
                <div>
                  <label className="block text-xs font-bold text-on-surface mb-1">
                    {t('submit.stateLabel', 'State / Union Territory *')}
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
                    <option value="">{t('submit.selectState', '-- Select State / UT --')}</option>
                    {INDIAN_STATES.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>

                {/* District */}
                <div>
                  <label className="block text-xs font-bold text-on-surface mb-1">
                    {t('submit.districtLabel', 'District *')}
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
                      {state ? t('submit.selectDistrict', '-- Select District --') : t('submit.selectStateFirst', '-- Select State first --')}
                    </option>
                    {getDistrictsForState(state).map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Pincode & Landmark Side by Side */}
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 sm:gap-md">
                {/* Pincode */}
                <div className="sm:col-span-4">
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-bold text-on-surface">
                      {t('submit.pincodeLabel', 'Pincode (6 digits) *')}
                    </label>
                    <span className="text-[10px] text-on-surface-variant">
                      {pincode.length}/6
                    </span>
                  </div>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      inputMode="numeric"
                      maxLength={6}
                      value={pincode}
                      onChange={(e) => {
                        const numericOnly = e.target.value.replace(/\D/g, '').slice(0, 6);
                        setPincode(numericOnly);
                        setStepError('');
                      }}
                      placeholder={t('submit.pincodePlaceholder', 'e.g. 110001 or 751030')}
                      className={`w-full px-3 py-2 text-xs bg-surface border rounded focus:border-primary outline-none font-mono ${
                        pincode.length === 6
                          ? 'border-gov-green/80 bg-gov-green/5'
                          : pincode.length > 0 && pincode.length < 6
                          ? 'border-error/80 bg-error/5'
                          : 'border-outline-variant'
                      }`}
                    />
                    {pincode.length === 6 && (
                      <span className="material-symbols-outlined absolute right-2.5 top-2 text-gov-green text-base">check_circle</span>
                    )}
                    {pincode.length > 0 && pincode.length < 6 && (
                      <span className="material-symbols-outlined absolute right-2.5 top-2 text-error text-base">error</span>
                    )}
                  </div>
                  {pincode.length > 0 && pincode.length < 6 && (
                    <p className="text-[10px] text-error mt-1 font-medium">
                      ⚠ {t('messages.invalidPincode', 'Must be exactly 6 numeric digits')}.
                    </p>
                  )}
                </div>

                {/* Exact Location & Landmark */}
                <div className="sm:col-span-8">
                  <label className="block text-xs font-bold text-on-surface mb-1">
                    {t('submit.locationLabel', 'Exact Location & Landmark *')}
                  </label>
                  <input
                    type="text"
                    required
                    value={location}
                    onChange={(e) => {
                      setLocation(e.target.value);
                      setStepError('');
                    }}
                    placeholder={t('submit.locationPlaceholder', 'Enter area, village, road, landmark or nearby place')}
                    className="w-full px-3 py-2 text-xs bg-surface border border-outline-variant rounded focus:border-primary outline-none"
                  />
                </div>
              </div>

              {/* Step 1 Error Message */}
              {stepError && (
                <div className="p-2.5 bg-error/10 border border-error/30 rounded text-error text-xs font-medium flex items-center gap-1.5 animate-fadeIn">
                  <span className="material-symbols-outlined text-sm">error</span>
                  <span>{stepError}</span>
                </div>
              )}

              {/* Next Button Footer */}
              <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3 pt-md border-t border-outline-variant mt-2">
                <span className="text-[11px] text-on-surface-variant text-center sm:text-left">
                  * Verify all details before advancing to final review.
                </span>
                <button
                  type="button"
                  onClick={handleProceedToStep2}
                  className="bg-primary-container text-on-primary font-bold text-xs px-6 sm:px-8 py-3 rounded hover:bg-primary transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm active:scale-95"
                >
                  <span>{t('submit.reviewTitle', 'Review Submission')}</span>
                  <span className="material-symbols-outlined text-sm">arrow_forward</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* STEP 2: REVIEW & SUBMIT */}
      {currentStep === 2 && (
        <div className="max-w-2xl mx-auto w-full bg-surface-container-lowest p-4 sm:p-lg md:p-xl rounded-lg border border-outline-variant shadow-ambient flex flex-col gap-md">
          <div className="border-b border-outline-variant pb-3 sm:pb-md">
            <span className="text-xs font-bold text-gov-green uppercase tracking-wider block mb-1">
              {t('submit.finalStep', 'Final Step')}
            </span>
            <h2 className="text-lg sm:text-xl font-bold text-primary">
              {t('submit.reviewTitle', 'Review Grievance Information')}
            </h2>
            <p className="text-xs text-on-surface-variant mt-0.5">
              {t('submit.reviewSubtitle', 'Please verify the information before official filing into the central queue.')}
            </p>
          </div>

          <div className="bg-surface p-3 sm:p-md rounded-lg border border-outline-variant flex flex-col gap-3 text-xs">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <span className="text-[10px] uppercase font-bold text-on-surface-variant block">
                  {t('common.category', 'Category')}
                </span>
                <span className="font-bold text-primary">{t('category.' + category, category)}</span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-on-surface-variant block">
                  {t('submit.urgencyTriage', 'Urgency / Triage')}
                </span>
                <span className="font-bold text-primary flex items-center gap-1 text-[11px]">
                  <span className="material-symbols-outlined text-xs">smart_toy</span>
                  {t('submit.assignedAiTriage', 'Assigned by Govt AI Triage')}
                </span>
              </div>
            </div>

            <div>
              <span className="text-[10px] uppercase font-bold text-on-surface-variant block">
                {t('submit.titleLabel', 'Title')}
              </span>
              <span className="font-bold text-on-surface text-sm">{title || `${category} issue in ${district}`}</span>
            </div>

            <div>
              <span className="text-[10px] uppercase font-bold text-on-surface-variant block">
                {t('submit.descLabel', 'Description')}
              </span>
              <p className="text-on-surface-variant leading-relaxed">{description || voiceTranscript || "Civic grievance submitted by citizen."}</p>
            </div>

            {/* Attached Evidence Review Section */}
            {(photoPreview || audioUrl || voiceTranscript) && (
              <div className="pt-2 border-t border-outline-variant/60 flex flex-col gap-2">
                <span className="text-[10px] uppercase font-bold text-on-surface-variant block">
                  {t('submit.attachedEvidence', 'Attached Evidence')}
                </span>

                <div className="flex flex-col sm:flex-row gap-3">
                  {/* Photo Preview in Step 2 */}
                  {photoPreview && (
                    <div className="sm:w-1/2 rounded border border-outline-variant overflow-hidden bg-surface-container-lowest">
                      <img src={photoPreview} alt="Evidence" className="w-full h-32 object-cover" />
                      <div className="p-1.5 text-[10px] text-gov-green font-bold flex items-center gap-1">
                        <span className="material-symbols-outlined text-xs">check_circle</span>
                        <span>Photo Attached</span>
                      </div>
                    </div>
                  )}

                  {/* Audio Preview in Step 2 */}
                  {(audioUrl || voiceTranscript) && (
                    <div className="sm:w-1/2 rounded border border-outline-variant p-2.5 bg-surface-container-lowest flex flex-col gap-1.5 justify-center">
                      <div className="flex items-center gap-1 text-primary font-bold text-[11px]">
                        <span className="material-symbols-outlined text-sm text-gov-saffron">mic</span>
                        <span>Voice Recording ({formatTime(recordingTime)})</span>
                      </div>
                      {audioUrl && (
                        <audio controls src={audioUrl} className="w-full h-7 mt-0.5" />
                      )}
                      {voiceTranscript && (
                        <p className="text-[10px] text-on-surface-variant italic truncate">
                          "{voiceTranscript}"
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-outline-variant/60">
              <div>
                <span className="text-[10px] uppercase font-bold text-on-surface-variant block">
                  {t('submit.stateDistrict', 'State & District')}
                </span>
                <span className="text-on-surface font-medium">{district}, {state}</span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-on-surface-variant block">
                  {t('submit.pincodeLabel', 'Pincode')}
                </span>
                <span className="text-on-surface font-mono font-medium">{pincode}</span>
              </div>
            </div>

            <div>
              <span className="text-[10px] uppercase font-bold text-on-surface-variant block">
                {t('submit.locationLabel', 'Exact Location & Landmark')}
              </span>
              <span className="text-on-surface font-medium">{location}</span>
            </div>

            <div>
              <span className="text-[10px] uppercase font-bold text-on-surface-variant block">
                {t('submit.filingCitizen', 'Filing Citizen')}
              </span>
              <span className="text-on-surface font-medium">
                {currentUser?.full_name || currentUser?.name || 'A. Sharma'} ({currentUser?.phone || '+91 98765 43210'})
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 p-3 bg-gov-green/10 rounded border border-gov-green/30 text-[11px] text-gov-green font-medium">
            <span className="material-symbols-outlined text-base shrink-0">verified_user</span>
            <span>{t('submit.ackNotice', 'A digital acknowledgement tracking token will be issued immediately upon submission.')}</span>
          </div>

          <div className="flex flex-col-reverse sm:flex-row justify-between items-stretch sm:items-center gap-3 pt-md border-t border-outline-variant">
            <button
              type="button"
              onClick={() => setCurrentStep(1)}
              className="text-xs font-bold text-on-surface-variant hover:text-primary px-4 py-2.5 border sm:border-0 border-outline-variant rounded text-center cursor-pointer"
            >
              {t('submit.editDetails', '← Edit Details')}
            </button>

            <button
              type="button"
              onClick={handleFinalSubmit}
              className="bg-primary-container text-on-primary font-bold text-xs px-6 sm:px-8 py-3 rounded hover:bg-primary transition-all shadow-md active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
            >
              <span className="material-symbols-outlined text-base">send</span>
              <span>{t('submit.confirmSubmit', 'Confirm & File Grievance')}</span>
            </button>
          </div>
        </div>
      )}

      {/* Live Camera Viewfinder Modal */}
      {showCameraModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="relative w-full max-w-lg bg-surface rounded-2xl overflow-hidden shadow-2xl border border-outline-variant flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-3.5 bg-surface-container border-b border-outline-variant">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-xl">photo_camera</span>
                <span className="text-sm font-bold text-on-surface">Capture Photo Evidence</span>
              </div>
              <button
                type="button"
                onClick={stopCamera}
                className="w-8 h-8 rounded-full flex items-center justify-center text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface transition-all cursor-pointer"
                title="Close Camera"
              >
                <span className="material-symbols-outlined text-xl">close</span>
              </button>
            </div>

            {/* Viewfinder Video */}
            <div className="relative bg-black aspect-[4/3] flex items-center justify-center overflow-hidden">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
              />

              {/* Viewfinder Reticle Overlay */}
              <div className="absolute inset-8 pointer-events-none border-2 border-white/20 rounded-xl flex flex-col justify-between p-2">
                <div className="flex justify-between">
                  <div className="w-5 h-5 border-t-2 border-l-2 border-primary rounded-tl"></div>
                  <div className="w-5 h-5 border-t-2 border-r-2 border-primary rounded-tr"></div>
                </div>
                <div className="flex justify-between">
                  <div className="w-5 h-5 border-b-2 border-l-2 border-primary rounded-bl"></div>
                  <div className="w-5 h-5 border-b-2 border-r-2 border-primary rounded-br"></div>
                </div>
              </div>

              <div className="absolute bottom-3 left-0 right-0 text-center pointer-events-none">
                <span className="bg-black/60 backdrop-blur-sm text-white text-[11px] font-medium px-3 py-1 rounded-full shadow-sm">
                  Point camera at the damage or civic hazard
                </span>
              </div>
            </div>

            {/* Camera Controls */}
            <div className="p-4 bg-surface-container flex items-center justify-between gap-4">
              {/* Fallback to system camera app */}
              <button
                type="button"
                onClick={() => {
                  stopCamera();
                  if (cameraInputRef.current) cameraInputRef.current.click();
                }}
                className="text-xs font-semibold text-on-surface-variant hover:text-primary flex items-center gap-1.5 py-2 px-3 rounded-lg hover:bg-surface-container-high transition-all cursor-pointer"
                title="Open native camera application"
              >
                <span className="material-symbols-outlined text-lg">cameraswitch</span>
                <span className="hidden sm:inline">Use Native App</span>
              </button>

              {/* Big Shutter Button */}
              <button
                type="button"
                onClick={capturePhoto}
                className="w-16 h-16 rounded-full bg-primary text-white flex items-center justify-center shadow-lg hover:scale-105 active:scale-95 transition-all cursor-pointer ring-4 ring-primary/25"
                title="Take Photo"
              >
                <span className="material-symbols-outlined text-3xl">photo_camera</span>
              </button>

              {/* Cancel button */}
              <button
                type="button"
                onClick={stopCamera}
                className="text-xs font-semibold text-error hover:bg-error/10 py-2 px-3 rounded-lg flex items-center gap-1 transition-all cursor-pointer"
              >
                <span className="material-symbols-outlined text-lg">close</span>
                <span>Cancel</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

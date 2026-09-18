import React, { useState, useEffect, useMemo, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Tooltip, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix Vite Leaflet marker icon asset bundling paths
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
});

// Red Crisis Alert Marker Pin with pulsing aura and warning symbol
const crisisPinIcon = L.divIcon({
  className: 'crisis-alert-marker-pin',
  html: `
    <div style="position: relative; width: 38px; height: 46px; display: flex; align-items: center; justify-content: center; cursor: pointer;">
      <div style="position: absolute; width: 32px; height: 32px; border-radius: 50%; background: rgba(220, 38, 38, 0.4); animation: ping 2s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
      <svg width="36" height="44" viewBox="0 0 36 44" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M18 0C8.05888 0 0 8.05888 0 18C0 28.5 18 44 18 44C18 44 36 28.5 36 18C36 8.05888 27.9411 0 18 0Z" fill="#DC2626" stroke="#FFFFFF" stroke-width="2.2"/>
        <circle cx="18" cy="18" r="8" fill="#FFFFFF"/>
        <path d="M18 12V19M18 23H18.01" stroke="#DC2626" stroke-width="2.5" stroke-linecap="round"/>
      </svg>
    </div>
  `,
  iconSize: [38, 46],
  iconAnchor: [19, 44],
  popupAnchor: [0, -42]
});

// Selected Crisis Alert Marker Pin (Dual Highlight: Red Pin + Gold Target Ring)
const selectedCrisisPinIcon = L.divIcon({
  className: 'selected-crisis-marker-pin',
  html: `
    <div style="position: relative; width: 44px; height: 52px; display: flex; align-items: center; justify-content: center; cursor: pointer;">
      <div style="position: absolute; width: 38px; height: 38px; border-radius: 50%; background: rgba(245, 158, 11, 0.5); animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
      <svg width="42" height="50" viewBox="0 0 36 44" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M18 0C8.05888 0 0 8.05888 0 18C0 28.5 18 44 18 44C18 44 36 28.5 36 18C36 8.05888 27.9411 0 18 0Z" fill="#B91C1C" stroke="#F59E0B" stroke-width="3"/>
        <circle cx="18" cy="18" r="8" fill="#FFFFFF"/>
        <path d="M18 12V19M18 23H18.01" stroke="#B91C1C" stroke-width="2.6" stroke-linecap="round"/>
      </svg>
    </div>
  `,
  iconSize: [44, 52],
  iconAnchor: [22, 50],
  popupAnchor: [0, -48]
});

// Standard Selected Problem Marker Pin (Navy / Teal)
const selectedPinIcon = L.divIcon({
  className: 'selected-problem-marker-pin',
  html: `
    <div style="position: relative; width: 36px; height: 44px; display: flex; align-items: center; justify-content: center; cursor: pointer;">
      <svg width="36" height="44" viewBox="0 0 36 44" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M18 0C8.05888 0 0 8.05888 0 18C0 28.5 18 44 18 44C18 44 36 28.5 36 18C36 8.05888 27.9411 0 18 0Z" fill="#002147" stroke="#FFFFFF" stroke-width="2"/>
        <circle cx="18" cy="18" r="7" fill="#FFFFFF"/>
        <circle cx="18" cy="18" r="4" fill="#002147"/>
      </svg>
    </div>
  `,
  iconSize: [36, 44],
  iconAnchor: [18, 44],
  popupAnchor: [0, -40]
});

// In-memory geocoding cache to prevent redundant network requests
const geocodeCache = new Map();

// High-accuracy known GIS landmarks, districts, and pin codes
const KNOWN_LOCATIONS = [
  // ── Delhi NCR Landmark & High-Precision Spots ──
  {
    name: 'Connaught Place / Sansad Marg (110001)',
    keywords: [
      'connaught place', 'sansad marg', 'parliament street', '110001',
      'cp', 'rajiv chowk', 'barakhamba', 'mandi house', 'janpath', 'kg marg',
      'kasturba gandhi marg', 'tolstoy marg', 'baba kharak singh marg'
    ],
    coords: [28.6289, 77.2170]
  },
  {
    name: 'Central Delhi',
    keywords: ['central delhi', 'karol bagh', 'pahar ganj', 'daryaganj', 'chandni chowk', 'patel nagar', 'rajendra nagar', '110005', '110006', '110002'],
    coords: [28.6415, 77.2025]
  },
  {
    name: 'India Gate / Central Secretariat',
    keywords: ['india gate', 'parliament', 'sansad bhavan', 'kartavya path', 'north block', 'south block', 'rashtrapati bhavan', '110004'],
    coords: [28.6143, 77.2095]
  },
  {
    name: 'East Delhi',
    keywords: ['east delhi', 'ward 12', 'mayur vihar', 'laxmi nagar', 'preet vihar', 'patparganj', 'gandhi nagar', 'anand vihar', 'nirman vihar', 'shakarpur', '110092'],
    coords: [28.6280, 77.2950]
  },
  {
    name: 'South Delhi',
    keywords: ['south delhi', 'saket', 'hauz khas', 'greater kailash', 'malviya nagar', 'nehru place', 'green park', 'defence colony', 'safdarjung', 'mehrauli', '110017'],
    coords: [28.5244, 77.2100]
  },
  {
    name: 'West Delhi',
    keywords: ['west delhi', 'janakpuri', 'rajouri garden', 'tilak nagar', 'punjabi bagh', 'vikaspuri', 'uttam nagar', 'paschim vihar', 'tagore garden', '110058'],
    coords: [28.6219, 77.0878]
  },
  {
    name: 'North Delhi',
    keywords: ['north delhi', 'civil lines', 'model town', 'kashmere gate', 'kamla nagar', 'timarpur', 'burari', 'alipur', 'kingsway camp', '110054'],
    coords: [28.6830, 77.2180]
  },
  {
    name: 'Shahdara',
    keywords: ['shahdara', 'seelampur', 'dilshad garden', 'mansarovar park', 'yamuna vihar', 'geeta colony', 'bhajanpura', '110032'],
    coords: [28.6730, 77.2880]
  },
  {
    name: 'North West Delhi / Rohini',
    keywords: ['rohini', 'pitampura', 'shalimar bagh', 'mangolpuri', 'sultanpuri', 'bawana', 'narela', '110085'],
    coords: [28.7140, 77.1180]
  },
  {
    name: 'South West Delhi / Dwarka',
    keywords: ['dwarka', 'south west delhi', 'palam', 'najafgarh', 'matiala', 'kakrola', 'dabri', '110075'],
    coords: [28.5921, 77.0460]
  },
  {
    name: 'South East Delhi / Okhla',
    keywords: ['okhla', 'jamia', 'south east delhi', 'sarita vihar', 'badarpur', 'kalkaji', 'govindpuri', 'jasola', '110025'],
    coords: [28.5355, 77.2732]
  },
  {
    name: 'Noida / Greater Noida',
    keywords: ['noida', 'sector 62', 'sector 18', 'sector 15', 'greater noida', '201301'],
    coords: [28.5700, 77.3200]
  },
  {
    name: 'Gurgaon / Gurugram',
    keywords: ['gurgaon', 'gurugram', 'cyber city', 'dlf', 'sohna road', 'mg road', '122001'],
    coords: [28.4595, 77.0266]
  },
  {
    name: 'Delhi NCR Capital',
    keywords: ['delhi ncr', 'delhi', 'new delhi', 'ncr'],
    coords: [28.6139, 77.2090]
  },

  // ── Odisha / Bhubaneswar / Khordha / Puri Locations ──
  {
    name: 'GITA Autonomous / Janla / Madanpur',
    keywords: ['gita autonomous', 'gita college', 'madanpur', 'janla', 'badaraghunthpur', 'badaraghunathpur', 'bbar'],
    coords: [20.2166, 85.7380]
  },
  {
    name: 'Khordha / Jatni / IIT Bhubaneswar',
    keywords: ['khordha', 'khurda', 'jatni', 'iit bhubaneswar', 'argul', '752050'],
    coords: [20.1809, 85.6212]
  },
  {
    name: 'Puri / Jagannath Temple',
    keywords: ['jagannath temple', 'puri', 'grand road', 'swargadwar', '752054', '752001'],
    coords: [19.8135, 85.8312]
  },
  {
    name: 'Nabarangpur / Papadahandi',
    keywords: ['papadahandi', 'nabarangpur', 'nowrangpur', '764071'],
    coords: [19.2272, 82.5583]
  },
  {
    name: 'Kendrapara',
    keywords: ['kendrapara', 'kendrapada', 'derabish', 'pattamundai', '754211'],
    coords: [20.4990, 86.4220]
  },
  {
    name: 'Patia / KIIT / Infocity',
    keywords: ['patia', 'kiit', 'infocity', 'chandrasekharpur', 'kalarahanga', '751024'],
    coords: [20.3533, 85.8189]
  },
  {
    name: 'Nayapalli / Jaydev Vihar',
    keywords: ['nayapalli', 'irc village', 'jaydev vihar', 'crp square', '751015'],
    coords: [20.3015, 85.8190]
  },
  {
    name: 'Saheed Nagar / Vani Vihar',
    keywords: ['saheed nagar', 'vani vihar', 'acharya vihar', 'satya nagar', '751007'],
    coords: [20.2885, 85.8453]
  },
  {
    name: 'Khandagiri / Baramunda',
    keywords: ['khandagiri', 'amri', 'udayagiri', 'dumduma', 'aiginia', 'baramunda', '751030'],
    coords: [20.2602, 85.7877]
  },
  {
    name: 'Master Canteen / Rajmahal',
    keywords: ['master canteen', 'bapuji nagar', 'ashok nagar', 'rajmahal', '751009'],
    coords: [20.2660, 85.8390]
  },
  {
    name: 'Rasulgarh / Mancheswar',
    keywords: ['rasulgarh', 'mancheswar', 'bomikhal', 'jharpada', 'laxmisagar', '751010'],
    coords: [20.3020, 85.8640]
  },
  {
    name: 'Old Town / Lingaraj',
    keywords: ['old town', 'lingaraj', 'kapileswar', 'samantarapur', '751002'],
    coords: [20.2380, 85.8340]
  },
  {
    name: 'Cuttack',
    keywords: ['cuttack', 'badambadi', 'chauliaganj', 'chhatrabazar', 'scb medical', '753001'],
    coords: [20.4625, 85.8828]
  },
  {
    name: 'Bhubaneswar Central',
    keywords: ['bhubaneswar', 'bbsr', 'odisha'],
    coords: [20.2961, 85.8245]
  },
  {
    name: 'Rourkela',
    keywords: ['rourkela', 'sundargarh', '769001'],
    coords: [22.2604, 84.8536]
  },
  {
    name: 'Berhampur / Ganjam',
    keywords: ['berhampur', 'brahmapur', 'ganjam', '760001'],
    coords: [19.3150, 84.7941]
  },
  {
    name: 'Sambalpur',
    keywords: ['sambalpur', 'burla', 'hirakud', '768001'],
    coords: [21.4669, 83.9812]
  },
  {
    name: 'Balasore',
    keywords: ['balasore', 'baleshwar', '756001'],
    coords: [21.4934, 86.9135]
  }
];

function findBestKnownLocation(text, minLen = 3) {
  if (!text) return null;
  const normalized = ' ' + text.toLowerCase().replace(/[,\-\/\.]/g, ' ') + ' ';
  let bestMatch = null;
  let maxScore = 0;

  for (const item of KNOWN_LOCATIONS) {
    for (const kw of item.keywords) {
      if (kw.length < minLen) continue;
      if (normalized.includes(' ' + kw + ' ') || normalized.includes(kw)) {
        const score = kw.length;
        if (score > maxScore) {
          maxScore = score;
          bestMatch = { item, keyword: kw, score };
        }
      }
    }
  }
  return bestMatch;
}

function getHashOffset(str = '', scale = 0.012) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  const latOffset = ((Math.abs(hash) % 1000) / 1000 - 0.5) * scale;
  const lngOffset = ((Math.abs(hash >> 3) % 1000) / 1000 - 0.5) * scale;
  return [latOffset, lngOffset];
}

// Helper to geocode a single problem record with multi-tier hierarchical matching, caching and deterministic fallbacks
async function resolveCoordinates(p, signal) {
  if (!p) return [28.6139, 77.2090];

  // 1. Direct coordinates
  const rawLat = p.latitude ?? p.lat;
  const rawLng = p.longitude ?? p.lng;
  if (rawLat !== undefined && rawLng !== undefined && rawLat !== null && rawLng !== null) {
    const lat = parseFloat(rawLat);
    const lng = parseFloat(rawLng);
    if (!isNaN(lat) && !isNaN(lng) && (lat !== 0 || lng !== 0)) {
      return [lat, lng];
    }
  }

  const locText = (p.location || '').trim();
  const districtText = (p.district || '').trim();
  const stateText = (p.state || '').trim();
  const titleText = (p.title || '').trim();
  const idStr = p.display_id || p.id || 'point';

  // 2. Extract PIN code from location, district, or title
  const pinMatch = `${locText} ${districtText} ${titleText}`.match(/\b(11\d{4}|7[5-7]\d{4}|20\d{4}|12\d{4})\b/);
  if (pinMatch) {
    const pin = pinMatch[1];
    for (const item of KNOWN_LOCATIONS) {
      if (item.keywords.includes(pin)) {
        const [oLat, oLng] = getHashOffset(idStr + pin, 0.005);
        return [item.coords[0] + oLat, item.coords[1] + oLng];
      }
    }
  }

  // 3. PRIORITY 1: Match against user's specific reported address / landmark (p.location)
  // Specific address text MUST always take precedence over broader district/state fields
  if (locText) {
    const locMatch = findBestKnownLocation(locText);
    if (locMatch) {
      const [oLat, oLng] = getHashOffset(idStr + locMatch.keyword, 0.006);
      return [locMatch.item.coords[0] + oLat, locMatch.item.coords[1] + oLng];
    }
  }

  // 4. PRIORITY 2: Match against grievance title (often contains specific landmarks / areas)
  if (titleText) {
    const titleMatch = findBestKnownLocation(titleText, 4);
    if (titleMatch) {
      const [oLat, oLng] = getHashOffset(idStr + titleMatch.keyword, 0.006);
      return [titleMatch.item.coords[0] + oLat, titleMatch.item.coords[1] + oLng];
    }
  }

  // 5. PRIORITY 3: Online Nominatim OpenStreetMap query for unmapped specific locations
  if (locText) {
    const cleanQuery = locText
      .replace(/[\/\\]/g, ', ')
      .replace(/-\s*\d{6}/g, '')
      .replace(/\s+/g, ' ')
      .trim();

    if (cleanQuery) {
      if (geocodeCache.has(cleanQuery)) {
        return geocodeCache.get(cleanQuery);
      }
      try {
        const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(cleanQuery)}&limit=1`;
        const res = await fetch(url, { signal, headers: { 'Accept-Language': 'en' } });
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data) && data.length > 0 && data[0].lat && data[0].lon) {
            const resolved = [parseFloat(data[0].lat), parseFloat(data[0].lon)];
            geocodeCache.set(cleanQuery, resolved);
            return resolved;
          }
        }
      } catch {
        // Network or abort error
      }
    }
  }

  // 6. PRIORITY 4: Match against District and State
  const districtStateText = `${districtText} ${stateText}`.trim();
  if (districtStateText) {
    const distMatch = findBestKnownLocation(districtStateText);
    if (distMatch) {
      const [oLat, oLng] = getHashOffset(idStr + distMatch.keyword, 0.012);
      return [distMatch.item.coords[0] + oLat, distMatch.item.coords[1] + oLng];
    }
  }

  // 7. Regional Default Center (Delhi NCR / Odisha fallback)
  const allText = `${locText} ${districtText} ${stateText} ${titleText}`.toLowerCase();
  const [defLat, defLng] = (allText.includes('odisha') || allText.includes('bhubaneswar') || allText.includes('puri') || allText.includes('cuttack'))
    ? [20.2961, 85.8245]
    : [28.6139, 77.2090];
  const [oLat, oLng] = getHashOffset(idStr + 'civic_fallback', 0.015);
  return [defLat + oLat, defLng + oLng];
}

// Slightly offset duplicate coordinates so all markers at the same location remain individually visible and clickable
function offsetDuplicateCoordinates(items) {
  const coordCounts = new Map();
  return items.map((item) => {
    if (!item.coords) return item;
    const key = `${item.coords[0].toFixed(4)},${item.coords[1].toFixed(4)}`;
    const count = coordCounts.get(key) || 0;
    coordCounts.set(key, count + 1);

    if (count === 0) return item;

    // Small radial offset (~18 meters per duplicate)
    const angle = (count * 2 * Math.PI) / 6;
    const distance = 0.00018 * count;
    return {
      ...item,
      coords: [
        item.coords[0] + distance * Math.cos(angle),
        item.coords[1] + distance * Math.sin(angle)
      ],
      isOffset: true
    };
  });
}

// Controller to smoothly pan or fit bounds based on active markers
function MapViewController({ selectedCoords, crisisPoints }) {
  const map = useMap();
  useEffect(() => {
    if (selectedCoords && selectedCoords.length === 2 && !isNaN(selectedCoords[0]) && !isNaN(selectedCoords[1])) {
      map.flyTo(selectedCoords, 14, { animate: true, duration: 1.0 });
      return;
    }

    if (crisisPoints && crisisPoints.length > 0) {
      if (crisisPoints.length === 1 && crisisPoints[0].coords) {
        map.flyTo(crisisPoints[0].coords, 13, { animate: true, duration: 1.0 });
      } else {
        const validCoords = crisisPoints.map((p) => p.coords).filter(c => c && c.length === 2);
        if (validCoords.length > 0) {
          const bounds = L.latLngBounds(validCoords);
          map.fitBounds(bounds, { padding: [45, 45], maxZoom: 14 });
        }
      }
    }
  }, [selectedCoords, crisisPoints, map]);
  return null;
}

export default function ProblemLocationMap({
  problem = null,
  alertProblems = [],
  headerAction = null,
  onSelectProblem = null
}) {
  const [selectedCoords, setSelectedCoords] = useState(null);
  const [crisisPoints, setCrisisPoints] = useState([]);
  const [loading, setLoading] = useState(false);
  const abortControllerRef = useRef(null);

  // 1. Resolve coordinates for single selected problem
  useEffect(() => {
    if (!problem || (!problem.id && !problem.display_id && !problem.title)) {
      setSelectedCoords(null);
      return;
    }

    const controller = new AbortController();
    resolveCoordinates(problem, controller.signal).then((resolved) => {
      setSelectedCoords(resolved);
    });

    return () => controller.abort();
  }, [problem]);

  // 2. Resolve coordinates for Crisis Alert problems (Next 48 Hours)
  useEffect(() => {
    if (!alertProblems || alertProblems.length === 0) {
      setCrisisPoints([]);
      return;
    }

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    const controller = new AbortController();
    abortControllerRef.current = controller;
    setLoading(true);

    const resolveAllAlerts = async () => {
      const results = await Promise.all(
        alertProblems.map(async (alert) => {
          const coords = await resolveCoordinates(alert, controller.signal);
          return {
            id: alert.id || alert.display_id,
            problem: alert,
            coords
          };
        })
      );

      // Keep valid coordinates
      const validPoints = results.filter((r) => r.coords !== null && Array.isArray(r.coords));
      // Apply offset for duplicate locations
      const formattedPoints = offsetDuplicateCoordinates(validPoints);

      if (!controller.signal.aborted) {
        setCrisisPoints(formattedPoints);
        setLoading(false);
      }
    };

    resolveAllAlerts();

    return () => {
      controller.abort();
    };
  }, [alertProblems]);

  // Determine initial center coordinate
  const initialCenter = useMemo(() => {
    if (selectedCoords && Array.isArray(selectedCoords)) return selectedCoords;
    if (crisisPoints.length > 0 && crisisPoints[0]?.coords) return crisisPoints[0].coords;
    return [28.6139, 77.2090]; // Default center (New Delhi / State Capital)
  }, [selectedCoords, crisisPoints]);

  const selectedProblemId = problem?.display_id || problem?.id;
  const isSelectedCrisis = crisisPoints.some((p) => p.id === selectedProblemId);

  return (
    <div className="w-full bg-surface-container-lowest border border-outline-variant rounded-xl p-md md:p-lg shadow-ambient mb-lg overflow-hidden flex flex-col">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-md border-b border-outline-variant pb-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-xl text-error">location_on</span>
            <h2 className="text-base font-bold text-primary">
              Problem Location Map
            </h2>

            {/* Crisis Alerts Marker Count Tag */}
            {crisisPoints.length > 0 && (
              <span className="bg-error/10 text-error border border-error/30 text-[10px] font-bold font-mono px-2 py-0.5 rounded-full flex items-center gap-1.5 shadow-sm">
                <span className="w-1.5 h-1.5 rounded-full bg-error animate-ping"></span>
                🔴 {crisisPoints.length} Crisis Alert Pin{crisisPoints.length > 1 ? 's' : ''} Plotted
              </span>
            )}

            {/* Single Selected Marker Indicator */}
            {selectedCoords && !isSelectedCrisis && (
              <span className="bg-primary/10 text-primary border border-primary/20 text-[10px] font-bold font-mono px-2 py-0.5 rounded-full flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-gov-green"></span>
                1 Problem Inspected
              </span>
            )}
          </div>
          <p className="text-xs text-on-surface-variant mt-1">
            GIS spatial mapping of crisis early warnings and selected civic problems.
          </p>
        </div>

        {/* Header Controls & Selected Problem Pill */}
        <div className="flex flex-wrap items-center gap-2">
          {headerAction}
          {problem && (
            <div className="text-[11px] font-mono font-bold bg-surface border border-outline-variant px-3 py-1 rounded text-primary flex items-center gap-1.5">
              <span className="text-on-surface-variant">Inspecting:</span>
              <span className="text-primary font-black">#{selectedProblemId}</span>
            </div>
          )}
        </div>
      </div>

      {/* Map Container with explicit height */}
      <div className="relative w-full h-[440px] min-h-[440px] rounded-lg overflow-hidden border border-outline-variant bg-[#f1f4f9]">
        {/* Loading Overlay */}
        {loading && (
          <div className="absolute top-2 right-2 z-[1000] bg-surface/90 backdrop-blur-sm border border-outline-variant px-3 py-1.5 rounded-md shadow-md flex items-center gap-2 text-xs font-semibold text-primary">
            <div className="w-3.5 h-3.5 border-2 border-gov-saffron border-t-transparent rounded-full animate-spin"></div>
            <span>Plotting crisis alerts on map...</span>
          </div>
        )}

        <MapContainer
          center={initialCenter}
          zoom={12}
          scrollWheelZoom={true}
          style={{ height: '100%', width: '100%' }}
          className="z-0"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {/* View & bounds controller */}
          <MapViewController selectedCoords={selectedCoords} crisisPoints={crisisPoints} />

          {/* 1. Red Crisis Alert Markers */}
          {crisisPoints.map((item) => {
            const p = item.problem;
            const pId = p.display_id || p.id || 'N/A';
            const isSelected = pId === selectedProblemId;
            const priority = p.priority || 'Critical';
            const severity = p.severity ?? p.score ?? 85;

            return (
              <Marker
                key={`crisis-pin-${pId}`}
                position={item.coords}
                icon={isSelected ? selectedCrisisPinIcon : crisisPinIcon}
                eventHandlers={{
                  click: () => {
                    if (onSelectProblem) onSelectProblem(pId);
                  }
                }}
              >
                  {/* Hover Tooltip (Rule 5: hover shows details) */}
                  <Tooltip direction="top" offset={[0, -40]} opacity={0.95}>
                    <div className="font-sans text-[11px] p-0.5">
                      <div className="font-bold text-error flex items-center gap-1">
                        <span>⚠️ #{pId}</span>
                        <span>({severity}/100)</span>
                      </div>
                      <div className="font-semibold text-primary line-clamp-1">{p.title}</div>
                      <div className="text-on-surface-variant text-[10px]">{p.location || 'Location specified'}</div>
                    </div>
                  </Tooltip>

                  {/* Click Popup with full detailed fields (Rule 5: title, ID, category, priority, status, location) */}
                  <Popup minWidth={290} maxWidth={320}>
                    <div className="p-1 text-xs text-on-surface leading-relaxed">
                      <div className="border-b border-outline-variant pb-1.5 mb-2">
                        <div className="flex items-center justify-between gap-1 mb-1">
                          <span className="bg-error/15 text-error border border-error/30 text-[10px] font-bold font-mono px-2 py-0.5 rounded flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-error animate-ping"></span>
                            CRISIS ALERT
                          </span>
                          <span className="text-[10px] font-bold bg-error text-white px-2 py-0.5 rounded">
                            Score: {severity}/100
                          </span>
                        </div>
                        <h4 className="font-bold text-sm text-primary line-clamp-2">
                          {p.title}
                        </h4>
                      </div>

                      <div className="space-y-1.5 text-[11px]">
                        <div>
                          <span className="font-semibold text-on-surface-variant">Problem ID: </span>
                          <span className="font-mono font-bold text-primary">#{pId}</span>
                        </div>

                        <div>
                          <span className="font-semibold text-on-surface-variant">Description: </span>
                          <span className="text-on-surface line-clamp-3">{p.description}</span>
                        </div>

                        <div>
                          <span className="font-semibold text-on-surface-variant">Category: </span>
                          <span className="text-on-surface font-medium">{p.category || 'Civic Infrastructure'}</span>
                        </div>

                        <div>
                          <span className="font-semibold text-on-surface-variant">Specified Location: </span>
                          <span className="text-on-surface font-medium">{p.location || 'Reported Location'}</span>
                        </div>

                        <div className="grid grid-cols-2 gap-1 pt-1 text-[10px] border-t border-outline-variant/60">
                          <div>
                            <span className="text-on-surface-variant">Priority: </span>
                            <span className="font-bold text-error">{priority}</span>
                          </div>
                          <div>
                            <span className="text-on-surface-variant">Status: </span>
                            <span className="font-bold text-primary">{p.status || 'Action Required'}</span>
                          </div>
                        </div>

                        {p.alertAction && (
                          <div className="pt-1 text-[10px] bg-error/5 p-1.5 rounded border border-error/20 text-error font-medium">
                            <span className="font-bold">Directive: </span>
                            {p.alertAction}
                          </div>
                        )}
                      </div>
                    </div>
                  </Popup>
                </Marker>
              );
            })}

            {/* 2. Standalone Selected Problem Marker (if selected and not already rendered as a crisis alert) */}
            {selectedCoords && !isSelectedCrisis && (
              <Marker position={selectedCoords} icon={selectedPinIcon}>
                <Popup minWidth={280} maxWidth={320}>
                  <div className="p-1 text-xs text-on-surface leading-relaxed">
                    <div className="border-b border-outline-variant pb-1.5 mb-2">
                      <div className="flex items-center justify-between gap-1 mb-0.5">
                        <span className="font-mono text-[10px] font-bold bg-primary/10 text-primary px-1.5 py-0.5 rounded">
                          #{selectedProblemId}
                        </span>
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-primary/10 text-primary">
                          {problem?.priority || 'Normal'}
                        </span>
                      </div>
                      <h4 className="font-bold text-sm text-primary line-clamp-2">
                        {problem?.title || 'Civic Problem'}
                      </h4>
                    </div>

                    <div className="space-y-1.5 text-[11px]">
                      <div>
                        <span className="font-semibold text-on-surface-variant">Description: </span>
                        <span className="text-on-surface line-clamp-3">{problem?.description || 'No description'}</span>
                      </div>
                      <div>
                        <span className="font-semibold text-on-surface-variant">Category: </span>
                        <span className="text-on-surface">{problem?.category || 'General Issue'}</span>
                      </div>
                      <div>
                        <span className="font-semibold text-on-surface-variant">Specified Location: </span>
                        <span className="text-on-surface font-medium">{problem?.location || 'Location not specified'}</span>
                      </div>
                      <div className="grid grid-cols-2 gap-1 pt-1 text-[10px] border-t border-outline-variant/60">
                        <div>
                          <span className="text-on-surface-variant">Status: </span>
                          <span className="font-bold text-primary">{problem?.status || 'Submitted'}</span>
                        </div>
                        <div>
                          <span className="text-on-surface-variant">Date: </span>
                          <span className="font-medium text-on-surface">{problem?.dateFiled || 'N/A'}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </Popup>
              </Marker>
            )}
          </MapContainer>
        </div>
      </div>
    );
  }

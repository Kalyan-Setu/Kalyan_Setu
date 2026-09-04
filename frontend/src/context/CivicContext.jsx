import React, { createContext, useContext, useState, useEffect } from 'react';

const CivicContext = createContext();

export const API_BASE = 'http://localhost:8000/api';

const INITIAL_COMPLAINTS = [
  {
    id: "PP24891",
    display_id: "PP24891",
    title: "Large potholes near Main Market",
    description: "Deep potholes on the main access road creating severe traffic congestion and multiple two-wheeler accidents during monsoon rains. Immediate resurfacing required.",
    category: "Road Infrastructure",
    location: "Main Market Road, Sector 4",
    district: "South District",
    state: "Delhi NCR",
    reportedBy: "A. Sharma",
    contactPhone: "+91 98765 43210",
    dateFiled: "01 Sep 2026",
    timeFiled: "09:30 AM",
    status: "In Progress",
    statusLabel: "Proceed to Action",
    priority: "High",
    assignedDepartment: "Public Works Department (PWD)",
    assignedOfficer: "Er. Rajesh Kumar (Exec. Engineer)",
    budget: "₹4,50,000",
    evidenceType: "photo",
    imageUrl: "https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=600&auto=format&fit=crop&q=80",
    aiSeverityScore: 88,
    sentiment: "High Urgency",
    actionNotes: "Work order #WO-9921 issued. Asphalt mixing team deployed on site. Expected completion within 48 hours.",
    timeline: [
      { step: 1, title: "Submitted", date: "01 Sep 2026", time: "09:30 AM", note: "Grievance registered via Kalyan Setu Web Portal.", completed: true },
      { step: 2, title: "Under Review", date: "01 Sep 2026", time: "11:15 AM", note: "AI triage categorized as High Priority Road Hazard. Verified by Central Grievance Cell.", completed: true },
      { step: 3, title: "Action Assigned", date: "01 Sep 2026", time: "02:45 PM", note: "Forwarded to PWD South Division. Officer Er. Rajesh Kumar assigned.", completed: true },
      { step: 4, title: "In Progress", date: "02 Sep 2026", time: "08:00 AM", note: "Road inspection conducted. Repair crew dispatched with heavy machinery.", completed: true, current: true },
      { step: 5, title: "Resolved", date: "Pending", time: "-", note: "Final inspection and citizen feedback verification pending.", completed: false }
    ]
  },
  {
    id: "PP24892",
    display_id: "PP24892",
    title: "Severe water logging & blocked storm drain",
    description: "Ward 12 main storm drainage has collapsed causing 2-foot standing dirty water in front of residential apartments and primary school entrance.",
    category: "Drainage & Water Supply",
    location: "Ward 12, Indiranagar Block B",
    district: "East District",
    state: "Delhi NCR",
    reportedBy: "P. Verma",
    contactPhone: "+91 98111 22334",
    dateFiled: "31 Aug 2026",
    timeFiled: "04:15 PM",
    status: "Action Assigned",
    statusLabel: "Action Assigned",
    priority: "Critical",
    assignedDepartment: "Delhi Jal Board / Drainage Cell",
    assignedOfficer: "Dr. Sunita Rao (Zonal Officer)",
    budget: "₹2,80,000",
    evidenceType: "voice",
    audioLength: "0:42",
    voiceTranscript: "Namaste, the main drain behind Block B Indiranagar is completely choked. Water has entered five ground floor homes and children cannot go to school. Please clean the silt immediately.",
    aiSeverityScore: 94,
    sentiment: "Critical Emergency",
    actionNotes: "Suction jetting machine requisitioned. Team assigned for desilting operation.",
    timeline: [
      { step: 1, title: "Submitted", date: "31 Aug 2026", time: "04:15 PM", note: "Recorded via Voice Complaint System.", completed: true },
      { step: 2, title: "Under Review", date: "31 Aug 2026", time: "05:00 PM", note: "AI NLP analysis flagged critical flood risk.", completed: true },
      { step: 3, title: "Action Assigned", date: "01 Sep 2026", time: "09:00 AM", note: "Transferred to Zonal Drainage Engineer Dr. Sunita Rao.", completed: true, current: true },
      { step: 4, title: "In Progress", date: "Pending", time: "-", note: "Awaiting field team clearance.", completed: false },
      { step: 5, title: "Resolved", date: "Pending", time: "-", note: "Final clearance verification.", completed: false }
    ]
  },
  {
    id: "PP24893",
    display_id: "PP24893",
    title: "Streetlight outage on 5 consecutive poles",
    description: "Dark stretch of 300m near Community Park causing severe safety issues for women and elderly pedestrians walking at night.",
    category: "Electricity & Lighting",
    location: "Sector 9 Cross Road, Near Community Park",
    district: "North District",
    state: "Delhi NCR",
    reportedBy: "R. Gupta",
    contactPhone: "+91 97766 55443",
    dateFiled: "30 Aug 2026",
    timeFiled: "08:10 PM",
    status: "Resolved",
    statusLabel: "Solved",
    priority: "Medium",
    assignedDepartment: "Municipal Corporation / Power Dept",
    assignedOfficer: "Sh. Anil Deshmukh",
    budget: "₹35,000",
    evidenceType: "photo",
    imageUrl: "https://images.unsplash.com/photo-1509114397022-ed747cca3f65?w=600&auto=format&fit=crop&q=80",
    aiSeverityScore: 62,
    sentiment: "Moderate Concern",
    actionNotes: "Underground cable fault repaired. 5 new LED 90W fixtures installed and tested.",
    timeline: [
      { step: 1, title: "Submitted", date: "30 Aug 2026", time: "08:10 PM", note: "Submitted via Mobile App.", completed: true },
      { step: 2, title: "Under Review", date: "31 Aug 2026", time: "09:30 AM", note: "Verified with DISCOM zonal division.", completed: true },
      { step: 3, title: "Action Assigned", date: "31 Aug 2026", time: "11:00 AM", note: "Assigned to Line Inspector Anil Deshmukh.", completed: true },
      { step: 4, title: "In Progress", date: "31 Aug 2026", time: "02:00 PM", note: "Cable testing and fixture replacement.", completed: true },
      { step: 5, title: "Resolved", date: "01 Sep 2026", time: "06:30 PM", note: "All 5 streetlights functioning. Citizen confirmed resolution.", completed: true, current: true }
    ]
  }
];

function formatBackendProblem(p) {
  const dateObj = p.created_at ? new Date(p.created_at) : new Date();
  const dateFormatted = dateObj.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  const timeFormatted = dateObj.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

  let statusIndex = 1;
  if (p.status === "Submitted") statusIndex = 1;
  else if (p.status === "Under Review") statusIndex = 2;
  else if (p.status === "Action Assigned") statusIndex = 3;
  else if (p.status === "In Progress") statusIndex = 4;
  else if (p.status === "Resolved") statusIndex = 5;

  const timeline = [
    { step: 1, title: "Submitted", date: dateFormatted, time: timeFormatted, note: "Grievance received and registered.", completed: statusIndex >= 1, current: statusIndex === 1 },
    { step: 2, title: "Under Review", date: statusIndex >= 2 ? dateFormatted : "Pending", time: statusIndex >= 2 ? timeFormatted : "-", note: "AI triage & departmental routing.", completed: statusIndex >= 2, current: statusIndex === 2 },
    { step: 3, title: "Action Assigned", date: statusIndex >= 3 ? dateFormatted : "Pending", time: statusIndex >= 3 ? timeFormatted : "-", note: p.action_notes || "Officer & budget allocation.", completed: statusIndex >= 3, current: statusIndex === 3 },
    { step: 4, title: "In Progress", date: statusIndex >= 4 ? dateFormatted : "Pending", time: statusIndex >= 4 ? timeFormatted : "-", note: "On-ground execution.", completed: statusIndex >= 4, current: statusIndex === 4 },
    { step: 5, title: "Resolved", date: statusIndex >= 5 ? dateFormatted : "Pending", time: statusIndex >= 5 ? timeFormatted : "-", note: "Verification & signoff completed.", completed: statusIndex >= 5, current: statusIndex === 5 }
  ];

  return {
    id: p.display_id || p.id,
    display_id: p.display_id || p.id,
    title: p.title,
    description: p.description || p.ai_summary || "",
    ai_summary: p.ai_summary,
    category: p.category || "General Civic Issue",
    location: p.location || "Urban District",
    district: p.district || "Central District",
    state: p.state || "Delhi NCR",
    reportedBy: p.reported_by || "Anonymous Citizen",
    contactPhone: p.contact_phone || "+91 98765 43210",
    dateFiled: dateFormatted,
    timeFiled: timeFormatted,
    status: p.status || "Submitted",
    statusLabel: p.status === "Resolved" ? "Solved" : (p.status === "In Progress" || p.status === "Action Assigned") ? "Proceed to Action" : "Pending Review",
    priority: p.priority || "High",
    assignedDepartment: p.assigned_department || "Urban Affairs Cell",
    assignedOfficer: p.assigned_officer || "Under Assignment",
    budget: p.budget || "Allocating...",
    evidenceType: p.evidence_type || "text",
    imageUrl: p.file_url || "",
    audioLength: p.voice_transcript ? "Recorded" : "",
    voiceTranscript: p.voice_transcript || "",
    aiSeverityScore: p.ai_severity_score || 75,
    sentiment: p.sentiment || "High Urgency",
    actionNotes: p.action_notes || "Grievance queued for automated AI analysis and officer triage.",
    timeline
  };
}

export function CivicProvider({ children }) {
  const [authToken, setAuthToken] = useState(() => localStorage.getItem('peoples_priorities_token') || null);
  const [userRole, setUserRole] = useState(() => localStorage.getItem('peoples_priorities_role') || 'citizen');
  
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = localStorage.getItem('peoples_priorities_user');
      return saved ? JSON.parse(saved) : {
        id: "",
        full_name: "Aaditya Sharma",
        name: "Aaditya Sharma",
        phone: "+91 98765 43210",
        state: "Delhi NCR",
        district: "South District",
        department: "Department of Grievances & Urban Infrastructure",
        roleTitle: "Senior Administrative Executive"
      };
    } catch {
      return {
        id: "",
        full_name: "Aaditya Sharma",
        name: "Aaditya Sharma",
        phone: "+91 98765 43210",
        state: "Delhi NCR",
        district: "South District",
        department: "Department of Grievances & Urban Infrastructure",
        roleTitle: "Senior Administrative Executive"
      };
    }
  });

  const [complaints, setComplaints] = useState(INITIAL_COMPLAINTS);
  const [activeTab, setActiveTab] = useState('home');
  const [activeTrackId, setActiveTrackId] = useState("PP24891");
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authInitialType, setAuthInitialType] = useState('citizen');
  const [authInitialTab, setAuthInitialTab] = useState('login');
  const [notification, setNotification] = useState(null);

  // Sync token & role to localStorage
  useEffect(() => {
    if (authToken) {
      localStorage.setItem('peoples_priorities_token', authToken);
    } else {
      localStorage.removeItem('peoples_priorities_token');
    }
  }, [authToken]);

  useEffect(() => {
    localStorage.setItem('peoples_priorities_role', userRole);
  }, [userRole]);

  useEffect(() => {
    localStorage.setItem('peoples_priorities_user', JSON.stringify(currentUser));
  }, [currentUser]);

  // Fetch complaints on load / user changes
  const fetchComplaints = async () => {
    if (!authToken) return;
    try {
      const headers = { Authorization: `Bearer ${authToken}` };
      let endpoint = `${API_BASE}/problems/mine`;
      if (userRole === 'official') {
        const stateName = currentUser.state || "Delhi NCR";
        endpoint = `${API_BASE}/problems/state/${encodeURIComponent(stateName)}`;
      }
      const res = await fetch(endpoint, { headers });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          setComplaints(data.map(formatBackendProblem));
        }
      }
    } catch (e) {
      console.warn("Could not fetch complaints from backend, using local state:", e);
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, [authToken, userRole]);

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type, id: Date.now() });
    setTimeout(() => {
      setNotification(null);
    }, 4000);
  };

  const addComplaint = async (newGrievance) => {
    const formData = new FormData();
    formData.append('title', newGrievance.title || "Civic Grievance Report");
    formData.append('description', newGrievance.description || "");
    formData.append('category', newGrievance.category || "General Civic Issue");
    formData.append('location', newGrievance.location || "Urban District");
    formData.append('district', newGrievance.district || currentUser.district || "South District");
    formData.append('state', currentUser.state || "Delhi NCR");
    formData.append('priority', newGrievance.priority || "High");
    formData.append('evidence_type', newGrievance.evidenceType || "text");

    if (newGrievance.voiceTranscript) {
      formData.append('voice_transcript', newGrievance.voiceTranscript);
    }

    if (newGrievance.file) {
      formData.append('file', newGrievance.file);
    } else if (newGrievance.audioBlob) {
      formData.append('file', newGrievance.audioBlob, 'voice_complaint.webm');
    }

    try {
      const headers = authToken ? { Authorization: `Bearer ${authToken}` } : {};
      const res = await fetch(`${API_BASE}/problems`, {
        method: 'POST',
        headers,
        body: formData
      });

      if (res.ok) {
        const p = await res.json();
        const created = formatBackendProblem(p);
        setComplaints(prev => [created, ...prev]);
        setActiveTrackId(created.id);
        showNotification(`Complaint #${created.id} successfully filed!`);
        return created;
      }
    } catch (e) {
      console.warn("Backend problem submit failed, using fallback:", e);
    }

    // Fallback local creation if offline/unauthenticated
    const randomNum = Math.floor(10000 + Math.random() * 90000);
    const newId = `PP${randomNum}`;
    const now = new Date();
    const dateFormatted = now.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    const timeFormatted = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

    const fallbackCreated = {
      id: newId,
      display_id: newId,
      title: newGrievance.title || "Civic Grievance Report",
      description: newGrievance.description || "Reported by citizen via Kalyan Setu.",
      category: newGrievance.category || "General Civic Issue",
      location: newGrievance.location || "Delhi Urban District",
      district: newGrievance.district || "South District",
      state: currentUser.state || "Delhi NCR",
      reportedBy: currentUser.full_name || currentUser.name || "Citizen",
      contactPhone: currentUser.phone || "+91 98765 43210",
      dateFiled: dateFormatted,
      timeFiled: timeFormatted,
      status: "Submitted",
      statusLabel: "Pending Review",
      priority: newGrievance.priority || "High",
      assignedDepartment: "Urban Affairs Cell",
      assignedOfficer: "Under Assignment",
      budget: "Allocating...",
      evidenceType: newGrievance.evidenceType || "text",
      imageUrl: newGrievance.imageUrl || "",
      audioLength: newGrievance.audioLength || "",
      voiceTranscript: newGrievance.voiceTranscript || "",
      aiSeverityScore: Math.floor(65 + Math.random() * 30),
      sentiment: "High Urgency",
      actionNotes: "Grievance queued for automated AI analysis and officer triage.",
      timeline: [
        { step: 1, title: "Submitted", date: dateFormatted, time: timeFormatted, note: "Grievance received.", completed: true, current: true },
        { step: 2, title: "Under Review", date: "Pending", time: "-", note: "AI triage & departmental routing.", completed: false },
        { step: 3, title: "Action Assigned", date: "Pending", time: "-", note: "Officer & budget allocation.", completed: false },
        { step: 4, title: "In Progress", date: "Pending", time: "-", note: "On-ground execution.", completed: false },
        { step: 5, title: "Resolved", date: "Pending", time: "-", note: "Verification & citizen confirmation.", completed: false }
      ]
    };

    setComplaints(prev => [fallbackCreated, ...prev]);
    setActiveTrackId(newId);
    showNotification(`Complaint #${newId} successfully filed!`);
    return fallbackCreated;
  };

  const updateComplaintStatus = async (id, newStatus, note, officer, department, budget) => {
    try {
      const headers = {
        'Content-Type': 'application/json',
        ...(authToken ? { Authorization: `Bearer ${authToken}` } : {})
      };

      await fetch(`${API_BASE}/govt/problems/${id}/status`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify({
          status: newStatus,
          action_notes: note,
          assigned_officer: officer,
          assigned_department: department,
          budget
        })
      });
    } catch (e) {
      console.warn("Backend status update failed:", e);
    }

    setComplaints(prev => prev.map(c => {
      if (c.id !== id && c.display_id !== id) return c;
      const now = new Date();
      const dateFormatted = now.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
      const timeFormatted = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

      let statusIndex = 1;
      if (newStatus === "Submitted") statusIndex = 1;
      else if (newStatus === "Under Review") statusIndex = 2;
      else if (newStatus === "Action Assigned") statusIndex = 3;
      else if (newStatus === "In Progress") statusIndex = 4;
      else if (newStatus === "Resolved" || newStatus === "Rejected") statusIndex = 5;

      const updatedTimeline = c.timeline.map((stepItem, idx) => {
        const stepNum = idx + 1;
        if (newStatus === "Rejected" && stepNum === 5) {
          return { ...stepItem, title: "Grievance Rejected", completed: true, current: true, date: dateFormatted, time: timeFormatted, note: note || "Grievance reviewed and marked as rejected / duplicate by authority." };
        }
        if (stepNum < statusIndex) {
          return { ...stepItem, completed: true, current: false };
        } else if (stepNum === statusIndex) {
          return { ...stepItem, completed: true, current: true, date: dateFormatted, time: timeFormatted, note: note || stepItem.note };
        } else {
          return { ...stepItem, completed: false, current: false };
        }
      });

      return {
        ...c,
        status: newStatus,
        statusLabel: newStatus === "Resolved" ? "Solved" : newStatus === "Rejected" ? "Rejected" : (newStatus === "In Progress" || newStatus === "Action Assigned") ? "Proceed to Action" : "Pending Review",
        assignedOfficer: officer || c.assignedOfficer,
        assignedDepartment: department || c.assignedDepartment,
        budget: budget || c.budget,
        actionNotes: note ? `${note} (Updated on ${dateFormatted})` : c.actionNotes,
        timeline: updatedTimeline
      };
    }));

    showNotification(`Complaint #${id} updated to ${newStatus}`);
  };

  const bulkAssign = async (ids, department, officer) => {
    try {
      const headers = {
        'Content-Type': 'application/json',
        ...(authToken ? { Authorization: `Bearer ${authToken}` } : {})
      };

      await fetch(`${API_BASE}/govt/problems/bulk-assign`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          problem_ids: ids,
          department,
          officer
        })
      });
    } catch (e) {
      console.warn("Backend bulk assign failed:", e);
    }

    setComplaints(prev => prev.map(c => {
      if (!ids.includes(c.id) && !ids.includes(c.display_id)) return c;
      return {
        ...c,
        assignedDepartment: department || c.assignedDepartment,
        assignedOfficer: officer || c.assignedOfficer,
        status: "Action Assigned",
        statusLabel: "Proceed to Action"
      };
    }));

    showNotification(`Assigned ${ids.length} complaints to ${department}`);
  };

  const openAuth = (type = 'citizen', tab = 'login') => {
    setAuthInitialType(type);
    setAuthInitialTab(tab);
    setAuthModalOpen(true);
  };

  const logoutUser = () => {
    setAuthToken(null);
    setCurrentUser(null);
    setUserRole('citizen');
    localStorage.removeItem('peoples_priorities_token');
    localStorage.removeItem('peoples_priorities_user');
    setActiveTab('home');
    showNotification("Logged out successfully.");
  };

  const updateUserProfile = (updatedData) => {
    setCurrentUser(prev => {
      const newUser = { ...prev, ...updatedData };
      if (updatedData.full_name) newUser.name = updatedData.full_name;
      localStorage.setItem('peoples_priorities_user', JSON.stringify(newUser));
      return newUser;
    });
    showNotification("Profile updated successfully!");
  };

  const navigateTo = (tabName, trackId = null) => {
    // Government official restriction: Officials can only access official pages
    if (userRole === 'official') {
      const allowedAdminTabs = ['admin_overview', 'admin_ai', 'admin_complaints', 'admin_action'];
      if (!allowedAdminTabs.includes(tabName)) {
        if (trackId && tabName === 'track') {
          setActiveTrackId(trackId);
          setActiveTab('admin_action');
        } else {
          setActiveTab('admin_overview');
        }
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }
    }

    // 1. Home is open to everyone (citizens / unauthenticated)
    if (tabName === 'home') {
      if (trackId) setActiveTrackId(trackId);
      setActiveTab('home');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    // 2. Unauthenticated check: Citizens must be logged in for non-home pages
    if (!currentUser && !authToken) {
      if (tabName.startsWith('admin_')) {
        showNotification("Government official login required to access administration portal.");
        openAuth('official', 'login');
      } else {
        showNotification("Please sign in or register to access citizen services.");
        openAuth('citizen', 'login');
      }
      return;
    }

    // 3. Profile tab is ONLY for citizen users
    if (tabName === 'profile' && userRole === 'official') {
      showNotification("Profile management is only available for Citizen accounts.");
      setActiveTab('admin_overview');
      return;
    }

    // 4. Admin tabs require official role
    if (tabName.startsWith('admin_') && userRole !== 'official') {
      showNotification("Government official authentication required for administration portal.");
      openAuth('official', 'login');
      return;
    }

    if (trackId) setActiveTrackId(trackId);
    setActiveTab(tabName);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <CivicContext.Provider value={{
      complaints,
      userRole,
      setUserRole,
      currentUser,
      setCurrentUser,
      authToken,
      setAuthToken,
      logoutUser,
      updateUserProfile,
      activeTab,
      setActiveTab,
      navigateTo,
      activeTrackId,
      setActiveTrackId,
      authModalOpen,
      setAuthModalOpen,
      authInitialType,
      authInitialTab,
      openAuth,
      notification,
      showNotification,
      addComplaint,
      updateComplaintStatus,
      bulkAssign,
      fetchComplaints
    }}>
      {children}
    </CivicContext.Provider>
  );
}

export function useCivic() {
  const context = useContext(CivicContext);
  if (!context) {
    throw new Error("useCivic must be used within a CivicProvider");
  }
  return context;
}

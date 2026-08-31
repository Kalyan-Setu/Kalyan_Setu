import React, { createContext, useContext, useState, useEffect } from 'react';

const CivicContext = createContext();

const INITIAL_COMPLAINTS = [
  {
    id: "PP24891",
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
    status: "In Progress", // "Submitted", "Under Review", "Action Assigned", "In Progress", "Resolved", "Rejected"
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
  },
  {
    id: "PP24894",
    title: "Garbage accumulation & unattended open dump",
    description: "Commercial waste and domestic trash not collected for 4 consecutive days. Stray animal menace and unbearable stench.",
    category: "Sanitation & Waste",
    location: "Central Plaza, Connaught Circle",
    district: "Central District",
    state: "Delhi NCR",
    reportedBy: "S. Mehra",
    contactPhone: "+91 99887 76655",
    dateFiled: "01 Sep 2026",
    timeFiled: "07:45 AM",
    status: "Under Review",
    statusLabel: "Pending Review",
    priority: "High",
    assignedDepartment: "MCD Sanitation Directorate",
    assignedOfficer: "Er. Vikram Sen",
    budget: "₹45,000",
    evidenceType: "text",
    aiSeverityScore: 78,
    sentiment: "High Urgency",
    actionNotes: "Sanitation inspector notified. Compactors scheduled for morning clearance run.",
    timeline: [
      { step: 1, title: "Submitted", date: "01 Sep 2026", time: "07:45 AM", note: "Grievance submitted by Resident Welfare Association.", completed: true },
      { step: 2, title: "Under Review", date: "01 Sep 2026", time: "08:30 AM", note: "Sanitation inspector verification in progress.", completed: true, current: true },
      { step: 3, title: "Action Assigned", date: "Pending", time: "-", note: "Assigning sanitation truck route.", completed: false },
      { step: 4, title: "In Progress", date: "Pending", time: "-", note: "Waste clearance in progress.", completed: false },
      { step: 5, title: "Resolved", date: "Pending", time: "-", note: "Site sanitation completed.", completed: false }
    ]
  },
  {
    id: "PP24895",
    title: "Broken pedestrian signal & missing crosswalk paint",
    description: "Pedestrian signal at busy four-way junction is dead. Heavy traffic makes crossing life-threatening for school children.",
    category: "Public Safety & Traffic",
    location: "Khel Gaon Marg Intersection",
    district: "South District",
    state: "Delhi NCR",
    reportedBy: "K. Nair",
    contactPhone: "+91 96543 21098",
    dateFiled: "29 Aug 2026",
    timeFiled: "11:20 AM",
    status: "In Progress",
    statusLabel: "Proceed to Action",
    priority: "Critical",
    assignedDepartment: "Traffic Police & Urban Roads Wing",
    assignedOfficer: "Insp. Tarun Bedi",
    budget: "₹85,000",
    evidenceType: "photo",
    imageUrl: "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=600&auto=format&fit=crop&q=80",
    aiSeverityScore: 91,
    sentiment: "High Danger",
    actionNotes: "Traffic signal controller board replaced. Thermoplastic road marking team scheduled for night shift.",
    timeline: [
      { step: 1, title: "Submitted", date: "29 Aug 2026", time: "11:20 AM", note: "Reported by citizen safety patrol.", completed: true },
      { step: 2, title: "Under Review", date: "29 Aug 2026", time: "12:00 PM", note: "Joint inspection by Traffic Engineering Cell.", completed: true },
      { step: 3, title: "Action Assigned", date: "30 Aug 2026", time: "10:00 AM", note: "Signal contractor assigned.", completed: true },
      { step: 4, title: "In Progress", date: "31 Aug 2026", time: "03:00 PM", note: "Component replacement underway.", completed: true, current: true },
      { step: 5, title: "Resolved", date: "Pending", time: "-", note: "Testing & signoff.", completed: false }
    ]
  }
];

export function CivicProvider({ children }) {
  const [complaints, setComplaints] = useState(() => {
    try {
      const saved = localStorage.getItem('peoples_priorities_complaints');
      return saved ? JSON.parse(saved) : INITIAL_COMPLAINTS;
    } catch {
      return INITIAL_COMPLAINTS;
    }
  });

  const [userRole, setUserRole] = useState(() => {
    return localStorage.getItem('peoples_priorities_role') || 'citizen'; // 'citizen' or 'official'
  });

  const [currentUser, setCurrentUser] = useState({
    name: "Aaditya Sharma",
    phone: "+91 98765 43210",
    aadhaar: "XXXX-XXXX-8921",
    officialId: "GOI-ADMIN-4402",
    department: "Department of Grievances & Urban Infrastructure",
    roleTitle: "Senior Administrative Executive"
  });

  const [activeTab, setActiveTab] = useState('home'); // 'home', 'citizen_dashboard', 'submit', 'track', 'contact', 'admin_overview', 'admin_complaints', 'admin_action', 'admin_ai', 'auth'
  const [activeTrackId, setActiveTrackId] = useState("PP24891");
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authInitialType, setAuthInitialType] = useState('citizen');
  const [authInitialTab, setAuthInitialTab] = useState('login');

  const [notification, setNotification] = useState(null);

  useEffect(() => {
    localStorage.setItem('peoples_priorities_complaints', JSON.stringify(complaints));
  }, [complaints]);

  useEffect(() => {
    localStorage.setItem('peoples_priorities_role', userRole);
  }, [userRole]);

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type, id: Date.now() });
    setTimeout(() => {
      setNotification(null);
    }, 4000);
  };

  const addComplaint = (newGrievance) => {
    const randomNum = Math.floor(10000 + Math.random() * 90000);
    const newId = `PP${randomNum}`;
    const now = new Date();
    const dateFormatted = now.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    const timeFormatted = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

    const createdComplaint = {
      id: newId,
      title: newGrievance.title || "Civic Grievance Report",
      description: newGrievance.description || "Reported by citizen via Kalyan Setu.",
      category: newGrievance.category || "General Civic Issue",
      location: newGrievance.location || "Delhi Urban District",
      district: newGrievance.district || "South District",
      state: "Delhi NCR",
      reportedBy: currentUser.name,
      contactPhone: currentUser.phone,
      dateFiled: dateFormatted,
      timeFiled: timeFormatted,
      status: "Submitted",
      statusLabel: "Pending Review",
      priority: newGrievance.priority || "High",
      assignedDepartment: newGrievance.category === "Road Infrastructure" ? "Public Works Department (PWD)" :
                          newGrievance.category === "Water Supply" ? "Delhi Jal Board" :
                          newGrievance.category === "Sanitation & Waste" ? "Municipal Corporation (MCD)" : "Urban Affairs Cell",
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
        { step: 1, title: "Submitted", date: dateFormatted, time: timeFormatted, note: "Grievance received and verified by system.", completed: true, current: true },
        { step: 2, title: "Under Review", date: "Pending", time: "-", note: "AI triage & departmental routing.", completed: false },
        { step: 3, title: "Action Assigned", date: "Pending", time: "-", note: "Officer & budget allocation.", completed: false },
        { step: 4, title: "In Progress", date: "Pending", time: "-", note: "On-ground execution.", completed: false },
        { step: 5, title: "Resolved", date: "Pending", time: "-", note: "Verification & citizen confirmation.", completed: false }
      ]
    };

    setComplaints(prev => [createdComplaint, ...prev]);
    setActiveTrackId(newId);
    showNotification(`Complaint #${newId} successfully filed!`);
    return createdComplaint;
  };

  const updateComplaintStatus = (id, newStatus, note, officer, department, budget) => {
    setComplaints(prev => prev.map(c => {
      if (c.id !== id) return c;

      const now = new Date();
      const dateFormatted = now.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
      const timeFormatted = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

      let statusIndex = 1;
      if (newStatus === "Submitted") statusIndex = 1;
      else if (newStatus === "Under Review") statusIndex = 2;
      else if (newStatus === "Action Assigned") statusIndex = 3;
      else if (newStatus === "In Progress") statusIndex = 4;
      else if (newStatus === "Resolved") statusIndex = 5;
      else if (newStatus === "Rejected") statusIndex = 0;

      const updatedTimeline = c.timeline.map((stepItem, idx) => {
        const stepNum = idx + 1;
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
        statusLabel: newStatus === "Resolved" ? "Solved" : (newStatus === "In Progress" || newStatus === "Action Assigned") ? "Proceed to Action" : "Pending Review",
        assignedOfficer: officer || c.assignedOfficer,
        assignedDepartment: department || c.assignedDepartment,
        budget: budget || c.budget,
        actionNotes: note ? `${note} (Updated on ${dateFormatted})` : c.actionNotes,
        timeline: updatedTimeline
      };
    }));

    showNotification(`Complaint #${id} updated to ${newStatus}`);
  };

  const bulkAssign = (ids, department, officer) => {
    setComplaints(prev => prev.map(c => {
      if (!ids.includes(c.id)) return c;
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

  const navigateTo = (tabName, trackId = null) => {
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
      bulkAssign
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

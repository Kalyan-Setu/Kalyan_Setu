import React from 'react';
import { useCivic } from './context/CivicContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import AuthModal from './components/AuthModal';
import NotificationToast from './components/NotificationToast';

// Pages
import HomePage from './pages/HomePage';
import CitizenDashboardPage from './pages/CitizenDashboardPage';
import SubmitProblemPage from './pages/SubmitProblemPage';
import ProblemStatusPage from './pages/ProblemStatusPage';
import ContactUsPage from './pages/ContactUsPage';
import ProfilePage from './pages/ProfilePage';
import AdminOverviewPage from './pages/AdminOverviewPage';
import AdminComplaintsPage from './pages/AdminComplaintsPage';
import AdminTakeActionPage from './pages/AdminTakeActionPage';
import AdminAiAnalysisPage from './pages/AdminAiAnalysisPage';

export default function App() {
  const { activeTab, userRole, currentUser, authToken } = useCivic();

  const isAuthenticated = Boolean(currentUser || authToken);
  const isOfficial = userRole === 'official';

  const renderActivePage = () => {
    // Unauthenticated guard: Only allow home
    if (!isAuthenticated && activeTab !== 'home') {
      return <HomePage />;
    }

    // Official user guard: Government officials only see the 4 official pages
    if (isOfficial) {
      switch (activeTab) {
        case 'admin_overview':
          return <AdminOverviewPage />;
        case 'admin_complaints':
          return <AdminComplaintsPage />;
        case 'admin_action':
          return <AdminTakeActionPage />;
        case 'admin_ai':
          return <AdminAiAnalysisPage />;
        default:
          return <AdminOverviewPage />;
      }
    }

    // Role guard: Profile is only for citizen users
    if (activeTab === 'profile' && (!isAuthenticated || isOfficial)) {
      return <HomePage />;
    }

    // Role guard: Admin tabs require official role
    if (activeTab.startsWith('admin_') && (!isAuthenticated || !isOfficial)) {
      return <HomePage />;
    }

    switch (activeTab) {
      case 'home':
        return <HomePage />;
      case 'citizen_dashboard':
        return <CitizenDashboardPage />;
      case 'submit':
        return <SubmitProblemPage />;
      case 'track':
        return <ProblemStatusPage />;
      case 'contact':
        return <ContactUsPage />;
      case 'profile':
        return <ProfilePage />;
      default:
        return <HomePage />;
    }
  };

  const isAdminTab = isOfficial || activeTab.startsWith('admin_');

  return (
    <div className="min-h-screen flex flex-col bg-background text-on-background">
      <Navbar />
      <div className="flex-grow flex flex-col w-full">
        {renderActivePage()}
      </div>
      {!isAdminTab && <Footer />}
      <AuthModal />
      <NotificationToast />
    </div>
  );
}

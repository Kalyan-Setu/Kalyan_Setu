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
import AdminOverviewPage from './pages/AdminOverviewPage';
import AdminComplaintsPage from './pages/AdminComplaintsPage';
import AdminTakeActionPage from './pages/AdminTakeActionPage';
import AdminAiAnalysisPage from './pages/AdminAiAnalysisPage';

export default function App() {
  const { activeTab, userRole } = useCivic();

  const renderActivePage = () => {
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
      case 'admin_overview':
        return <AdminOverviewPage />;
      case 'admin_complaints':
        return <AdminComplaintsPage />;
      case 'admin_action':
        return <AdminTakeActionPage />;
      case 'admin_ai':
        return <AdminAiAnalysisPage />;
      default:
        return <HomePage />;
    }
  };

  const isAdminTab = activeTab.startsWith('admin_');

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

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import { useAuth } from '../hooks/useAuth';

import LoginPage from '../pages/auth/LoginPage';
import DashboardPage from '../pages/dashboard/DashboardPage';
import PatientRegistryPage from '../pages/patients/PatientRegistryPage';
import PatientRegistrationPage from '../pages/patients/PatientRegistrationPage';
import PatientProfilePage from '../pages/patients/PatientProfilePage';
import AssessmentPage from '../pages/assessment/AssessmentPage';
import RiskResultsPage from '../pages/prediction/RiskResultsPage';
import RecommendationResultsPage from '../pages/recommendations/RecommendationResultsPage';
import GuidelinesLibraryPage from '../pages/guidelines/GuidelinesLibraryPage';
import GuidelineViewerPage from '../pages/guidelines/GuidelineViewerPage';
import AuditLogPage from '../pages/audit/AuditLogPage';
import ClinicalReportsPage from '../pages/reports/ClinicalReportsPage';
import UserManagementPage from '../pages/admin/UserManagementPage';
import SystemSettingsPage from '../pages/admin/SystemSettingsPage';
import UserProfilePage from '../pages/profile/UserProfilePage';

function ProtectedRoute({ children, roles }) {
  const { isAuthenticated, user } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (roles && user && !roles.includes(user.role)) return <Navigate to="/dashboard" replace />;
  return children;
}

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        
        <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
        <Route path="/patients" element={<ProtectedRoute><PatientRegistryPage /></ProtectedRoute>} />
        <Route path="/patients/new" element={<ProtectedRoute roles={['NURSE','ADMIN']}><PatientRegistrationPage /></ProtectedRoute>} />
        <Route path="/patients/:id" element={<ProtectedRoute><PatientProfilePage /></ProtectedRoute>} />
        <Route path="/assessment" element={<ProtectedRoute roles={['NURSE','ADMIN']}><AssessmentPage /></ProtectedRoute>} />
        <Route path="/predictions/:id" element={<ProtectedRoute><RiskResultsPage /></ProtectedRoute>} />
        <Route path="/recommendations/:id" element={<ProtectedRoute><RecommendationResultsPage /></ProtectedRoute>} />
        <Route path="/guidelines" element={<ProtectedRoute><GuidelinesLibraryPage /></ProtectedRoute>} />
        <Route path="/guidelines/:id" element={<ProtectedRoute><GuidelineViewerPage /></ProtectedRoute>} />
        <Route path="/audit" element={<ProtectedRoute roles={['ADMIN']}><AuditLogPage /></ProtectedRoute>} />
        <Route path="/reports" element={<ProtectedRoute roles={['ADMIN']}><ClinicalReportsPage /></ProtectedRoute>} />
        <Route path="/admin/users" element={<ProtectedRoute roles={['ADMIN']}><UserManagementPage /></ProtectedRoute>} />
        <Route path="/admin/settings" element={<ProtectedRoute roles={['ADMIN']}><SystemSettingsPage /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><UserProfilePage /></ProtectedRoute>} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

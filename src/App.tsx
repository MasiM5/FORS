import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Sidebar } from './components/layout/Sidebar';
import { TopBar } from './components/layout/TopBar';
import { Dashboard } from './pages/Dashboard';
import { StudentRegistration } from './pages/StudentRegistration';
import { StudentList } from './pages/StudentList';
import { SchoolManagement } from './pages/SchoolManagement';
import { UserManagement } from './pages/UserManagement';
import { AuditLogs } from './pages/AuditLogs';
import { LoginPage } from './pages/LoginPage';
import { SchoolSelection } from './pages/SchoolSelection';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading, selectedSchool, isInitialized, isAdmin } = useAuth();
  const location = useLocation();
  
  if (loading || !isInitialized) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="animate-pulse flex flex-col items-center gap-4">
        <div className="w-12 h-12 bg-blue-600 rounded-xl"></div>
        <span className="text-sm font-medium text-slate-400">Authenticating...</span>
      </div>
    </div>
  );
  
  if (!user) return <Navigate to="/login" replace />;
  
  // Force school selection if none selected, unless already on that page OR accessing management routes as admin
  const isManagementRoute = ['/schools', '/users', '/audit-logs'].includes(location.pathname);
  if (!selectedSchool && location.pathname !== '/select-school' && !(isAdmin && isManagementRoute)) {
    return <Navigate to="/select-school" replace />;
  }
  
  return (
    <div className="flex min-h-screen bg-bg-app">
      {location.pathname !== '/select-school' && <Sidebar />}
      <div className={location.pathname !== '/select-school' ? "flex-1 ml-[260px]" : "flex-1"}>
        {location.pathname !== '/select-school' && <TopBar />}
        <main className={location.pathname !== '/select-school' ? "p-8 mt-[72px]" : "p-0"}>
          {children}
        </main>
      </div>
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          
          <Route path="/select-school" element={
            <ProtectedRoute>
              <SchoolSelection />
            </ProtectedRoute>
          } />

          <Route path="/" element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } />

          <Route path="/register" element={
            <ProtectedRoute>
              <StudentRegistration />
            </ProtectedRoute>
          } />

          <Route path="/students" element={
            <ProtectedRoute>
              <StudentList />
            </ProtectedRoute>
          } />

          <Route path="/schools" element={
            <ProtectedRoute>
              <SchoolManagement />
            </ProtectedRoute>
          } />

          <Route path="/users" element={
            <ProtectedRoute>
              <UserManagement />
            </ProtectedRoute>
          } />

          <Route path="/logs" element={
            <ProtectedRoute>
              <AuditLogs />
            </ProtectedRoute>
          } />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

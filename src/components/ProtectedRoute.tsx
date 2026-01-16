import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../providers/AuthProvider';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  allowedRoles?: string[]; // e.g. ['admin', 'doctor']
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ allowedRoles }) => {
  const { user, isLoading, isAuthenticated } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-zinc-50 dark:bg-zinc-950">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
        <p className="mt-2 text-xs font-bold uppercase tracking-widest text-zinc-500">Verifying Session...</p>
      </div>
    );
  }

  // 1. Not Logged In -> Go to Login
  if (!isAuthenticated || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 2. Role Mismatch -> Go to Unauthorized (or their specific dashboard)
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Redirect logic: Send them to their own dashboard if they try to access another
    const roleDashboardMap: Record<string, string> = {
      admin: '/admin/dashboard',
      doctor: '/doctor/dashboard',
      receptionist: '/reception/dashboard',
      pharmacist: '/pharmacist/dashboard',
      lab_technician: '/laboratory/dashboard'
    };
    
    const correctPath = roleDashboardMap[user.role] || '/login';
    return <Navigate to={correctPath} replace />;
  }

  // 3. Authorized -> Render content
  return <Outlet />;
};

export default ProtectedRoute;
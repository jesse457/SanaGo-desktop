import React from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { useAuth } from "../providers/AuthProvider";

// Helper function to determine where a user goes based on their role
export const getDashboardPath = (role?: string): string => {
  const roleDashboardMap: Record<string, string> = {
    admin: "/admin/dashboard",
    doctor: "/doctor/dashboard",
    receptionist: "/reception/dashboard",
    pharmacist: "/pharmacist/dashboard",
    "lab-technician": "/laboratory/dashboard",
  };

  return role && roleDashboardMap[role] ? roleDashboardMap[role] : "/login";
};

interface ProtectedRouteProps {
  allowedRoles?: string[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ allowedRoles }) => {
  const { user, isLoading, isAuthenticated } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-zinc-50 dark:bg-zinc-950">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
        <p className="mt-2 text-xs font-bold uppercase tracking-widest text-zinc-500">
          Verifying Session...
        </p>
      </div>
    );
  }

  // 1. Not logged in? -> Send to Login
  if (!isAuthenticated || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 2. Role Mismatch? -> Redirect to their specific dashboard (prevent 404s)
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to={getDashboardPath(user.role)} replace />;
  }

  // 3. Authorized -> Render content
  return <Outlet />;
};

export default ProtectedRoute;

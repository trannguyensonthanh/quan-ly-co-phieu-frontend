import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

interface ProtectedRouteProps {
  allowedRoles?: ("NhaDauTu" | "NhanVien")[];
}

const ProtectedRoute = ({ allowedRoles }: ProtectedRouteProps) => {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  // If not authenticated, redirect to login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // If roles are specified, check if user has the required role
  if (allowedRoles && user) {
    if (!allowedRoles.includes(user.role)) {
      return <Navigate to="/" replace />;
    }
  }

  // If everything is fine, render the children
  return <Outlet />;
};

export default ProtectedRoute;

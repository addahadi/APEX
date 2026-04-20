import React, { createContext, useContext } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useMe } from "@/hooks/useAuth";
import { useMySubscription } from "@/hooks/useSubscription";
import { getAccessToken } from "@/utils/token";

const AuthContext = createContext({
  user: null,
  subscription: null,
  isLoading: true,
  isAuthenticated: false,
  hasSubscription: false,
});

export const AuthProvider = ({ children }) => {
  const token = getAccessToken();
  const { data: user, isLoading: userLoading } = useMe({ enabled: !!token });
  const { data: subscription, isLoading: subLoading } = useMySubscription({ enabled: !!token });

  const isAuthenticated = !!token && !!user;
  const hasSubscription = !!subscription;

  // Loading if we have a token and either user or subscription is still loading
  const isAuthLoading = !!token && (userLoading || subLoading);

  return (
    <AuthContext.Provider
      value={{ user, subscription, isLoading: isAuthLoading, isAuthenticated, hasSubscription }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use the context easily
export const useAuthContext = () => useContext(AuthContext);

// Component to protect routes — redirects unauthenticated users to login
export const RequireAuth = ({ children }) => {
  // Temporary bypass for development
  return children;

  /* Original code disabled:
  const { isAuthenticated, isLoading } = useAuthContext();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white dark:bg-slate-950">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/auth/login" state={{ from: location }} replace />;
  }

  return children;
  */
};

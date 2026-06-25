import { createContext, useContext, useState, useEffect } from "react";
import type { ReactNode } from "react";
import {
  apiClient,
  type ApiResponse,
  type UserDto,
  type AlertCountDto,
  getRoleFromJwt,
  isTokenExpired,
  AUTH_SESSION_EXPIRED_EVENT,
} from "@/lib/api";
import {
  createSignalRConnection,
  startConnection,
  stopConnection,
  onReceiveNotification,
} from "@/lib/signalr";
import {
  useNotificationStore,
  type NotificationDto,
} from "@/features/notifications/notificationStore";
import { normalizeIncomingNotification } from "@/features/notifications/notify";

interface AuthContextType {
  isAuthenticated: boolean;
  userEmail: string | null;
  role: string | null;
  user: UserDto | null;
  login: (email: string, token: string) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const authTokenKey = "auth_token";
const userEmailKey = "user_email";
const userProfileKey = "user_profile";

/**
 * Returns true if there is a token in localStorage AND it has not expired.
 * Used both for initial state and whenever we need to re-validate the session.
 */
function hasValidStoredSession(): boolean {
  const token = localStorage.getItem(authTokenKey);
  if (!token) return false;
  return !isTokenExpired(token);
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(() =>
    hasValidStoredSession(),
  );
  const [userEmail, setUserEmail] = useState<string | null>(() =>
    localStorage.getItem(userEmailKey),
  );
  const [role, setRole] = useState<string | null>(() => {
    const token = localStorage.getItem(authTokenKey);
    return token && !isTokenExpired(token) ? getRoleFromJwt(token) : null;
  });
  const [user, setUser] = useState<UserDto | null>(() => {
    try {
      const raw = localStorage.getItem(userProfileKey);
      return raw ? (JSON.parse(raw) as UserDto) : null;
    } catch {
      return null;
    }
  });

  // On mount: if a token exists but is expired/invalid, immediately clear it
  // so the app never fires authenticated requests with a stale token.
  useEffect(() => {
    const token = localStorage.getItem(authTokenKey);
    if (token && isTokenExpired(token)) {
      logout();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Listen for global "session expired" events dispatched by the API
  // response interceptor (401/403 responses). When received, clear local
  // auth state so the router redirects to /login.
  useEffect(() => {
    const handleSessionExpired = () => {
      setIsAuthenticated(false);
      setUserEmail(null);
      setRole(null);
      setUser(null);
      useNotificationStore.getState().clearAll();
    };

    window.addEventListener(AUTH_SESSION_EXPIRED_EVENT, handleSessionExpired);
    return () => {
      window.removeEventListener(
        AUTH_SESSION_EXPIRED_EVENT,
        handleSessionExpired,
      );
    };
  }, []);

  // Initialize SignalR when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      const token = localStorage.getItem(authTokenKey);
      if (token && !isTokenExpired(token)) {
        try {
          createSignalRConnection(token);

          // Setup notification listener
          onReceiveNotification((notification) => {
            useNotificationStore.getState().addNotification(notification);
            // You can add a toast notification here if desired
            console.log("Notification received:", notification);
          });

          startConnection().catch((err) => {
            console.error("Failed to start SignalR:", err);
          });
        } catch (err) {
          console.error("Failed to initialize SignalR:", err);
        }
      }
    } else {
      stopConnection().catch((err) => {
        console.error("Failed to stop SignalR:", err);
      });
    }

    return () => {
      if (!isAuthenticated) {
        stopConnection().catch((err) => {
          console.error("Failed to stop SignalR on cleanup:", err);
        });
      }
    };
  }, [isAuthenticated]);

  useEffect(() => {
    if (isAuthenticated) {
      refreshUser();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated]);

  const refreshUser = async () => {
    try {
      const resp = await apiClient.get<ApiResponse<UserDto>>("/users/me");
      if (resp.data?.succeeded && resp.data.data) {
        setUser(resp.data.data);
        localStorage.setItem(userProfileKey, JSON.stringify(resp.data.data));
      } else {
        // Backend returned a non-success ApiResponse (e.g. account
        // deactivated, user not found). Treat as an invalid session.
        logout();
        return;
      }

      // Load alerts count for badge
      try {
        const alertResp =
          await apiClient.get<ApiResponse<AlertCountDto>>("/alerts/count");
        if (alertResp.data?.succeeded && alertResp.data.data) {
          useNotificationStore.getState().setInitialCount(alertResp.data.data);
        }
      } catch (err) {
        console.warn("Failed to load alerts count:", err);
      }

      // Load notification/alert history
      try {
        const [notifResp, alertResp] = await Promise.all([
          apiClient.get<ApiResponse<any>>("/notifications"),
          apiClient.get<ApiResponse<any[]>>("/alerts").catch(() => ({ data: { succeeded: true, data: [] } }))
        ]);

        let mergedList: any[] = [];

        if (notifResp.data?.succeeded && notifResp.data.data) {
          const rawNotifs = Array.isArray(notifResp.data.data)
            ? notifResp.data.data
            : (notifResp.data.data.items || []);
          mergedList.push(
            ...rawNotifs.map((n: any) => ({
              ...normalizeIncomingNotification(n),
              isAlert: false
            }))
          );
        }

        if (alertResp.data?.succeeded && alertResp.data.data) {
          mergedList.push(
            ...alertResp.data.data.map((alert: any) => ({
              id: alert.id,
              userId: alert.userId || "",
              title: alert.alertType || "Alert",
              message: alert.message,
              type: alert.severity === "HIGH" ? "ERROR" : alert.severity === "MEDIUM" ? "WARNING" : "INFO",
              severity: alert.severity?.toLowerCase() === "high" ? "high" : alert.severity?.toLowerCase() === "medium" ? "medium" : "low",
              isRead: alert.isRead,
              createdAt: alert.createdAt || new Date().toISOString(),
              isAlert: true
            }))
          );
        }

        mergedList.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        useNotificationStore.getState().setInitialList(mergedList);
      } catch (err) {
        console.warn("Failed to load combined notifications:", err);
      }
    } catch (err: any) {
      const status = err?.response?.status;

      // 401/403 already triggers AUTH_SESSION_EXPIRED_EVENT via the API
      // interceptor (which clears state). For any other error, just clear
      // the cached profile but keep the session as-is.
      if (status === 401 || status === 403) {
        return;
      }

      setUser(null);
      localStorage.removeItem(userProfileKey);
    }
  };

  const login = async (email: string, token: string) => {
    setIsAuthenticated(true);
    setUserEmail(email);
    setRole(getRoleFromJwt(token));
    localStorage.setItem(authTokenKey, token);
    localStorage.setItem(userEmailKey, email);

    // attempt to fetch user profile and persist
    await refreshUser();
  };

  const logout = () => {
    setIsAuthenticated(false);
    setUserEmail(null);
    setRole(null);
    setUser(null);
    localStorage.removeItem(authTokenKey);
    localStorage.removeItem(userEmailKey);
    localStorage.removeItem(userProfileKey);
    useNotificationStore.getState().clearAll();
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        userEmail,
        role,
        user,
        login,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
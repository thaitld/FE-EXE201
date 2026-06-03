import { createContext, useContext, useState, useEffect } from "react";
import type { ReactNode } from "react";
import {
  apiClient,
  type ApiResponse,
  type UserDto,
  type AlertCountDto,
  getRoleFromJwt,
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

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(() =>
    Boolean(localStorage.getItem(authTokenKey)),
  );
  const [userEmail, setUserEmail] = useState<string | null>(() =>
    localStorage.getItem(userEmailKey),
  );
  const [role, setRole] = useState<string | null>(() => {
    const token = localStorage.getItem(authTokenKey);
    return token ? getRoleFromJwt(token) : null;
  });
  const [user, setUser] = useState<UserDto | null>(() => {
    try {
      const raw = localStorage.getItem(userProfileKey);
      return raw ? (JSON.parse(raw) as UserDto) : null;
    } catch {
      return null;
    }
  });

  // Initialize SignalR when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      const token = localStorage.getItem(authTokenKey);
      if (token) {
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

  const refreshUser = async () => {
    try {
      const resp = await apiClient.get<ApiResponse<UserDto>>("/users/me");
      if (resp.data?.succeeded && resp.data.data) {
        setUser(resp.data.data);
        localStorage.setItem(userProfileKey, JSON.stringify(resp.data.data));
      } else {
        setUser(null);
        localStorage.removeItem(userProfileKey);
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

      // Load notification history
      try {
        const notifResp =
          await apiClient.get<ApiResponse<NotificationDto[]>>("/notifications");
        if (notifResp.data?.succeeded && notifResp.data.data) {
          useNotificationStore.getState().setInitialList(notifResp.data.data);
        }
      } catch (err) {
        console.warn("Failed to load notifications:", err);
      }
    } catch {
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

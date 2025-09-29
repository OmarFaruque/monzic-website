"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { useRouter } from "next/navigation"

import { jwtDecode } from "jwt-decode";

// Cookie utility functions
const setCookie = (name: string, value: string, days: number) => {
  let expires = "";
  if (days) {
    const date = new Date();
    date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
    expires = "; expires=" + date.toUTCString();
  }
  document.cookie = name + "=" + (value || "") + expires + "; path=/";
};

const getCookie = (name: string): string | null => {
  const nameEQ = name + "=";
  const ca = document.cookie.split(";");
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) === " ") c = c.substring(1, c.length);
    if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
  }
  return null;
};

const removeCookie = (name: string) => {
  document.cookie = name + "=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;";
};

interface AdminAuthContextType {
  isAdminAuthenticated: boolean;
  adminUser: { id: string; email: string; role: string } | null;
  adminLogin: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  adminLogout: () => void;
  loading: boolean;
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [adminUser, setAdminUser] = useState<{ id: string; email: string; role: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkAdminAuth = () => {
      try {
        const adminToken = getCookie("adminAuthToken");

        if (adminToken) {
          const decodedToken: { id: string; email: string; role: string; exp: number } = jwtDecode(adminToken);
          if (decodedToken.exp * 1000 > Date.now()) {
            setAdminUser({ id: decodedToken.id, email: decodedToken.email, role: decodedToken.role });
            setIsAdminAuthenticated(true);
          }
        }
      } catch (error) {
        console.error("[Auth Context] Error in checkAdminAuth:", error);
      } finally {
        setLoading(false);
      }
    };

    checkAdminAuth();
  }, []);

  const adminLogin = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (data.token) {
        const decodedToken: { id: string; email: string; role: string } = jwtDecode(data.token);

        const adminUserData = {
          id: decodedToken.id,
          email: decodedToken.email,
          role: decodedToken.role,
        };

        setCookie("adminAuthToken", data.token, 7);
        setCookie("isAdminAuthenticated", "true", 7);

        setAdminUser(adminUserData);
        setIsAdminAuthenticated(true);

        return { success: true };
      } else {
        return { success: false, error: data.error || "Login failed" };
      }
    } catch (error) {
      console.error("Admin login error:", error);
      return { success: false, error: "Network error. Please try again." };
    }
  };

  const adminLogout = () => {
    removeCookie("adminAuthToken");

    setAdminUser(null);
    setIsAdminAuthenticated(false);

    router.push("/admin-login");
  };

  return (
    <AdminAuthContext.Provider
      value={{
        isAdminAuthenticated,
        adminUser,
        adminLogin,
        adminLogout,
        loading,
      }}
    >
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth() {
  const context = useContext(AdminAuthContext);
  if (context === undefined) {
    throw new Error("useAdminAuth must be used within an AdminAuthProvider");
  }
  return context;
}

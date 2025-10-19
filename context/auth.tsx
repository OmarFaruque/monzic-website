"use client"

import { useRouter } from "next/navigation"
import Cookies from "js-cookie";
import { jwtDecode } from "jwt-decode";

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const checkAuth = () => {
      setLoading(true);
      try {
        const token = Cookies.get("auth_token");

        if (token) {
          // Decode the token to get user data and expiration
          const decodedToken: { id: string; email: string; role: string; exp: number; firstName: string; lastName: string; stripeCustomerId: string | null; } = jwtDecode(token);

          // Check if the token is expired
          if (decodedToken.exp * 1000 > Date.now()) {

            const userIsAdmin = decodedToken.role === 'admin';
            const userData = {
              id: decodedToken.id,
              email: decodedToken.email,
              isAdmin: userIsAdmin,
              firstName: decodedToken.firstName,
              lastName: decodedToken.lastName,
              stripeCustomerId: decodedToken.stripeCustomerId,
            };
            setUser(userData);
            setIsAuthenticated(true);
            setIsAdmin(userIsAdmin);
            
          } else {
            // Token is expired, remove it
            Cookies.remove("auth_token");
          }
        }
      } catch (error) {
        console.error("Auth check failed:", error);
        // Clear cookie if it's invalid
        Cookies.remove("auth_token");
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = ({ user: apiUser, token }: LoginArgs, options?: { redirect?: boolean }) => {
    if (!apiUser || !token) {
      console.error("Login failed: Missing user data or token in login arguments.");
      return;
    }

    const userIsAdmin = apiUser.role === 'admin';

    const userToStore = {
      id: String(apiUser.id),
      email: apiUser.email,
      isAdmin: userIsAdmin,
      firstName: apiUser.firstName,
      lastName: apiUser.lastName,
      stripeCustomerId: apiUser.stripeCustomerId,
    };

    Cookies.set("auth_token", token, { expires: 1, secure: process.env.NODE_ENV === 'production' });

    setUser(userToStore);
    setIsAuthenticated(true);
    setIsAdmin(userIsAdmin);
    setLoading(false);

    const shouldRedirect = options?.redirect ?? true;

    if (shouldRedirect) {
      if (userIsAdmin) {
        router.push("/administrator");
      } else {
        router.push("/dashboard");
      }
    }
  };

  const logout = async () => {
    Cookies.remove("auth_token");
    localStorage.clear(); // Clear any leftover localStorage items
    setUser(null);
    setIsAuthenticated(false);
    setIsAdmin(false);
    router.push("/login");
  }

  return (
    <AuthContext.Provider value={{ isAuthenticated, isAdmin, user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

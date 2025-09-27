"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { useRouter } from "next/navigation"
import Cookies from "js-cookie";
import { jwtDecode } from "jwt-decode";

interface User {
  id: string;
  email: string;
  isAdmin: boolean;
}
interface LoginArgs {
  user: { id: string; email: string; role: string };
  token: string;
}
interface AuthContextType {
  isAuthenticated: boolean
  isAdmin: boolean
  user: User | null
  login: (apiUser: { id: string; email: string; role: string }, token: string) => void;
  logout: () => void
  loading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)
  const [user, setUser] = useState<{ id: string; email: string; isAdmin: boolean } | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const checkAuth = () => {
      setLoading(true);
      try {
        const token = Cookies.get("auth_token");

        

        if (token) {
          // Decode the token to get user data and expiration
          const decodedToken: { id: string; email: string; role: string; exp: number } = jwtDecode(token);

     
          // Check if the token is expired
          if (decodedToken.exp * 1000 > Date.now()) {

            const userIsAdmin = decodedToken.role === 'admin';
            const userData = {
              id: decodedToken.id,
              email: decodedToken.email,
              isAdmin: userIsAdmin,
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

  const login = ({ user: apiUser, token }: LoginArgs) => {
    if (!apiUser || !token) {
      console.error("Login failed: Missing user data or token in login arguments.");
      // Fallback to a test user if needed, or just return
      console.log('tokenis: ', token);
      console.log('apiUser is: ', user);
      return;
    }


    console.log('user from api: ', apiUser);

    // Convert the 'role' from the API to the 'isAdmin' boolean the context expects
    const userIsAdmin = apiUser.role === 'admin';

    const userToStore = {
      id: apiUser.id,
      email: apiUser.email,
      isAdmin: userIsAdmin,
    };

    console.log("Login called with:", userToStore);

    // Use js-cookie for reliable cookie setting
    Cookies.set("auth_token", token, { expires: 1, secure: process.env.NODE_ENV === 'production' });


    setUser(userToStore);
    setIsAuthenticated(true);
    setIsAdmin(userIsAdmin);
    setLoading(false);

    console.log("User logged in:", userToStore);
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

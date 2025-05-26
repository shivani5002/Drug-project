import { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';

interface User {
  id: string;
  email: string;
  name: string;
  mobile: string;
  email_verified: boolean;
  mobile_verified: boolean;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  signUp: (data: {
    email: string;
    password: string;
    name: string;
    mobile: string;
  }) => Promise<{ success: boolean; user_id?: string; mobile?: string; error?: string }>;
  verifyMobile: (mobile: string, otp: string) => Promise<{ success: boolean; message?: string }>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => void;
  isAuthenticated: boolean;
  resendOtp: (mobile: string, userId: string) => Promise<{ success: boolean }>;
}

const AuthContext = createContext<AuthContextType | null>(null);

//const API_BASE_URL = import.meta.env.DEV ? 'http://localhost:5000/api/auth' : '/api/auth';
const API_BASE_URL = 'https://auth-service-ztol.onrender.com/api/auth';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  // Initialize auth state
  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');

      if (token && storedUser) {
        try {
          const response = await fetch(`${API_BASE_URL}/validate`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });

          if (response.ok) {
            setUser(JSON.parse(storedUser));
          } else {
            signOut();
          }
        } catch (error) {
          console.error('Auth validation failed:', error);
          signOut();
        }
      }
      setIsLoading(false);
    };

    initializeAuth();
  }, []);

  const signUp = async (data: {
    email: string;
    password: string;
    name: string;
    mobile: string;
  }) => {
    try {
      const response = await fetch(`${API_BASE_URL}/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      return await response.json();
    } catch (error) {
      return { success: false, error: 'Network error' };
    }
  };

  const verifyMobile = async (mobile: string, otp: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/verify-mobile`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mobile, otp }),
      });
      return await response.json();
    } catch (error) {
      return { success: false, error: 'Network error' };
    }
  };

  const signIn = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/signin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
  
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Login failed');
      }
  
      // Store token and complete user data
      localStorage.setItem('token', result.token);
      localStorage.setItem('user', JSON.stringify(result.user));
      setUser(result.user);
      
      // Navigate to home page
      navigate('/');
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };
  const signOut = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    navigate('/signin');
  };

  const resendOtp = async (mobile: string, userId: string) => {
    const response = await fetch(`${API_BASE_URL}/resend-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mobile, user_id: userId }),
    });
    return await response.json();
  };

  const isAuthenticated = useMemo(() => (
    !!user && user.email_verified && user.mobile_verified
  ), [user]);

  const value = useMemo(() => ({
    user,
    isLoading,
    signUp,
    verifyMobile,
    signIn,
    signOut,
    isAuthenticated,
    resendOtp,
  }), [user, isLoading, isAuthenticated]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export { AuthContext };

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
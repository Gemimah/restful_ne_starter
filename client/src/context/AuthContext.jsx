import { createContext, useContext, useEffect, useState } from 'react';
import { authService } from '../services/auth.service.js';
import { storage } from '../utils/storage.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(storage.getUser());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = storage.getToken();
    if (!token) {
      setLoading(false);
      return;
    }

    authService
      .getMe()
      .then((res) => {
        setUser(res.data.user);
        storage.setUser(res.data.user);
      })
      .catch(() => {
        storage.clear();
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, []);

  const login = (token, userData) => {
    storage.setToken(token);
    storage.setUser(userData);
    setUser(userData);
  };

  const logout = async () => {
    try {
      if (storage.getToken()) {
        await authService.logout();
      }
    } catch {
      // Clear local session even if API call fails
    } finally {
      storage.clear();
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, setUser, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

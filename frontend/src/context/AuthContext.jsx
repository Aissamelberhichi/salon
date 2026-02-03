import { createContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const { data } = await authAPI.getMe();
      setUser(data.user);
    } catch (error) {
      setUser(null);
    }
    setLoading(false);
  };

  const login = async (email, password) => {
    const { data } = await authAPI.login({ email, password });
    setUser(data.user);
    return data;
  };

  const registerClient = async (formData) => {
    const { data } = await authAPI.registerClient(formData);
    // Ne pas connecter automatiquement après inscription
    // L'utilisateur doit vérifier son email d'abord
    return data;
  };

  const registerSalonOwner = async (formData) => {
    const { data } = await authAPI.registerSalonOwner(formData);
    // Ne pas connecter automatiquement après inscription
    // L'utilisateur doit vérifier son email d'abord
    return data;
  };

  const logout = async () => {
    try {
      await authAPI.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{ user, loading, login, registerClient, registerSalonOwner, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
};
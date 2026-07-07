import React, { createContext, useContext } from 'react';

interface AuthContextType {
  user: null;
  loading: false;
  isAdmin: false;
  isLocalMode: false;
  setLocalAdminSession: (active: boolean) => void;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: false,
  isAdmin: false,
  isLocalMode: false,
  setLocalAdminSession: () => {},
  signOut: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export const FirebaseProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <AuthContext.Provider value={{ user: null, loading: false, isAdmin: false, isLocalMode: false, setLocalAdminSession: () => {}, signOut: async () => {} }}>{children}</AuthContext.Provider>;
};

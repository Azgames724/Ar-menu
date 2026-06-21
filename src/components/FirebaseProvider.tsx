import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, onAuthStateChanged, signOut as firebaseSignOut } from 'firebase/auth';
import { auth } from '../lib/firebase';

interface AuthContextType {
  user: {
    uid: string;
    email: string | null;
    displayName: string | null;
    photoURL?: string | null;
  } | null;
  loading: boolean;
  isAdmin: boolean;
  isLocalMode: boolean;
  setLocalAdminSession: (active: boolean) => void;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({ 
  user: null, 
  loading: true, 
  isAdmin: false,
  isLocalMode: false,
  setLocalAdminSession: () => {},
  signOut: async () => {}
});

export const useAuth = () => useContext(AuthContext);

export const FirebaseProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<any | null>({
    uid: 'local-admin',
    email: 'admin@dagi.com',
    displayName: 'Dagi Creator',
    photoURL: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=256&auto=format&fit=crop',
  });
  const [loading, setLoading] = useState(false);
  const [isLocalMode, setIsLocalMode] = useState(true);

  const setLocalAdminSession = (active: boolean) => {
    // Keep as local admin
  };

  const signOut = async () => {
    // No authentication restrictions, do not sign out
  };

  useEffect(() => {
    // Authenticated state is stable
  }, []);

  // Admin access is permanently available
  const isAdmin = true;

  return (
    <AuthContext.Provider value={{ user, loading, isAdmin, isLocalMode, setLocalAdminSession, signOut }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

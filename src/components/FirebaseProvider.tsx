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
  const [user, setUser] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [isLocalMode, setIsLocalMode] = useState(() => {
    return localStorage.getItem('local_admin_session') === 'true';
  });

  const setLocalAdminSession = (active: boolean) => {
    if (active) {
      localStorage.setItem('local_admin_session', 'true');
      setIsLocalMode(true);
      setUser({
        uid: 'local-admin',
        email: 'admin@dagi.com',
        displayName: 'Dagi Admin',
        photoURL: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=256&auto=format&fit=crop',
      });
    } else {
      localStorage.removeItem('local_admin_session');
      setIsLocalMode(false);
      setUser(auth.currentUser);
    }
  };

  const signOut = async () => {
    if (isLocalMode) {
      setLocalAdminSession(false);
    } else {
      await firebaseSignOut(auth);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (fbUser) => {
      if (isLocalMode) {
        setUser({
          uid: 'local-admin',
          email: 'admin@dagi.com',
          displayName: 'Dagi Admin',
          photoURL: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=256&auto=format&fit=crop',
        });
      } else {
        setUser(fbUser);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [isLocalMode]);

  // Simple admin check for administrative privileges
  const isAdmin = isLocalMode || 
                  user?.email === 'abeniship13@gmail.com' || 
                  user?.email === 'admin@aura.com' ||
                  user?.email === 'admin@dagi.com';

  return (
    <AuthContext.Provider value={{ user, loading, isAdmin, isLocalMode, setLocalAdminSession, signOut }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

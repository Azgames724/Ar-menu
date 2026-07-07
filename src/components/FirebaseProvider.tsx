import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, onAuthStateChanged, signOut as firebaseSignOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';

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
  signOut: async () => {},
});

export const useAuth = () => useContext(AuthContext);

const ADMIN_EMAIL = 'abeniship13@gmail.com';

export const FirebaseProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthContextType['user']>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: User | null) => {
      if (firebaseUser) {
        setUser({
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName,
          photoURL: firebaseUser.photoURL,
        });

        // Check admin status: hardcoded owner email OR presence in /admins collection
        let admin = firebaseUser.email === ADMIN_EMAIL && firebaseUser.emailVerified;
        if (!admin) {
          try {
            const adminDoc = await getDoc(doc(db, 'admins', firebaseUser.uid));
            admin = adminDoc.exists();
          } catch {
            admin = false;
          }
        }
        setIsAdmin(admin);
      } else {
        setUser(null);
        setIsAdmin(false);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signOut = async () => {
    await firebaseSignOut(auth);
  };

  // setLocalAdminSession is a no-op — kept for interface compatibility
  const setLocalAdminSession = (_active: boolean) => {};

  return (
    <AuthContext.Provider value={{ user, loading, isAdmin, isLocalMode: false, setLocalAdminSession, signOut }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

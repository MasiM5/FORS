import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../firebase';
import { UserProfile, School } from '../types';

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  selectedSchool: School | null;
  setSelectedSchool: (school: School | null) => void;
  loading: boolean;
  isInitialized: boolean;
  isAdmin: boolean;
  isSchoolAdmin: boolean;
  isClerk: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  selectedSchool: null,
  setSelectedSchool: () => {},
  loading: true,
  isInitialized: false,
  isAdmin: false,
  isSchoolAdmin: false,
  isClerk: false,
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [selectedSchool, setSelectedSchoolState] = useState<School | null>(null);
  const [loading, setLoading] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);

  // Persistence for school selection
  useEffect(() => {
    const saved = localStorage.getItem('selected_school_context');
    if (saved) {
      try {
        setSelectedSchoolState(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse saved school context");
      }
    }
  }, []);

  const setSelectedSchool = (school: School | null) => {
    setSelectedSchoolState(school);
    if (school) {
      localStorage.setItem('selected_school_context', JSON.stringify(school));
    } else {
      localStorage.removeItem('selected_school_context');
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setLoading(true);
      setUser(user);
      
      if (user) {
        try {
          const docRef = doc(db, 'users', user.uid);
          const docSnap = await getDoc(docRef);
          
          if (docSnap.exists()) {
            const data = docSnap.data();
            setProfile({ uid: user.uid, ...data } as UserProfile);
            
            // If user is locked to a school, auto-select it
            if (data.schoolId && data.role !== 'admin') {
              const schoolSnap = await getDoc(doc(db, 'schools', data.schoolId));
              if (schoolSnap.exists()) {
                setSelectedSchool({ id: schoolSnap.id, ...schoolSnap.data() } as School);
              }
            }
          } else {
            // Auto-bootstrap first user as admin if email matches
            const isAdminEmail = user.email === 'steven.mwale23@gmail.com';
            const newProfile: Omit<UserProfile, 'uid'> = {
              fullName: user.displayName || 'System User',
              email: user.email || '',
              role: isAdminEmail ? 'admin' : 'clerk',
              createdAt: serverTimestamp(),
            };
            await setDoc(docRef, newProfile);
            setProfile({ uid: user.uid, ...newProfile } as UserProfile);
          }
        } catch (err) {
          console.error("Auth initialization error:", err);
        }
      } else {
        setProfile(null);
        setSelectedSchoolState(null);
        localStorage.removeItem('selected_school_context');
      }
      
      setIsInitialized(true);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const value = {
    user,
    profile,
    selectedSchool,
    setSelectedSchool,
    loading,
    isInitialized,
    isAdmin: profile?.role === 'admin',
    isSchoolAdmin: profile?.role === 'admin' || profile?.role === 'school_admin',
    isClerk: !!profile?.role,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);

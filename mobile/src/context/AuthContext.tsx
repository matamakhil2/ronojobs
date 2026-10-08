import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole, CandidateProfile, CompanyProfile } from '../types';
import { authApi, getStoredToken, setStoredToken, removeStoredToken } from '../services/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (payload: {
    email: string;
    password: string;
    role: 'candidate' | 'employer';
    fullName?: string;
    companyName?: string;
  }) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (updated: Partial<User>) => void;
  setDemoUser: (role: UserRole) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Initialize auth on load
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const storedToken = await getStoredToken();
        if (storedToken) {
          setToken(storedToken);
          try {
            const res = await authApi.getMe();
            if (res.user) {
              const candidateName =
                (res.user.profile as any)?.full_name ||
                (res.user as any)?.fullName ||
                res.user.email?.split('@')[0] ||
                'Candidate';
              const companyName =
                (res.user.profile as any)?.name ||
                (res.user as any)?.companyName ||
                'My Company';

              setUser({
                ...res.user,
                profile: res.user.profile || (res.user.role === 'candidate'
                  ? ({ user_id: res.user.id, full_name: candidateName, skills: [] } as CandidateProfile)
                  : ({ user_id: res.user.id, name: companyName } as CompanyProfile)),
              });
            }
          } catch (e) {
            console.warn('Token validation failed, falling back to guest/demo mode');
            await removeStoredToken();
            setToken(null);
          }
        }
      } catch (err) {
        console.error('Auth initialization error:', err);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const res = await authApi.login(email, password);
      await setStoredToken(res.token);
      setToken(res.token);

      const candidateName =
        (res.user?.profile as any)?.full_name ||
        (res.user as any)?.fullName ||
        email.split('@')[0] ||
        'Candidate';
      const companyName =
        (res.user?.profile as any)?.name ||
        (res.user as any)?.companyName ||
        'My Company';

      const userWithProfile: User = {
        ...res.user,
        profile: res.user.profile || (res.user.role === 'candidate'
          ? ({ user_id: res.user.id, full_name: candidateName, skills: [] } as CandidateProfile)
          : ({ user_id: res.user.id, name: companyName } as CompanyProfile)),
      };
      setUser(userWithProfile);
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (payload: {
    email: string;
    password: string;
    role: 'candidate' | 'employer';
    fullName?: string;
    companyName?: string;
  }) => {
    setIsLoading(true);
    try {
      const res = await authApi.register(payload);
      await setStoredToken(res.token);
      setToken(res.token);

      const candidateName =
        payload.fullName?.trim() ||
        (res.user?.profile as any)?.full_name ||
        (res.user as any)?.fullName ||
        payload.email.split('@')[0] ||
        'Candidate';
      const companyName =
        payload.companyName?.trim() ||
        (res.user?.profile as any)?.name ||
        (res.user as any)?.companyName ||
        'My Company';

      const userWithProfile: User = {
        ...res.user,
        profile: res.user.profile || (res.user.role === 'candidate'
          ? ({ user_id: res.user.id, full_name: candidateName, skills: [] } as CandidateProfile)
          : ({ user_id: res.user.id, name: companyName } as CompanyProfile)),
      };
      setUser(userWithProfile);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    await removeStoredToken();
    setToken(null);
    setUser(null);
  };

  const updateUser = (updated: Partial<User>) => {
    if (user) {
      setUser({ ...user, ...updated });
    }
  };

  // Convenient helper for testing candidates vs employers instantly in the app
  const setDemoUser = async (role: UserRole) => {
    setIsLoading(true);
    try {
      if (role === 'candidate') {
        try {
          const res = await authApi.login('alex.dev@gmail.com', 'Candidate@123');
          await setStoredToken(res.token);
          setToken(res.token);
          setUser(res.user);
          return;
        } catch (apiErr) {
          console.warn('Backend login for demo candidate failed, using local offline fallback:', apiErr);
        }

        const demoCandidate: User = {
          id: 'c1111111-1111-1111-1111-111111111111',
          email: 'alex.dev@gmail.com',
          role: 'candidate',
          profile: {
            user_id: 'c1111111-1111-1111-1111-111111111111',
            full_name: 'Alex Rivera',
            phone: '+1 (555) 234-5678',
            location: 'San Francisco, CA',
            headline: 'Senior Full Stack & Mobile Engineer',
            bio: '5+ years building scale mobile apps with React Native, TypeScript, Node.js & PostgreSQL.',
            experience_years: 5,
            education: 'B.S. in Computer Science, UC Berkeley',
            resume_url: 'https://ronojobs.com/resumes/alex_rivera_cv.pdf',
            skills: ['React Native', 'Expo', 'TypeScript', 'Node.js', 'PostgreSQL', 'Docker'],
          } as CandidateProfile,
        };
        setUser(demoCandidate);
        setToken('demo-candidate-token');
        await setStoredToken('demo-candidate-token');
      } else if (role === 'employer') {
        try {
          const res = await authApi.login('recruiter@techcorp.com', 'Employer@123');
          await setStoredToken(res.token);
          setToken(res.token);
          setUser(res.user);
          return;
        } catch (apiErr) {
          console.warn('Backend login for demo employer failed, using local offline fallback:', apiErr);
        }

        const demoEmployer: User = {
          id: 'e2222222-2222-2222-2222-222222222222',
          email: 'recruiter@techcorp.com',
          role: 'employer',
          profile: {
            user_id: 'e2222222-2222-2222-2222-222222222222',
            name: 'CloudScale Technologies',
            logo_url: 'https://images.unsplash.com/photo-1549923746-c502d488b3ea?w=200&auto=format&fit=crop&q=80',
            description: 'Building next-generation distributed cloud infrastructure and developer tools.',
            website: 'https://cloudscale.example.com',
            location: 'San Francisco, CA / Remote',
            industry: 'Cloud & DevOps',
          } as CompanyProfile,
        };
        setUser(demoEmployer);
        setToken('demo-employer-token');
        await setStoredToken('demo-employer-token');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        updateUser,
        setDemoUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

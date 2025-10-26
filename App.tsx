import React, { useState, useEffect, useCallback } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signOut, onAuthStateChanged, Auth, User } from 'firebase/auth';
import LoginScreen from './components/LoginScreen';
import ApiKeySelector from './components/ApiKeySelector';
import MainLayout from './components/MainLayout';
import FirebaseConfigError from './components/FirebaseConfigError';
import { UserData } from './types';

// @ts-ignore
declare var window: any;

// Fix: Augment the ImportMeta interface to include Vite's environment variables.
// This resolves the TypeScript error "Property 'env' does not exist on type 'ImportMeta'".
declare global {
  interface ImportMeta {
    readonly env: {
      readonly VITE_FIREBASE_API_KEY: string;
      readonly VITE_FIREBASE_AUTH_DOMAIN: string;
      readonly VITE_FIREBASE_PROJECT_ID: string;
      readonly VITE_FIREBASE_STORAGE_BUCKET: string;
      readonly VITE_FIREBASE_MESSAGING_SENDER_ID: string;
      readonly VITE_FIREBASE_APP_ID: string;
    };
  }
}

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

const isFirebaseConfigured = !!(firebaseConfig.apiKey && firebaseConfig.authDomain && firebaseConfig.projectId);
let auth: Auth | null = null;
let googleProvider: GoogleAuthProvider | null = null;

if (isFirebaseConfigured) {
  try {
    const app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    googleProvider = new GoogleAuthProvider();
  } catch (error) {
    console.error("Firebase initialization failed:", error);
  }
}

const FREE_TIER_GENERATIONS = 2;

const getUserDataKey = (uid: string) => `genluxUser_${uid}`;

const loadUserData = (uid: string): UserData => {
  const savedData = localStorage.getItem(getUserDataKey(uid));
  if (savedData) {
    return JSON.parse(savedData);
  }
  // Default for new users
  return {
    plan: 'free',
    generationsLeft: FREE_TIER_GENERATIONS
  };
};

const saveUserData = (uid: string, data: UserData) => {
  localStorage.setItem(getUserDataKey(uid), JSON.stringify(data));
};

enum AppState {
  LOADING,
  LOGGED_OUT,
  NEEDS_API_KEY,
  READY,
}

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>(AppState.LOADING);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);

  const checkApiKey = useCallback(async () => {
    try {
      // @ts-ignore
      if (window.aistudio && await window.aistudio.hasSelectedApiKey()) {
        setAppState(AppState.READY);
      } else {
        setAppState(AppState.NEEDS_API_KEY);
      }
    } catch (e) {
      console.error("aistudio not available, assuming API key is needed for Veo.", e);
      setAppState(AppState.NEEDS_API_KEY);
    }
  }, []);

  useEffect(() => {
    if (!isFirebaseConfigured || !auth) return;

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setCurrentUser(user);
        setUserData(loadUserData(user.uid));
        checkApiKey();
      } else {
        setCurrentUser(null);
        setUserData(null);
        setAppState(AppState.LOGGED_OUT);
      }
    });

    return () => unsubscribe();
  }, [checkApiKey]);

  if (!isFirebaseConfigured || !auth || !googleProvider) {
    return <FirebaseConfigError />;
  }

  const handleLogout = () => {
    signOut(auth!).catch(error => console.error("Logout failed:", error));
  };
  
  const handleKeySelected = () => {
    setTimeout(() => setAppState(AppState.READY), 100);
  };

  const handleApiKeyInvalid = () => {
    console.warn("API Key is invalid or not found. Prompting user to select a new one.");
    setAppState(AppState.NEEDS_API_KEY);
  };

  const handleSuccessfulGeneration = () => {
    if (currentUser && userData && userData.plan === 'free') {
      const newUserData = { ...userData, generationsLeft: Math.max(0, userData.generationsLeft - 1) };
      setUserData(newUserData);
      saveUserData(currentUser.uid, newUserData);
    }
  };

  const handleUpgrade = () => {
     if (currentUser && userData) {
      const newUserData = { ...userData, plan: 'pro' as const };
      setUserData(newUserData);
      saveUserData(currentUser.uid, newUserData);
    }
  };
  
  const renderContent = () => {
    switch (appState) {
      case AppState.LOADING:
        return (
          <div className="flex items-center justify-center h-screen">
            <div className="w-16 h-16 border-4 border-t-purple-500 border-gray-600 rounded-full animate-spin"></div>
          </div>
        );
      case AppState.LOGGED_OUT:
        return <LoginScreen auth={auth!} googleProvider={googleProvider!} />;
      case AppState.NEEDS_API_KEY:
        return <ApiKeySelector onKeySelected={handleKeySelected} />;
      case AppState.READY:
        if (!userData) return null; // Should not happen if state logic is correct
        return (
            <MainLayout 
                onLogout={handleLogout} 
                onApiKeyInvalid={handleApiKeyInvalid}
                userData={userData}
                onSuccessfulGeneration={handleSuccessfulGeneration}
                onUpgrade={handleUpgrade}
            />
        );
      default:
        return <LoginScreen auth={auth!} googleProvider={googleProvider!} />;
    }
  };

  return <div className="bg-gray-900 min-h-screen">{renderContent()}</div>;
};

export default App;

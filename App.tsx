import React, { useState, useEffect, useCallback } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signOut, onAuthStateChanged, Auth } from 'firebase/auth';
import LoginScreen from './components/LoginScreen';
import ApiKeySelector from './components/ApiKeySelector';
import MainLayout from './components/MainLayout';
import FirebaseConfigError from './components/FirebaseConfigError';

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

// =================================================================================
// FIREBASE CONFIGURATION
// =================================================================================
// This configuration now reads from environment variables.
// Ensure you have set these variables in your Cloudflare deployment settings.
// Example: VITE_FIREBASE_API_KEY, VITE_FIREBASE_AUTH_DOMAIN, etc.
// =================================================================================
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

// Check if Firebase config is valid and initialize
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
    // If initialization fails, we'll treat it as not configured.
  }
}


enum AppState {
  LOADING,
  LOGGED_OUT,
  NEEDS_API_KEY,
  READY,
}

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>(AppState.LOADING);

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
      // In a real scenario outside this specific environment, you might default to READY
      // or have another way of providing the key. For this app, it's mandatory.
      setAppState(AppState.NEEDS_API_KEY);
    }
  }, []);

  useEffect(() => {
    if (!isFirebaseConfigured || !auth) {
      // Don't set up auth listener if Firebase is not configured
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        // User is signed in, check for API key.
        checkApiKey();
      } else {
        // User is signed out.
        setAppState(AppState.LOGGED_OUT);
      }
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, [checkApiKey]);

  // Render error screen if Firebase is not configured or failed to initialize
  if (!isFirebaseConfigured || !auth || !googleProvider) {
    return <FirebaseConfigError />;
  }

  const handleLogout = () => {
    signOut(auth!).catch(error => console.error("Logout failed:", error));
  };
  
  const handleKeySelected = () => {
    // A slight delay can help ensure the key is available immediately after selection
    setTimeout(() => setAppState(AppState.READY), 100);
  };

  const handleApiKeyInvalid = () => {
    console.warn("API Key is invalid or not found. Prompting user to select a new one.");
    setAppState(AppState.NEEDS_API_KEY);
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
        return <MainLayout onLogout={handleLogout} onApiKeyInvalid={handleApiKeyInvalid} />;
      default:
        return <LoginScreen auth={auth!} googleProvider={googleProvider!} />;
    }
  };

  return <div className="bg-gray-900 min-h-screen">{renderContent()}</div>;
};

export default App;
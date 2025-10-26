import React, { useState, useEffect, useCallback } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signOut, onAuthStateChanged, Auth } from 'firebase/auth';
import LoginScreen from './components/LoginScreen';
import ApiKeySelector from './components/ApiKeySelector';
import MainLayout from './components/MainLayout';

// @ts-ignore
declare var window: any;
// @ts-ignore
declare var process: any;

// =================================================================================
// FIREBASE CONFIGURATION
// =================================================================================
// This configuration now reads from environment variables.
// Ensure you have set these variables in your Cloudflare deployment settings.
// Example: VITE_FIREBASE_API_KEY, VITE_FIREBASE_AUTH_DOMAIN, etc.
// =================================================================================
const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID
};


// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth: Auth = getAuth(app);
const googleProvider: GoogleAuthProvider = new GoogleAuthProvider();


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

  const handleLogout = () => {
    signOut(auth).catch(error => console.error("Logout failed:", error));
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
        return <LoginScreen auth={auth} googleProvider={googleProvider} />;
      case AppState.NEEDS_API_KEY:
        return <ApiKeySelector onKeySelected={handleKeySelected} />;
      case AppState.READY:
        return <MainLayout onLogout={handleLogout} onApiKeyInvalid={handleApiKeyInvalid} />;
      default:
        return <LoginScreen auth={auth} googleProvider={googleProvider} />;
    }
  };

  return <div className="bg-gray-900 min-h-screen">{renderContent()}</div>;
};

export default App;

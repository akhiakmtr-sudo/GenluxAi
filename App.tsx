
import React, { useState, useEffect, useCallback } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signOut, onAuthStateChanged } from 'firebase/auth';
import LoginScreen from './components/LoginScreen';
import ApiKeySelector from './components/ApiKeySelector';
import MainLayout from './components/MainLayout';

// @ts-ignore
declare var window: any;

// NOTE: These are placeholder values. A real app would get these from a secure source.
const firebaseConfig = {
  apiKey: "YOUR_API_KEY_PLACEHOLDER",
  authDomain: "your-project-id.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project-id.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:your-app-id"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();


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
    setAppState(AppState.READY);
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
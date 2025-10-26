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
// IMPORTANT: FIREBASE CONFIGURATION
// =================================================================================
// The FirebaseError (auth/invalid-api-key) occurs because the environment 
// variables are not set in this development environment. 
//
// I have replaced them with placeholder values to allow the application to run
// without crashing. 
//
// YOU MUST REPLACE these placeholders with your actual Firebase project 
// configuration. For your Cloudflare deployment, you should continue to use 
// environment variables as previously discussed.
// =================================================================================
const firebaseConfig = {
  apiKey: "AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX", // REPLACE WITH YOUR FIREBASE API KEY
  authDomain: "your-project-id.firebaseapp.com",      // REPLACE WITH YOUR FIREBASE AUTH DOMAIN
  projectId: "your-project-id",                       // REPLACE WITH YOUR FIREBASE PROJECT ID
  storageBucket: "your-project-id.appspot.com",       // REPLACE WITH YOUR FIREBASE STORAGE BUCKET
  messagingSenderId: "123456789012",                  // REPLACE WITH YOUR MESSAGING SENDER ID
  appId: "1:123456789012:web:abcdef1234567890abcdef" // REPLACE WITH YOUR APP ID
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

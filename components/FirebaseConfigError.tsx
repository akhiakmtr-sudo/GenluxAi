import React from 'react';

const FirebaseConfigError: React.FC = () => {
  return (
    <div className="flex items-center justify-center h-screen bg-gray-900 text-white">
      <div className="text-center p-8 bg-gray-800 rounded-2xl shadow-2xl max-w-2xl mx-auto border border-red-500/50">
        <div className="text-red-400 mb-4">
          <i className="fas fa-exclamation-triangle text-5xl"></i>
        </div>
        <h2 className="text-3xl font-bold mb-3 text-white">Firebase Configuration Missing</h2>
        <p className="text-gray-400 mb-6">
          The application cannot start because the Firebase configuration is incomplete. Authentication features require a valid Firebase project setup.
        </p>
        <div className="text-left bg-gray-900 p-4 rounded-lg border border-gray-700">
          <p className="text-gray-300 font-mono text-sm">
            Please ensure the following environment variables are set in your deployment environment:
          </p>
          <ul className="list-disc list-inside mt-2 text-gray-400 font-mono text-sm space-y-1">
            <li>VITE_FIREBASE_API_KEY</li>
            <li>VITE_FIREBASE_AUTH_DOMAIN</li>
            <li>VITE_FIREBASE_PROJECT_ID</li>
            <li>VITE_FIREBASE_STORAGE_BUCKET</li>
            <li>VITE_FIREBASE_MESSAGING_SENDER_ID</li>
            <li>VITE_FIREBASE_APP_ID</li>
          </ul>
        </div>
         <p className="text-gray-500 mt-6 text-sm">
          Once configured, please refresh the application.
        </p>
      </div>
    </div>
  );
};

export default FirebaseConfigError;

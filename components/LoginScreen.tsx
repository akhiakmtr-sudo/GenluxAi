
import React, { useState } from 'react';
import { Auth, GoogleAuthProvider, signInWithEmailAndPassword, signInWithPopup } from 'firebase/auth';

interface LoginScreenProps {
  auth: Auth;
  googleProvider: GoogleAuthProvider;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ auth, googleProvider }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    setLoading(true);
    setError(null);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      // onAuthStateChanged in App.tsx will handle the redirect
    } catch (err: any) {
      setError("Failed to sign in. Please check your credentials.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError(null);
    try {
      await signInWithPopup(auth, googleProvider);
      // onAuthStateChanged in App.tsx will handle the redirect
    } catch (err: any) {
      setError("Failed to sign in with Google.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 px-4">
      <div className="w-full max-w-md p-8 space-y-8 bg-gray-800 rounded-2xl shadow-2xl border border-gray-700">
        <div className="text-center">
            <div className="flex items-center justify-center mb-4">
                <i className="fas fa-film text-4xl text-purple-400 mr-3"></i>
                <h1 className="text-4xl font-bold tracking-wider">
                    Genlux <span className="text-purple-400">AI</span>
                </h1>
            </div>
            <p className="mt-2 text-lg text-gray-400">Generate stunning videos with AI.</p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleEmailLogin}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <input
                id="email-address"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="appearance-none rounded-none relative block w-full px-3 py-3 border border-gray-600 bg-gray-700 text-gray-200 rounded-t-md focus:outline-none focus:ring-purple-500 focus:border-purple-500 focus:z-10 sm:text-sm"
                placeholder="Email address"
                disabled={loading}
              />
            </div>
            <div>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="appearance-none rounded-none relative block w-full px-3 py-3 border border-gray-600 bg-gray-700 text-gray-200 rounded-b-md focus:outline-none focus:ring-purple-500 focus:border-purple-500 focus:z-10 sm:text-sm"
                placeholder="Password"
                disabled={loading}
              />
            </div>
          </div>

          {error && (
            <div className="text-center text-sm text-red-400 p-2 bg-red-900/50 rounded-md">
              {error}
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 focus:ring-offset-gray-800 transition-colors disabled:opacity-50"
            >
              {loading ? <i className="fas fa-spinner fa-spin"></i> : 'Sign in'}
            </button>
          </div>
        </form>
        <div className="relative">
            <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-600"></div>
            </div>
            <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-gray-800 text-gray-500">Or continue with</span>
            </div>
        </div>
        <div>
            <button
                onClick={handleGoogleLogin}
                disabled={loading}
                className="group relative w-full flex justify-center py-3 px-4 border border-gray-600 text-sm font-medium rounded-md text-gray-200 bg-gray-700 hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 focus:ring-offset-gray-800 transition-colors disabled:opacity-50"
            >
                <i className="fab fa-google mr-2"></i>
                Sign in with Google
            </button>
        </div>
      </div>
    </div>
  );
};

export default LoginScreen;
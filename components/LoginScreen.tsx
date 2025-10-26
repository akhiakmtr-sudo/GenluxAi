import React, { useState } from 'react';
import { Auth, GoogleAuthProvider, signInWithEmailAndPassword, signInWithPopup, createUserWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth';

interface LoginScreenProps {
  auth: Auth;
  googleProvider: GoogleAuthProvider;
}

type AuthMode = 'login' | 'signup' | 'forgotPassword';

const LoginScreen: React.FC<LoginScreenProps> = ({ auth, googleProvider }) => {
  const [mode, setMode] = useState<AuthMode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const clearFormState = () => {
    setEmail('');
    setPassword('');
    setError(null);
    setMessage(null);
  };

  const switchMode = (newMode: AuthMode) => {
    setMode(newMode);
    clearFormState();
  };

  const handleEmailPasswordAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      if (mode === 'login') {
        if (!password) throw new Error("Password is required.");
        await signInWithEmailAndPassword(auth, email, password);
      } else if (mode === 'signup') {
        if (!password) throw new Error("Password is required.");
        await createUserWithEmailAndPassword(auth, email, password);
      } else if (mode === 'forgotPassword') {
        await sendPasswordResetEmail(auth, email);
        setMessage("Password reset link sent! Please check your email.");
      }
    } catch (err: any) {
      let errorMessage = "An unexpected error occurred.";
      switch (err.code) {
        case 'auth/user-not-found':
          errorMessage = "No account found with this email.";
          break;
        case 'auth/wrong-password':
          errorMessage = "Incorrect password. Please try again.";
          break;
        case 'auth/email-already-in-use':
          errorMessage = "This email is already registered. Please sign in.";
          break;
        case 'auth/weak-password':
          errorMessage = "Password should be at least 6 characters.";
          break;
        case 'auth/invalid-email':
            errorMessage = "Please enter a valid email address.";
            break;
        default:
          errorMessage = "Failed to authenticate. Please try again later.";
          console.error(err);
      }
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError(null);
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err: any) {
      setError("Failed to sign in with Google.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const renderFormContent = () => {
    if (mode === 'forgotPassword') {
      return (
        <>
          <h2 className="text-2xl font-bold text-center text-white">Reset Password</h2>
          <p className="text-center text-gray-400 text-sm mb-6">Enter your email to receive a reset link.</p>
          <form className="space-y-6" onSubmit={handleEmailPasswordAuth}>
            <div>
              <input
                id="email-address"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="appearance-none relative block w-full px-3 py-3 border border-gray-600 bg-gray-700 text-gray-200 rounded-md focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
                placeholder="Email address"
                disabled={loading}
              />
            </div>
            <div>
              <button
                type="submit"
                disabled={loading}
                className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 focus:ring-offset-gray-800 transition-colors disabled:opacity-50"
              >
                {loading ? <i className="fas fa-spinner fa-spin"></i> : 'Send Reset Link'}
              </button>
            </div>
          </form>
          <div className="text-sm text-center mt-4">
            <button onClick={() => switchMode('login')} className="font-medium text-purple-400 hover:text-purple-300">
              Back to Sign In
            </button>
          </div>
        </>
      );
    }

    return (
      <>
        <div className="flex border-b border-gray-700">
          <button 
            onClick={() => switchMode('login')} 
            className={`flex-1 py-3 text-sm font-semibold transition-colors ${mode === 'login' ? 'text-purple-400 border-b-2 border-purple-400' : 'text-gray-400 hover:text-white'}`}
          >
            SIGN IN
          </button>
          <button 
            onClick={() => switchMode('signup')} 
            className={`flex-1 py-3 text-sm font-semibold transition-colors ${mode === 'signup' ? 'text-purple-400 border-b-2 border-purple-400' : 'text-gray-400 hover:text-white'}`}
          >
            SIGN UP
          </button>
        </div>

        <form className="mt-6 space-y-6" onSubmit={handleEmailPasswordAuth}>
          <div className="rounded-md shadow-sm space-y-4">
            <div>
              <input
                id="email-address"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="appearance-none relative block w-full px-3 py-3 border border-gray-600 bg-gray-700 text-gray-200 rounded-md focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
                placeholder="Email address"
                disabled={loading}
              />
            </div>
            <div>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="appearance-none relative block w-full px-3 py-3 border border-gray-600 bg-gray-700 text-gray-200 rounded-md focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
                placeholder="Password"
                disabled={loading}
              />
            </div>
          </div>

          {mode === 'login' && (
             <div className="flex items-center justify-end">
                <div className="text-sm">
                    <button type="button" onClick={() => switchMode('forgotPassword')} className="font-medium text-purple-400 hover:text-purple-300">
                        Forgot your password?
                    </button>
                </div>
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 focus:ring-offset-gray-800 transition-colors disabled:opacity-50"
            >
              {loading ? <i className="fas fa-spinner fa-spin"></i> : (mode === 'login' ? 'Sign in' : 'Create Account')}
            </button>
          </div>
        </form>

        <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-600"></div>
            </div>
            <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-gray-800 text-gray-500">Or</span>
            </div>
        </div>
        <div>
            <button
                onClick={handleGoogleLogin}
                disabled={loading}
                className="group relative w-full flex items-center justify-center py-3 px-4 border border-gray-600 text-sm font-medium rounded-md text-gray-200 bg-gray-700 hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 focus:ring-offset-gray-800 transition-colors disabled:opacity-50"
            >
                <i className="fab fa-google text-lg mr-3"></i>
                Sign in with Google
            </button>
        </div>
      </>
    );
  };
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 px-4">
      <div className="w-full max-w-md p-8 space-y-6 bg-gray-800 rounded-2xl shadow-2xl border border-gray-700">
        <div className="text-center">
            <div className="flex items-center justify-center mb-4">
                <i className="fas fa-film text-4xl text-purple-400 mr-3"></i>
                <h1 className="text-4xl font-bold tracking-wider">
                    Genlux <span className="text-purple-400">AI</span>
                </h1>
            </div>
            <p className="mt-2 text-lg text-gray-400">Generate stunning videos with AI.</p>
        </div>
        
        {error && (
            <div className="text-center text-sm text-red-400 p-3 bg-red-900/50 rounded-md">
                {error}
            </div>
        )}
        {message && (
             <div className="text-center text-sm text-green-400 p-3 bg-green-900/50 rounded-md">
                {message}
            </div>
        )}

        {renderFormContent()}
      </div>
    </div>
  );
};

export default LoginScreen;

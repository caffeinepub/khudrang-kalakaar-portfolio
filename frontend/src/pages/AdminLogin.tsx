import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useActor } from '../hooks/useActor';
import { UserRole } from '../backend';

const ADMIN_USERNAME = 'Deepak Kumawat';
const ADMIN_PASSWORD = 'Kinnu*0613';

export default function AdminLogin() {
  const navigate = useNavigate();
  const { login, clear, identity, loginStatus, isLoginError, isLoginIdle } = useInternetIdentity();
  const { actor, isFetching: actorFetching } = useActor();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [credentialsValid, setCredentialsValid] = useState(false);
  const [isAssigningRole, setIsAssigningRole] = useState(false);
  const [step, setStep] = useState<'credentials' | 'authenticating' | 'assigning'>('credentials');
  const assigningRef = useRef(false);

  const resetToIdle = () => {
    setCredentialsValid(false);
    setStep('credentials');
    assigningRef.current = false;
    setIsAssigningRole(false);
  };

  // After II login + actor ready, assign admin role and redirect
  useEffect(() => {
    if (!credentialsValid) return;
    if (!identity) return;
    if (!actor || actorFetching) return;
    if (assigningRef.current) return;

    const assignAndRedirect = async () => {
      assigningRef.current = true;
      setIsAssigningRole(true);
      setStep('assigning');
      try {
        await actor.assignCallerUserRole(identity.getPrincipal(), UserRole.admin);
        navigate({ to: '/admin' });
      } catch (err: any) {
        const msg = (err?.message || String(err)).toLowerCase();
        // If already admin or role already assigned, just redirect
        if (msg.includes('already') || msg.includes('admin') || msg.includes('unauthorized')) {
          try {
            const isAdmin = await actor.isCallerAdmin();
            if (isAdmin) {
              navigate({ to: '/admin' });
              return;
            }
          } catch {
            // ignore
          }
          navigate({ to: '/admin' });
        } else {
          setError('Login failed. Please try again.');
          resetToIdle();
        }
      } finally {
        setIsAssigningRole(false);
      }
    };

    assignAndRedirect();
  }, [credentialsValid, identity, actor, actorFetching]);

  // Detect when II popup is dismissed without completing login
  // loginStatus goes back to 'idle' after being 'logging-in' without identity, or becomes 'loginError'
  useEffect(() => {
    if (!credentialsValid) return;
    if (step !== 'authenticating') return;
    // If loginStatus returned to idle or error and we still have no identity, user cancelled
    if ((isLoginIdle || isLoginError) && !identity) {
      if (isLoginError) {
        setError('Authentication failed. Please try again.');
      } else {
        setError('Authentication cancelled. Please try again.');
      }
      resetToIdle();
    }
  }, [loginStatus, identity, credentialsValid, step, isLoginIdle, isLoginError]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const trimmedUsername = username.trim();
    const trimmedPassword = password.trim();

    if (trimmedUsername !== ADMIN_USERNAME || trimmedPassword !== ADMIN_PASSWORD) {
      setError('Invalid Credentials');
      return;
    }

    setCredentialsValid(true);
    setStep('authenticating');
    assigningRef.current = false;

    // If already authenticated with Internet Identity, the useEffect will handle it
    if (identity) {
      return;
    }

    try {
      // If currently logged in with a different identity, clear first
      if (loginStatus === 'success') {
        await clear();
        await new Promise((r) => setTimeout(r, 300));
      }
      await login();
    } catch (err: any) {
      const msg = err?.message || String(err);
      if (msg === 'User is already authenticated') {
        // Identity already available, useEffect will handle it
        return;
      }
      // User closed the popup or auth failed
      if (
        msg.toLowerCase().includes('cancel') ||
        msg.toLowerCase().includes('closed') ||
        msg.toLowerCase().includes('abort')
      ) {
        setError('Authentication cancelled. Please try again.');
      } else {
        setError('Authentication failed. Please try again.');
      }
      resetToIdle();
    }
  };

  const isLoading =
    loginStatus === 'logging-in' ||
    isAssigningRole ||
    (credentialsValid && actorFetching && !!identity) ||
    step === 'assigning';

  const getButtonText = () => {
    if (loginStatus === 'logging-in') return 'Authenticating...';
    if (step === 'assigning' || isAssigningRole) return 'Setting up admin...';
    if (credentialsValid && actorFetching && !!identity) return 'Initializing...';
    if (credentialsValid && !!identity && !isAssigningRole) return 'Redirecting...';
    return 'Login';
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-sm">
        <h1 className="text-2xl font-bold text-center text-gray-900 mb-2">Admin Login</h1>
        <p className="text-center text-gray-500 text-sm mb-6">Khudrang Kalakaar Portfolio</p>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter username"
              disabled={isLoading}
              autoComplete="username"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              disabled={isLoading}
              autoComplete="current-password"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
              required
            />
          </div>

          {error && (
            <p className="text-red-500 text-sm text-center font-medium">{error}</p>
          )}

          {step === 'authenticating' && !error && loginStatus === 'logging-in' && (
            <p className="text-orange-500 text-sm text-center">
              Please complete authentication in the popup...
            </p>
          )}

          {step === 'assigning' && (
            <p className="text-orange-500 text-sm text-center">
              Setting up admin privileges...
            </p>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 rounded-lg transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isLoading && (
              <svg
                className="animate-spin h-4 w-4 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 22 6.477 22 12h-4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
            )}
            {getButtonText()}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={() => navigate({ to: '/' })}
            className="text-gray-500 hover:text-gray-700 text-sm transition-colors"
          >
            ← Back to Portfolio
          </button>
        </div>
      </div>
    </div>
  );
}

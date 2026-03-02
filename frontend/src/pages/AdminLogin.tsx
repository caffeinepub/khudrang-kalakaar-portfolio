import React, { useState, useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useActor } from '../hooks/useActor';
import { UserRole } from '../backend';

const ADMIN_ID = 'Deepak Kumawat';
const ADMIN_PASSWORD = 'Kinnu*0613';

export default function AdminLogin() {
  const navigate = useNavigate();
  const { login, identity, loginStatus } = useInternetIdentity();
  const { actor, isFetching: actorFetching } = useActor();

  const [adminId, setAdminId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [credentialsValid, setCredentialsValid] = useState(false);
  const [isAssigningRole, setIsAssigningRole] = useState(false);
  const [step, setStep] = useState<'credentials' | 'authenticating' | 'assigning'>('credentials');

  // After II login + actor ready, assign admin role and redirect
  useEffect(() => {
    if (!credentialsValid) return;
    if (!identity) return;
    if (!actor || actorFetching) return;
    if (isAssigningRole) return;

    const assignAndRedirect = async () => {
      setIsAssigningRole(true);
      setStep('assigning');
      try {
        // Assign admin role to the authenticated principal
        await actor.assignCallerUserRole(identity.getPrincipal(), UserRole.admin);
        navigate({ to: '/admin' });
      } catch (err: any) {
        // If already admin, just redirect
        const msg = err?.message || String(err);
        if (msg.includes('already') || msg.includes('admin')) {
          navigate({ to: '/admin' });
        } else {
          setError('Invalid Credentials');
          setCredentialsValid(false);
          setStep('credentials');
        }
      } finally {
        setIsAssigningRole(false);
      }
    };

    assignAndRedirect();
  }, [credentialsValid, identity, actor, actorFetching]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (adminId !== ADMIN_ID || password !== ADMIN_PASSWORD) {
      setError('Invalid Credentials');
      return;
    }

    setCredentialsValid(true);
    setStep('authenticating');

    try {
      await login();
    } catch (err: any) {
      const msg = err?.message || String(err);
      if (msg === 'User is already authenticated') {
        // Identity already available, useEffect will handle it
        return;
      }
      setError('Invalid Credentials');
      setCredentialsValid(false);
      setStep('credentials');
    }
  };

  const isLoading = loginStatus === 'logging-in' || isAssigningRole || (credentialsValid && actorFetching);

  const getButtonText = () => {
    if (loginStatus === 'logging-in') return 'Authenticating...';
    if (step === 'assigning' || isAssigningRole) return 'Setting up admin...';
    if (credentialsValid && actorFetching) return 'Initializing...';
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
              value={adminId}
              onChange={(e) => setAdminId(e.target.value)}
              placeholder="Enter username"
              disabled={isLoading}
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
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
              required
            />
          </div>

          {error && (
            <p className="text-red-500 text-sm text-center">{error}</p>
          )}

          {step === 'authenticating' && !error && (
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
              <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 22 6.477 22 12h-4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
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

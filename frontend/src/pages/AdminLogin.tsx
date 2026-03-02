import React, { useEffect, useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useActor } from '../hooks/useActor';
import { Shield, Loader2, AlertCircle } from 'lucide-react';

export default function AdminLogin() {
  const navigate = useNavigate();
  const { login, clear, loginStatus, identity, isInitializing } = useInternetIdentity();
  const { actor, isFetching: actorFetching } = useActor();
  const [error, setError] = useState<string | null>(null);
  const [checkingAdmin, setCheckingAdmin] = useState(false);

  const isLoggingIn = loginStatus === 'logging-in';
  const isAuthenticated = !!identity;

  // Once authenticated and actor is ready, check if caller is admin
  useEffect(() => {
    if (!isAuthenticated || actorFetching || !actor) return;

    const checkAdmin = async () => {
      setCheckingAdmin(true);
      setError(null);
      try {
        const isAdmin = await actor.isCallerAdmin();
        if (isAdmin) {
          navigate({ to: '/admin' });
        } else {
          setError('Access denied. Your account does not have admin privileges.');
          await clear();
        }
      } catch (err: any) {
        setError('Failed to verify admin status. Please try again.');
        await clear();
      } finally {
        setCheckingAdmin(false);
      }
    };

    checkAdmin();
  }, [isAuthenticated, actorFetching, actor]);

  const handleLogin = async () => {
    setError(null);
    try {
      await login();
    } catch (err: any) {
      if (err?.message === 'User is already authenticated') {
        await clear();
        setTimeout(() => login(), 300);
      } else {
        setError('Login failed. Please try again.');
      }
    }
  };

  const isLoading = isLoggingIn || checkingAdmin || actorFetching || isInitializing;

  return (
    <div className="min-h-screen bg-cream flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Logo / Brand */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-terracotta mb-4">
            <Shield className="w-8 h-8 text-cream" />
          </div>
          <h1 className="font-display text-3xl font-bold text-charcoal tracking-tight">
            Admin Access
          </h1>
          <p className="mt-2 text-charcoal/70 text-sm">
            Sign in with your Internet Identity to manage the portfolio
          </p>
        </div>

        {/* Card */}
        <div className="bg-white border border-warm-border rounded-2xl shadow-warm p-8">
          {error && (
            <div className="mb-6 flex items-start gap-3 bg-red-50 border border-red-200 rounded-xl p-4">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-red-700 text-sm leading-relaxed">{error}</p>
            </div>
          )}

          <div className="space-y-4">
            <p className="text-charcoal/80 text-sm text-center leading-relaxed">
              This panel is restricted to authorized administrators only. Click below to authenticate with Internet Identity.
            </p>

            <button
              onClick={handleLogin}
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-3 bg-terracotta hover:bg-terracotta/90 disabled:opacity-60 disabled:cursor-not-allowed text-cream font-semibold py-3 px-6 rounded-xl transition-all duration-200 shadow-sm hover:shadow-md"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>
                    {isLoggingIn ? 'Opening Internet Identity…' : 'Verifying admin access…'}
                  </span>
                </>
              ) : (
                <>
                  <Shield className="w-5 h-5" />
                  <span>Login with Internet Identity</span>
                </>
              )}
            </button>
          </div>

          <div className="mt-6 pt-6 border-t border-warm-border text-center">
            <a
              href="/"
              className="text-sm text-charcoal/60 hover:text-terracotta transition-colors"
            >
              ← Back to Portfolio
            </a>
          </div>
        </div>

        <p className="mt-6 text-center text-xs text-charcoal/50">
          Only registered admin principals can access this panel.
        </p>
      </div>
    </div>
  );
}

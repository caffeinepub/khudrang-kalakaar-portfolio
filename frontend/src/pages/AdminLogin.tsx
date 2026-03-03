import React, { useState, useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { Lock, User, Eye, EyeOff, Palette } from 'lucide-react';
import { useActor } from '../hooks/useActor';
import { createSession, validateSession } from '../lib/adminAuth';

export default function AdminLogin() {
  const navigate = useNavigate();
  const { actor, isFetching: actorFetching } = useActor();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // If already has a valid session, redirect to admin panel
  useEffect(() => {
    if (validateSession()) {
      navigate({ to: '/admin' });
    }
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!username.trim() || !password.trim()) {
      setError('Please enter both username and password.');
      return;
    }

    if (!actor) {
      setError('Backend not ready. Please wait a moment and try again.');
      return;
    }

    setIsLoading(true);
    try {
      const success = await actor.loginWithPassword(username.trim(), password);
      if (success) {
        createSession(username.trim());
        navigate({ to: '/admin' });
      } else {
        setError('Invalid username or password.');
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      if (message.includes('Invalid admin credentials') || message.includes('not authorized')) {
        setError('Invalid username or password.');
      } else {
        setError('Login failed. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-cream flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo / Brand */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-terracotta rounded-full mb-4 shadow-warm-md">
            <Palette className="w-8 h-8 text-cream" />
          </div>
          <h1 className="font-playfair text-3xl font-bold text-charcoal">Admin Panel</h1>
          <p className="text-charcoal/60 mt-1 text-sm">Khudrang Kalakaar — Content Management</p>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-2xl shadow-warm-lg p-8 border border-cream-dark">
          <h2 className="font-playfair text-xl font-semibold text-charcoal mb-6">Sign In</h2>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Username */}
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-charcoal/80 mb-1.5">
                Username
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-charcoal/40" />
                <input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter your username"
                  autoComplete="username"
                  className="w-full pl-10 pr-4 py-2.5 border border-cream-dark rounded-lg text-charcoal placeholder-charcoal/30 focus:outline-none focus:ring-2 focus:ring-terracotta/40 focus:border-terracotta transition-colors bg-cream/30"
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-charcoal/80 mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-charcoal/40" />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  className="w-full pl-10 pr-10 py-2.5 border border-cream-dark rounded-lg text-charcoal placeholder-charcoal/30 focus:outline-none focus:ring-2 focus:ring-terracotta/40 focus:border-terracotta transition-colors bg-cream/30"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-charcoal/40 hover:text-charcoal/70 transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading || actorFetching}
              className="w-full bg-terracotta hover:bg-terracotta-dark text-cream font-semibold py-2.5 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-warm-sm"
            >
              {isLoading || actorFetching ? (
                <>
                  <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                  {actorFetching ? 'Connecting...' : 'Signing in...'}
                </>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          <p className="text-center text-xs text-charcoal/40 mt-6">
            Authorized personnel only
          </p>
        </div>

        <p className="text-center text-xs text-charcoal/40 mt-6">
          © {new Date().getFullYear()} Khudrang Kalakaar. All rights reserved.
        </p>
      </div>
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { Shield, Loader2, AlertCircle, Eye, EyeOff, Lock, User } from 'lucide-react';
import { validateAdminCredentials, createAdminSession, isAdminSessionValid } from '../lib/adminAuth';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';

export default function AdminLogin() {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAdminSessionValid()) {
      navigate({ to: '/admin' });
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!username.trim()) {
      setError('Please enter your username.');
      return;
    }
    if (!password) {
      setError('Please enter your password.');
      return;
    }

    setIsLoading(true);
    // Small delay to prevent brute-force and show loading state
    await new Promise((resolve) => setTimeout(resolve, 600));

    try {
      const valid = validateAdminCredentials(username, password);
      if (valid) {
        createAdminSession();
        navigate({ to: '/admin' });
      } else {
        setError('Invalid username or password. Please check your credentials and try again.');
      }
    } catch {
      setError('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-cream flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Logo / Brand */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-terracotta mb-4 shadow-warm">
            <Shield className="w-8 h-8 text-cream" />
          </div>
          <h1 className="font-display text-3xl font-bold text-charcoal tracking-tight">
            Admin Access
          </h1>
          <p className="mt-2 text-charcoal-medium text-sm">
            Sign in to manage your portfolio
          </p>
        </div>

        {/* Card */}
        <div className="bg-white border border-warm-border rounded-2xl shadow-warm p-8">
          {error && (
            <div className="mb-6 flex items-start gap-3 bg-red-50 border border-red-200 rounded-xl p-4">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-red-700 text-sm leading-relaxed font-medium">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Username Field */}
            <div className="space-y-1.5">
              <Label htmlFor="username" className="text-charcoal font-semibold text-sm">
                Username
              </Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-charcoal-light" />
                <Input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter your username"
                  autoComplete="username"
                  disabled={isLoading}
                  className="pl-10 border-warm-border text-charcoal placeholder:text-charcoal-light focus:border-terracotta focus:ring-terracotta bg-white"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-charcoal font-semibold text-sm">
                Password
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-charcoal-light" />
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  disabled={isLoading}
                  className="pl-10 pr-10 border-warm-border text-charcoal placeholder:text-charcoal-light focus:border-terracotta focus:ring-terracotta bg-white"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-charcoal-light hover:text-charcoal transition-colors"
                  tabIndex={-1}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-terracotta hover:bg-terracotta/90 disabled:opacity-60 text-cream font-semibold py-3 rounded-xl transition-all duration-200 shadow-sm hover:shadow-warm mt-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin mr-2" />
                  Signing in…
                </>
              ) : (
                <>
                  <Shield className="w-5 h-5 mr-2" />
                  Sign In
                </>
              )}
            </Button>
          </form>

          <div className="mt-6 pt-6 border-t border-warm-border text-center">
            <a
              href="/"
              className="text-sm text-charcoal-medium hover:text-terracotta transition-colors font-medium"
            >
              ← Back to Portfolio
            </a>
          </div>
        </div>

        <p className="mt-6 text-center text-xs text-charcoal-light">
          Restricted access — authorized administrators only.
        </p>
      </div>
    </div>
  );
}

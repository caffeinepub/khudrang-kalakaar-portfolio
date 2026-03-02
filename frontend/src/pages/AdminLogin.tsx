import React, { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { Shield, ArrowLeft, Eye, EyeOff, Loader2 } from 'lucide-react';

const ADMIN_USERNAME = 'DeepakKumawat';
const ADMIN_PASSWORD = 'Kinnu*0613';

export default function AdminLogin() {
  const navigate = useNavigate();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    // Small delay for UX feedback
    await new Promise(res => setTimeout(res, 400));

    if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
      sessionStorage.setItem('adminAuthenticated', 'true');
      navigate({ to: '/admin' });
    } else {
      setError('Invalid username or password.');
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    navigate({ to: '/' });
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Card */}
        <div className="bg-card rounded-2xl shadow-card-custom border border-border p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-terracotta/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Shield className="w-8 h-8 text-terracotta" />
            </div>
            <h1 className="text-2xl font-bold text-foreground">Admin Login</h1>
            <p className="text-muted-foreground mt-1">Khudrang Kalakaar Portfolio</p>
          </div>

          {/* Error message */}
          {error && (
            <div className="mb-6 p-4 bg-destructive/10 border border-destructive/20 rounded-xl text-destructive text-sm text-center">
              {error}
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-foreground mb-1.5">
                Username
              </label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={e => setUsername(e.target.value)}
                autoComplete="username"
                required
                disabled={isLoading}
                className="w-full px-4 py-3 bg-background border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-terracotta/30 focus:border-terracotta/50 transition-colors disabled:opacity-60"
                placeholder="Enter username"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-foreground mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  autoComplete="current-password"
                  required
                  disabled={isLoading}
                  className="w-full px-4 py-3 pr-12 bg-background border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-terracotta/30 focus:border-terracotta/50 transition-colors disabled:opacity-60"
                  placeholder="Enter password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(v => !v)}
                  tabIndex={-1}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors p-1"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading || !username || !password}
              className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-terracotta text-white rounded-xl font-semibold text-base hover:bg-terracotta-dark transition-colors disabled:opacity-60 disabled:cursor-not-allowed shadow-sm mt-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Verifying...
                </>
              ) : (
                <>
                  <Shield className="w-5 h-5" />
                  Login
                </>
              )}
            </button>
          </form>

          {/* Back link */}
          <button
            onClick={handleBack}
            className="w-full mt-4 flex items-center justify-center gap-2 text-muted-foreground hover:text-foreground transition-colors text-sm py-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Portfolio
          </button>
        </div>

        {/* Hint */}
        <p className="text-center text-muted-foreground text-xs mt-4">
          Double-tap the logo on the portfolio page to access this panel
        </p>
      </div>
    </div>
  );
}

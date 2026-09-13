import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui';
import TccBG from '@/assets/images/TccBG.jpg';
import TccLogo from '@/assets/images/TccLogo.jpg';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      await login(email, password);
      navigate('/');
    } catch {
      setError('Invalid email or password.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-10">
      {/* Ambient blurred backdrop behind the card */}
      <div
        className="absolute inset-0 -z-10 scale-110 bg-cover bg-center blur-sm"
        style={{ backgroundImage: `url(${TccBG})` }}
      />
      <div className="absolute inset-0 -z-10 bg-ink-900/60" />

      <div className="grid w-full max-w-4xl overflow-hidden rounded-3xl bg-white shadow-[0_60px_80px_-20px_rgba(0,0,0,0.55)] ring-1 ring-black/5 md:grid-cols-2">
        {/* Left panel — campus photo */}
        <div className="relative hidden min-h-[560px] md:block">
          <img
            src={TccBG}
            alt="Tagoloan Community College"
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-ink-900/90 via-ink-900/10 to-ink-900/50" />

          <div className="relative flex h-full flex-col justify-between p-8">
            <div className="flex items-center gap-2.5">
              <img
                src={TccLogo}
                alt="Tagoloan Community College"
                className="h-9 w-9 rounded-full object-cover ring-1 ring-gold-400/60"
              />
              <span className="font-display text-lg font-bold tracking-wide text-white">
                TCC HRIS
              </span>
            </div>

            <div>
              <p className="font-display text-2xl font-semibold leading-snug text-white">
                Empowering Our People,
                <br />
                Elevating Our College
              </p>
            </div>
          </div>
        </div>

        {/* Right panel — sign-in form */}
        <div className="flex flex-col justify-center px-8 py-10 sm:px-12 md:py-14">
          <h1 className="font-display text-3xl font-bold text-ink-900">Sign in</h1>
          <p className="mt-1 text-sm text-ink-900/50">Human Resource Information System</p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-4">
            <div>
              <label htmlFor="email" className="mb-1 block text-sm font-medium text-ink-900">
                Email
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border border-ink-900/15 px-3.5 py-2.5 text-sm focus:border-maroon-500 focus:outline-none focus:ring-1 focus:ring-maroon-500"
              />
            </div>
            <div>
              <label htmlFor="password" className="mb-1 block text-sm font-medium text-ink-900">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-xl border border-ink-900/15 px-3.5 py-2.5 pr-11 text-sm focus:border-maroon-500 focus:outline-none focus:ring-1 focus:ring-maroon-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute inset-y-0 right-3 flex items-center text-ink-900/60 transition hover:text-ink-900"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.8}
                      stroke="currentColor"
                      className="h-5 w-5"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M3.98 8.223A10.477 10.477 0 001.5 12c0 1.2.3 2.34.84 3.37M8.25 15.12A10.48 10.48 0 0012 16.5c2.28 0 4.42-.68 6.25-1.88M14.74 14.74A6.5 6.5 0 0112 15.5c-3.6 0-6.7-2.3-8.24-5.56a10.5 10.5 0 012.64-3.32m10.24 10.24a10.52 10.52 0 003.31-2.64M2.5 2.5l19 19"
                      />
                    </svg>
                  ) : (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.8}
                      stroke="currentColor"
                      className="h-5 w-5"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M2.25 12s3.5-6.75 9.75-6.75S21.75 12 21.75 12s-3.5 6.75-9.75 6.75S2.25 12 2.25 12z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M12 15a3 3 0 100-6 3 3 0 000 6z"
                      />
                    </svg>
                  )}
                </button>
              </div>
            </div>
            {error && <p className="text-sm text-maroon-600">{error}</p>}
            <Button type="submit" disabled={submitting} className="w-full rounded-xl py-2.5">
              {submitting ? 'Signing in…' : 'Sign in'}
            </Button>
          </form>
          <p className="mt-8 border-t border-ink-900/10 pt-5 text-center text-xs text-ink-900/50">
            Demo accounts: admin@codix.com · hr@codix.com · employee@codix.com
            <br />
            password: password123
          </p>
        </div>
      </div>
    </div>
  );
}

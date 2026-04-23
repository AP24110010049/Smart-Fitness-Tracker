import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [loginType, setLoginType] = useState('user'); // 'user' or 'coach'
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, coachLogin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Handle OAuth redirect from backend
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get('token');
    const userData = params.get('user');

    if (token && userData) {
      try {
        const user = JSON.parse(userData);
        localStorage.setItem('token', token);
        navigate('/dashboard');
      } catch (err) {
        setError('Failed to process login');
      }
    }
  }, [location, navigate]);

  const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (loginType === 'coach') {
        await coachLogin(form.email, form.password);
      } else {
        await login(form.email, form.password);
      }
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-dark-900 flex">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-dark-800 relative overflow-hidden flex-col justify-center items-center p-16">
        <div className="absolute inset-0 opacity-5">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="absolute border border-primary-500 rounded-full"
              style={{ width: `${(i + 1) * 120}px`, height: `${(i + 1) * 120}px`, top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }} />
          ))}
        </div>
        <div className="relative z-10 text-center">
          <div className="w-20 h-20 bg-primary-500 rounded-2xl flex items-center justify-center mx-auto mb-8">
            <svg className="w-12 h-12 text-dark-900" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
            </svg>
          </div>
          <h1 className="font-display text-6xl tracking-widest text-white mb-4">FITFORGE</h1>
          <p className="text-gray-400 text-lg max-w-xs">Your unified fitness ecosystem. Track, improve, and compete.</p>
          <div className="mt-12 grid grid-cols-3 gap-6 text-center">
            {[['10K+', 'Athletes'], ['500+', 'Coaches'], ['1M+', 'Workouts']].map(([num, label]) => (
              <div key={label}>
                <p className="font-display text-3xl text-primary-400">{num}</p>
                <p className="text-gray-500 text-sm">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="mb-8">
            <h2 className="font-display text-4xl tracking-wider text-white mb-2">WELCOME BACK</h2>
            <p className="text-gray-400">Sign in to continue your fitness journey</p>
          </div>

          {error && (
            <div className="mb-4 p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Login Type Selector */}
            <div>
              <label className="label">Login as</label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="loginType"
                    value="user"
                    checked={loginType === 'user'}
                    onChange={(e) => setLoginType(e.target.value)}
                    className="text-primary-500 focus:ring-primary-500"
                  />
                  <span className="text-gray-300">User</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="loginType"
                    value="coach"
                    checked={loginType === 'coach'}
                    onChange={(e) => setLoginType(e.target.value)}
                    className="text-primary-500 focus:ring-primary-500"
                  />
                  <span className="text-gray-300">Coach</span>
                </label>
              </div>
            </div>

            <div>
              <label className="label">Email Address</label>
              <input name="email" type="email" value={form.email} onChange={handleChange}
                className="input" placeholder="athlete@example.com" required />
            </div>
            <div>
              <label className="label">Password</label>
              <input name="password" type="password" value={form.password} onChange={handleChange}
                className="input" placeholder="••••••••" required />
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2 py-3">
              {loading ? <div className="w-5 h-5 border-2 border-dark-900 border-t-transparent rounded-full animate-spin" /> : 'SIGN IN'}
            </button>
          </form>

          {/* Divider */}
          <div className="my-6 flex items-center gap-3">
            <div className="flex-1 h-px bg-dark-600"></div>
            <span className="text-gray-500 text-sm">OR</span>
            <div className="flex-1 h-px bg-dark-600"></div>
          </div>

          {/* Google Sign-In Button */}
          <a href="/api/auth/google" className="btn-secondary w-full flex items-center justify-center gap-2 py-3 bg-white text-dark-900 hover:bg-gray-100 font-semibold">
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            Sign in with Google
          </a>

          <p className="mt-6 text-center text-gray-400 text-sm">
            Don't have an account?{' '}
            <Link to="/signup" className="text-primary-400 hover:text-primary-300 font-semibold">Create account</Link>
          </p>

          {/* Demo credentials */}
          <div className="mt-8 p-4 bg-dark-800 border border-dark-600 rounded-xl">
            <p className="text-xs text-gray-500 font-mono mb-2">DEMO CREDENTIALS</p>
            <div className="space-y-1 text-xs font-mono text-gray-400">
              <p>User: <span className="text-primary-400">user@demo.com</span> / <span className="text-primary-400">password123</span></p>
              <p>Coach: <span className="text-amber-400">coach@demo.com</span> / <span className="text-amber-400">password123</span></p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Signup() {
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signup } = useAuth();
  const navigate = useNavigate();

  const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await signup(form.name, form.email, form.password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Signup failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-dark-900 flex items-center justify-center p-8">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-primary-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <svg className="w-9 h-9 text-dark-900" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
            </svg>
          </div>
          <h2 className="font-display text-4xl tracking-wider text-white mb-2">JOIN FITFORGE</h2>
          <p className="text-gray-400">Start your fitness transformation today</p>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm">{error}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="label">Full Name</label>
            <input name="name" value={form.name} onChange={handleChange} className="input" placeholder="John Doe" required />
          </div>
          <div>
            <label className="label">Email Address</label>
            <input name="email" type="email" value={form.email} onChange={handleChange} className="input" placeholder="you@example.com" required />
          </div>
          <div>
            <label className="label">Password</label>
            <input name="password" type="password" value={form.password} onChange={handleChange} className="input" placeholder="Min. 6 characters" required minLength={6} />
          </div>
          <div>
            <label className="label">I am a...</label>
            <div className="grid grid-cols-2 gap-3">
              {['user', 'coach'].map(role => (
                <button key={role} type="button" onClick={() => setForm(f => ({ ...f, role }))}
                  className={`py-3 rounded-xl border font-semibold text-sm transition-all ${form.role === role ? 'border-primary-500 bg-primary-500/10 text-primary-400' : 'border-dark-500 bg-dark-700 text-gray-400 hover:border-dark-400'}`}>
                  {role === 'user' ? '🏃 Fitness Enthusiast' : '🏆 Coach / Trainer'}
                </button>
              ))}
            </div>
          </div>
          <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2 py-3">
            {loading ? <div className="w-5 h-5 border-2 border-dark-900 border-t-transparent rounded-full animate-spin" /> : 'CREATE ACCOUNT'}
          </button>
        </form>

        <p className="mt-6 text-center text-gray-400 text-sm">
          Want to coach athletes?{' '}
          <Link to="/coach-signup" className="text-amber-400 hover:text-amber-300 font-semibold">Sign up as coach</Link>
        </p>

        <p className="mt-4 text-center text-gray-400 text-sm">
          Already have an account?{' '}
          <Link to="/login" className="text-primary-400 hover:text-primary-300 font-semibold">Sign in</Link>
        </p>
      </div>
    </div>
  );
}

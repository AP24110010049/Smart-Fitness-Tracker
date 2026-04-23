import { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const GOALS = ['weight-loss', 'muscle-gain', 'endurance', 'flexibility', 'general-fitness', 'sports-performance'];
const LEVELS = ['beginner', 'intermediate', 'advanced'];

export default function Profile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [form, setForm] = useState({
    age: '', weight: '', height: '', bio: '',
    fitnessGoals: [],
    preferences: { workoutDays: 3, workoutDuration: 45, fitnessLevel: 'beginner' },
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    api.get('/profile').then(res => {
      setProfile(res.data);
      setForm({
        age: res.data.age || '',
        weight: res.data.weight || '',
        height: res.data.height || '',
        bio: res.data.bio || '',
        fitnessGoals: res.data.fitnessGoals || [],
        preferences: res.data.preferences || { workoutDays: 3, workoutDuration: 45, fitnessLevel: 'beginner' },
      });
    }).catch(console.error).finally(() => setLoading(false));
  }, []);

  const toggleGoal = (goal) => {
    setForm(f => ({
      ...f,
      fitnessGoals: f.fitnessGoals.includes(goal)
        ? f.fitnessGoals.filter(g => g !== goal)
        : [...f.fitnessGoals, goal],
    }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await api.put('/profile', { ...form, age: Number(form.age) || undefined, weight: Number(form.weight) || undefined, height: Number(form.height) || undefined });
      setProfile(res.data);
      setMsg('Profile updated successfully!');
      setTimeout(() => setMsg(''), 3000);
    } catch (err) {
      setMsg(err.response?.data?.message || 'Error saving profile');
    } finally {
      setSaving(false);
    }
  };

  const bmi = form.weight && form.height ? (form.weight / ((form.height / 100) ** 2)).toFixed(1) : null;
  const bmiLabel = bmi < 18.5 ? 'Underweight' : bmi < 25 ? 'Normal' : bmi < 30 ? 'Overweight' : 'Obese';
  const bmiColor = bmi < 18.5 ? 'text-blue-400' : bmi < 25 ? 'text-primary-400' : bmi < 30 ? 'text-amber-400' : 'text-red-400';

  if (loading) return <div className="flex justify-center py-20"><div className="w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div className="space-y-8 max-w-2xl">
      <div>
        <h1 className="section-title">PROFILE</h1>
        <p className="text-gray-400 mt-1">Manage your fitness profile and preferences</p>
      </div>

      {msg && <div className="p-3 bg-primary-500/10 border border-primary-500/30 rounded-xl text-primary-400 text-sm">{msg}</div>}

      {/* User header card */}
      <div className="card">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-primary-500/20 border border-primary-500/40 flex items-center justify-center text-primary-400 font-bold text-2xl">
            {user?.name?.[0]?.toUpperCase()}
          </div>
          <div>
            <h2 className="text-xl font-semibold text-white">{user?.name}</h2>
            <p className="text-gray-400 text-sm">{user?.email}</p>
            <span className={`badge mt-1 inline-block ${user?.role === 'coach' ? 'bg-amber-500/20 text-amber-400' : 'bg-primary-500/20 text-primary-400'}`}>
              {user?.role?.toUpperCase()}
            </span>
          </div>
        </div>
        {bmi && (
          <div className="mt-4 p-3 bg-dark-700 rounded-xl flex items-center justify-between">
            <span className="text-gray-400 text-sm">BMI</span>
            <div className="text-right">
              <span className={`font-display text-2xl ${bmiColor}`}>{bmi}</span>
              <span className={`text-sm ml-2 ${bmiColor}`}>{bmiLabel}</span>
            </div>
          </div>
        )}
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Physical stats */}
        <div className="card">
          <h3 className="font-semibold text-white mb-4">Physical Information</h3>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="label">Age</label>
              <input className="input" type="number" value={form.age} onChange={e => setForm(f => ({ ...f, age: e.target.value }))} placeholder="25" min="10" max="100" />
            </div>
            <div>
              <label className="label">Weight (kg)</label>
              <input className="input" type="number" value={form.weight} onChange={e => setForm(f => ({ ...f, weight: e.target.value }))} placeholder="70" step="0.1" />
            </div>
            <div>
              <label className="label">Height (cm)</label>
              <input className="input" type="number" value={form.height} onChange={e => setForm(f => ({ ...f, height: e.target.value }))} placeholder="175" />
            </div>
          </div>
          <div className="mt-4">
            <label className="label">Bio</label>
            <textarea className="input resize-none h-24" value={form.bio} onChange={e => setForm(f => ({ ...f, bio: e.target.value }))} placeholder="Tell us about your fitness journey..." />
          </div>
        </div>

        {/* Fitness goals */}
        <div className="card">
          <h3 className="font-semibold text-white mb-4">Fitness Goals</h3>
          <div className="flex flex-wrap gap-2">
            {GOALS.map(goal => (
              <button key={goal} type="button" onClick={() => toggleGoal(goal)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all border ${form.fitnessGoals.includes(goal) ? 'border-primary-500 bg-primary-500/10 text-primary-400' : 'border-dark-500 bg-dark-700 text-gray-400 hover:border-dark-400'}`}>
                {goal.replace(/-/g, ' ')}
              </button>
            ))}
          </div>
        </div>

        {/* Preferences */}
        <div className="card">
          <h3 className="font-semibold text-white mb-4">Training Preferences</h3>
          <div className="space-y-4">
            <div>
              <label className="label">Fitness Level</label>
              <div className="grid grid-cols-3 gap-3">
                {LEVELS.map(level => (
                  <button key={level} type="button"
                    onClick={() => setForm(f => ({ ...f, preferences: { ...f.preferences, fitnessLevel: level } }))}
                    className={`py-3 rounded-xl border text-sm font-semibold transition-all capitalize ${form.preferences.fitnessLevel === level ? 'border-primary-500 bg-primary-500/10 text-primary-400' : 'border-dark-500 bg-dark-700 text-gray-400 hover:border-dark-400'}`}>
                    {level === 'beginner' ? '🌱' : level === 'intermediate' ? '🔥' : '⚡'} {level}
                  </button>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Workout Days/Week: <span className="text-primary-400">{form.preferences.workoutDays}</span></label>
                <input type="range" min="1" max="7" value={form.preferences.workoutDays}
                  onChange={e => setForm(f => ({ ...f, preferences: { ...f.preferences, workoutDays: Number(e.target.value) } }))}
                  className="w-full accent-primary-500" />
              </div>
              <div>
                <label className="label">Session Duration: <span className="text-primary-400">{form.preferences.workoutDuration} min</span></label>
                <input type="range" min="15" max="120" step="15" value={form.preferences.workoutDuration}
                  onChange={e => setForm(f => ({ ...f, preferences: { ...f.preferences, workoutDuration: Number(e.target.value) } }))}
                  className="w-full accent-primary-500" />
              </div>
            </div>
          </div>
        </div>

        <button type="submit" disabled={saving} className="btn-primary flex items-center gap-2">
          {saving ? <div className="w-4 h-4 border-2 border-dark-900 border-t-transparent rounded-full animate-spin" /> : '💾'}
          Save Profile
        </button>
      </form>
    </div>
  );
}

import { useState, useEffect } from 'react';
import api from '../services/api';

const WORKOUT_TYPES = ['running', 'cycling', 'swimming', 'weight-training', 'yoga', 'hiit', 'walking', 'other'];
const TYPE_ICONS = { running: '🏃', cycling: '🚴', swimming: '🏊', 'weight-training': '🏋️', yoga: '🧘', hiit: '⚡', walking: '🚶', other: '💪' };

const defaultForm = { type: 'running', duration: '', calories: '', distance: '', notes: '', date: new Date().toISOString().slice(0, 10) };

export default function WorkoutTracker() {
  const [form, setForm] = useState(defaultForm);
  const [workouts, setWorkouts] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [filter, setFilter] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const fetchWorkouts = async () => {
    setLoading(true);
    try {
      const res = await api.get('/workouts', { params: { page, limit: 10, ...(filter ? { type: filter } : {}) } });
      setWorkouts(res.data.workouts);
      setTotal(res.data.total);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchWorkouts(); }, [page, filter]);

  const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async e => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      await api.post('/workouts', { ...form, duration: Number(form.duration), calories: Number(form.calories), distance: Number(form.distance) || 0 });
      setSuccess('Workout logged successfully!');
      setForm(defaultForm);
      fetchWorkouts();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to log workout');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this workout?')) return;
    try {
      await api.delete(`/workouts/${id}`);
      fetchWorkouts();
    } catch (err) {
      console.error(err);
    }
  };

  const totalPages = Math.ceil(total / 10);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="section-title">WORKOUT TRACKER</h1>
        <p className="text-gray-400 mt-1">Log and manage your training sessions</p>
      </div>

      {/* Log form */}
      <div className="card">
        <h2 className="font-semibold text-white mb-5 flex items-center gap-2">
          <span className="text-primary-400">+</span> Log New Workout
        </h2>

        {success && <div className="mb-4 p-3 bg-primary-500/10 border border-primary-500/30 rounded-xl text-primary-400 text-sm">{success}</div>}
        {error && <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Type selector */}
          <div>
            <label className="label">Workout Type</label>
            <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
              {WORKOUT_TYPES.map(type => (
                <button key={type} type="button" onClick={() => setForm(f => ({ ...f, type }))}
                  className={`flex flex-col items-center gap-1 p-3 rounded-xl border text-xs font-medium transition-all ${form.type === type ? 'border-primary-500 bg-primary-500/10 text-primary-400' : 'border-dark-500 bg-dark-700 text-gray-400 hover:border-dark-400'}`}>
                  <span className="text-xl">{TYPE_ICONS[type]}</span>
                  <span className="capitalize hidden sm:block">{type.replace('-', ' ')}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="label">Duration (min) *</label>
              <input name="duration" type="number" value={form.duration} onChange={handleChange} className="input" placeholder="45" required min="1" />
            </div>
            <div>
              <label className="label">Calories (kcal) *</label>
              <input name="calories" type="number" value={form.calories} onChange={handleChange} className="input" placeholder="350" required min="1" />
            </div>
            <div>
              <label className="label">Distance (km)</label>
              <input name="distance" type="number" value={form.distance} onChange={handleChange} className="input" placeholder="5.0" step="0.1" min="0" />
            </div>
            <div>
              <label className="label">Date</label>
              <input name="date" type="date" value={form.date} onChange={handleChange} className="input" />
            </div>
          </div>

          <div>
            <label className="label">Notes (optional)</label>
            <textarea name="notes" value={form.notes} onChange={handleChange} className="input resize-none h-20" placeholder="How did it feel? Any personal records?" />
          </div>

          <button type="submit" disabled={submitting} className="btn-primary flex items-center gap-2">
            {submitting ? <div className="w-4 h-4 border-2 border-dark-900 border-t-transparent rounded-full animate-spin" /> : <span>+</span>}
            Log Workout
          </button>
        </form>
      </div>

      {/* Workout history */}
      <div className="card">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
          <h2 className="font-semibold text-white">Workout History <span className="text-gray-500 text-sm font-normal">({total} total)</span></h2>
          <select value={filter} onChange={e => { setFilter(e.target.value); setPage(1); }} className="input w-auto">
            <option value="">All Types</option>
            {WORKOUT_TYPES.map(t => <option key={t} value={t} className="capitalize">{t}</option>)}
          </select>
        </div>

        {loading ? (
          <div className="flex justify-center py-12"><div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" /></div>
        ) : workouts.length > 0 ? (
          <>
            <div className="space-y-3">
              {workouts.map(w => (
                <div key={w._id} className="flex items-center justify-between p-4 bg-dark-700 rounded-xl hover:bg-dark-600 transition-colors group">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-dark-600 flex items-center justify-center text-2xl">
                      {TYPE_ICONS[w.type] || '💪'}
                    </div>
                    <div>
                      <p className="font-semibold text-white capitalize">{w.type.replace('-', ' ')}</p>
                      <div className="flex items-center gap-3 text-xs text-gray-400 mt-1">
                        <span>📅 {new Date(w.date).toLocaleDateString()}</span>
                        <span>⏱ {w.duration}m</span>
                        {w.distance > 0 && <span>📍 {w.distance}km</span>}
                        {w.source === 'device' && <span className="badge bg-blue-500/20 text-blue-400">⌚ Synced</span>}
                      </div>
                      {w.notes && <p className="text-xs text-gray-500 mt-1 truncate max-w-xs">{w.notes}</p>}
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="font-mono text-primary-400 font-semibold">{w.calories}</p>
                      <p className="text-xs text-gray-500">kcal</p>
                    </div>
                    <button onClick={() => handleDelete(w._id)} className="opacity-0 group-hover:opacity-100 transition-opacity p-2 rounded-lg hover:bg-red-500/20 text-red-400">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-6">
                <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="btn-secondary px-3 py-2 disabled:opacity-50">←</button>
                <span className="text-gray-400 text-sm font-mono">Page {page} of {totalPages}</span>
                <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="btn-secondary px-3 py-2 disabled:opacity-50">→</button>
              </div>
            )}
          </>
        ) : (
          <div className="py-16 text-center text-gray-500">
            <p className="text-5xl mb-4">🏋️</p>
            <p className="text-lg mb-2">No workouts logged yet</p>
            <p className="text-sm">Use the form above to log your first workout</p>
          </div>
        )}
      </div>
    </div>
  );
}

import { useState, useEffect } from 'react';
import api from '../services/api';

export default function Plans() {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [expanded, setExpanded] = useState(null);

  const fetchPlans = async () => {
    setLoading(true);
    try {
      const res = await api.get('/plans');
      setPlans(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPlans(); }, []);

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      await api.post('/plans/generate');
      fetchPlans();
    } catch (err) {
      console.error(err);
    } finally {
      setGenerating(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this plan?')) return;
    try {
      await api.delete(`/plans/${id}`);
      setPlans(p => p.filter(x => x._id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  const dayColors = { Monday: 'text-red-400', Tuesday: 'text-orange-400', Wednesday: 'text-yellow-400', Thursday: 'text-green-400', Friday: 'text-blue-400', Saturday: 'text-purple-400', Sunday: 'text-pink-400' };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="section-title">WORKOUT PLANS</h1>
          <p className="text-gray-400 mt-1">AI-powered personalized training programs</p>
        </div>
        <button onClick={handleGenerate} disabled={generating} className="btn-primary flex items-center gap-2">
          {generating ? (
            <><div className="w-4 h-4 border-2 border-dark-900 border-t-transparent rounded-full animate-spin" /> Generating...</>
          ) : (
            <><span>🤖</span> Generate AI Plan</>
          )}
        </button>
      </div>

      {/* AI info banner */}
      <div className="p-4 bg-primary-500/5 border border-primary-500/20 rounded-2xl flex items-start gap-3">
        <span className="text-2xl">🧠</span>
        <div>
          <p className="text-primary-400 font-semibold text-sm">Smart Recommendations</p>
          <p className="text-gray-400 text-sm mt-1">Our recommendation engine analyzes your workout history, fitness level, and goals to create personalized training plans. The more workouts you log, the better the recommendations become.</p>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><div className="w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" /></div>
      ) : plans.length > 0 ? (
        <div className="space-y-4">
          {plans.map(plan => (
            <div key={plan._id} className="card">
              {/* Plan header */}
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 flex-wrap">
                    <h3 className="font-semibold text-white">{plan.title}</h3>
                    {plan.isAIGenerated && (
                      <span className="badge bg-primary-500/20 text-primary-400">🤖 AI Generated</span>
                    )}
                    {plan.coachId && (
                      <span className="badge bg-amber-500/20 text-amber-400">🏆 Coach Assigned</span>
                    )}
                  </div>
                  {plan.description && <p className="text-gray-400 text-sm mt-1">{plan.description}</p>}
                  <p className="text-gray-500 text-xs font-mono mt-1">{new Date(plan.createdAt).toLocaleDateString()}</p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button onClick={() => setExpanded(expanded === plan._id ? null : plan._id)}
                    className="btn-secondary text-sm px-3 py-2">
                    {expanded === plan._id ? 'Collapse' : 'View Details'}
                  </button>
                  <button onClick={() => handleDelete(plan._id)} className="btn-danger text-sm px-3 py-2">Delete</button>
                </div>
              </div>

              {/* Expanded details */}
              {expanded === plan._id && (
                <div className="mt-6 space-y-6 border-t border-dark-600 pt-6">
                  {/* Schedule */}
                  {plan.schedule?.length > 0 && (
                    <div>
                      <h4 className="font-semibold text-gray-300 mb-3 text-sm uppercase tracking-wider">Weekly Schedule</h4>
                      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
                        {plan.schedule.map(s => (
                          <div key={s.day} className="bg-dark-700 rounded-xl p-3 text-center">
                            <p className={`font-bold text-sm ${dayColors[s.day] || 'text-gray-400'}`}>{s.day.slice(0, 3).toUpperCase()}</p>
                            <p className="text-gray-400 text-xs mt-1">{s.focus}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Exercises */}
                  {plan.exercises?.length > 0 && (
                    <div>
                      <h4 className="font-semibold text-gray-300 mb-3 text-sm uppercase tracking-wider">Exercise Program</h4>
                      <div className="space-y-2">
                        {plan.exercises.map((ex, i) => (
                          <div key={i} className="flex items-center justify-between p-3 bg-dark-700 rounded-xl">
                            <div className="flex items-center gap-3">
                              <span className="w-7 h-7 rounded-lg bg-primary-500/20 text-primary-400 text-xs font-mono flex items-center justify-center font-bold">{i + 1}</span>
                              <span className="font-medium text-white">{ex.name}</span>
                            </div>
                            <div className="flex items-center gap-4 text-sm text-gray-400 font-mono">
                              {ex.sets > 0 && <span>{ex.sets} sets</span>}
                              {ex.reps > 0 && <span>× {ex.reps} reps</span>}
                              {ex.duration > 0 && <span>{ex.duration} min</span>}
                              {ex.restTime > 0 && <span className="text-gray-500">{ex.restTime}s rest</span>}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Recommendations */}
                  {plan.recommendations?.length > 0 && (
                    <div>
                      <h4 className="font-semibold text-gray-300 mb-3 text-sm uppercase tracking-wider">Recommendations</h4>
                      <div className="space-y-2">
                        {plan.recommendations.map((r, i) => (
                          <div key={i} className="flex items-start gap-2 p-3 bg-primary-500/5 border border-primary-500/20 rounded-xl">
                            <span className="text-primary-400 mt-0.5">💡</span>
                            <p className="text-gray-300 text-sm">{r}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="card py-20 text-center">
          <p className="text-5xl mb-4">📋</p>
          <p className="text-xl text-white mb-2">No plans yet</p>
          <p className="text-gray-400 text-sm mb-6">Generate an AI-powered plan based on your workout history</p>
          <button onClick={handleGenerate} disabled={generating} className="btn-primary mx-auto flex items-center gap-2">
            🤖 Generate My First Plan
          </button>
        </div>
      )}
    </div>
  );
}

import { useState, useEffect } from 'react';
import api from '../services/api';

const DAYS = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'];

export default function CoachDashboard() {
  const [clients, setClients] = useState([]);
  const [stats, setStats] = useState(null);
  const [selectedClient, setSelectedClient] = useState(null);
  const [clientData, setClientData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingClient, setLoadingClient] = useState(false);
  const [showAssignPlan, setShowAssignPlan] = useState(false);
  const [planForm, setPlanForm] = useState({ title: '', description: '', exercises: [{ name: '', sets: 3, reps: 10, duration: 0, restTime: 60 }], schedule: [] });
  const [msg, setMsg] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const [c, s] = await Promise.all([api.get('/coach/clients'), api.get('/coach/stats')]);
        setClients(c.data);
        setStats(s.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const viewClient = async (client) => {
    setSelectedClient(client);
    setLoadingClient(true);
    try {
      const res = await api.get(`/coach/clients/${client._id}`);
      setClientData(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingClient(false);
    }
  };

  const assignPlan = async (e) => {
    e.preventDefault();
    try {
      await api.post(`/coach/clients/${selectedClient._id}/plans`, planForm);
      setMsg('Plan assigned successfully!');
      setShowAssignPlan(false);
      setTimeout(() => setMsg(''), 3000);
    } catch (err) {
      setMsg(err.response?.data?.message || 'Error assigning plan');
    }
  };

  const addExercise = () => setPlanForm(f => ({ ...f, exercises: [...f.exercises, { name: '', sets: 3, reps: 10, duration: 0, restTime: 60 }] }));
  const updateExercise = (i, field, val) => setPlanForm(f => ({ ...f, exercises: f.exercises.map((ex, idx) => idx === i ? { ...ex, [field]: val } : ex) }));
  const removeExercise = (i) => setPlanForm(f => ({ ...f, exercises: f.exercises.filter((_, idx) => idx !== i) }));

  const toggleDay = (day) => {
    const exists = planForm.schedule.find(s => s.day === day);
    if (exists) {
      setPlanForm(f => ({ ...f, schedule: f.schedule.filter(s => s.day !== day) }));
    } else {
      setPlanForm(f => ({ ...f, schedule: [...f.schedule, { day, focus: '' }] }));
    }
  };

  const TYPE_ICONS = { running: '🏃', cycling: '🚴', swimming: '🏊', 'weight-training': '🏋️', yoga: '🧘', hiit: '⚡', walking: '🚶', other: '💪' };

  if (loading) return <div className="flex justify-center py-20"><div className="w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="section-title">COACH DASHBOARD</h1>
        <p className="text-gray-400 mt-1">Manage clients and assign training programs</p>
      </div>

      {msg && <div className="p-3 bg-primary-500/10 border border-primary-500/30 rounded-xl text-primary-400 text-sm">{msg}</div>}

      {/* Coach stats */}
      {stats && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="stat-card"><span className="text-gray-400 text-sm">Total Clients</span><span className="font-display text-4xl text-primary-400">{stats.totalClients}</span></div>
          <div className="stat-card"><span className="text-gray-400 text-sm">Plans Assigned</span><span className="font-display text-4xl text-amber-400">{stats.totalPlansAssigned}</span></div>
          <div className="stat-card"><span className="text-gray-400 text-sm">Recent Activity</span><span className="font-display text-4xl text-blue-400">{stats.recentActivity?.length || 0}</span></div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Client list */}
        <div className="card lg:col-span-1">
          <h2 className="font-semibold text-white mb-4">All Clients ({clients.length})</h2>
          {clients.length > 0 ? (
            <div className="space-y-2">
              {clients.map(client => (
                <button key={client._id} onClick={() => viewClient(client)}
                  className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all text-left ${selectedClient?._id === client._id ? 'bg-primary-500/10 border border-primary-500/30' : 'bg-dark-700 hover:bg-dark-600'}`}>
                  <div className="w-10 h-10 rounded-full bg-dark-600 flex items-center justify-center text-sm font-bold text-primary-400 flex-shrink-0">
                    {client.name?.[0]?.toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="text-white text-sm font-medium truncate">{client.name}</p>
                    <p className="text-gray-500 text-xs truncate">{client.email}</p>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="py-8 text-center text-gray-500">
              <p className="text-3xl mb-2">👥</p>
              <p className="text-sm">No clients yet</p>
            </div>
          )}
        </div>

        {/* Client detail */}
        <div className="lg:col-span-2 space-y-4">
          {selectedClient ? (
            <>
              <div className="card">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-primary-500/20 border border-primary-500/40 flex items-center justify-center text-primary-400 font-bold">
                      {selectedClient.name?.[0]?.toUpperCase()}
                    </div>
                    <div>
                      <h3 className="font-semibold text-white">{selectedClient.name}</h3>
                      <p className="text-gray-400 text-sm">{selectedClient.email}</p>
                    </div>
                  </div>
                  <button onClick={() => setShowAssignPlan(!showAssignPlan)} className="btn-primary text-sm">
                    + Assign Plan
                  </button>
                </div>

                {loadingClient ? (
                  <div className="flex justify-center py-8"><div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" /></div>
                ) : clientData && (
                  <>
                    {/* Profile stats */}
                    {clientData.profile && (
                      <div className="grid grid-cols-3 gap-3 mt-2">
                        <div className="bg-dark-700 rounded-xl p-3 text-center">
                          <p className="text-gray-500 text-xs">Level</p>
                          <p className="text-white text-sm font-semibold capitalize mt-1">{clientData.profile.preferences?.fitnessLevel || 'N/A'}</p>
                        </div>
                        <div className="bg-dark-700 rounded-xl p-3 text-center">
                          <p className="text-gray-500 text-xs">Goals</p>
                          <p className="text-white text-sm font-semibold mt-1">{clientData.profile.fitnessGoals?.length || 0}</p>
                        </div>
                        <div className="bg-dark-700 rounded-xl p-3 text-center">
                          <p className="text-gray-500 text-xs">Workouts</p>
                          <p className="text-white text-sm font-semibold mt-1">{clientData.workouts?.length || 0}</p>
                        </div>
                      </div>
                    )}

                    {/* Recent workouts */}
                    {clientData.workouts?.length > 0 && (
                      <div className="mt-4">
                        <p className="text-gray-400 text-xs uppercase tracking-wider mb-2">Recent Workouts</p>
                        <div className="space-y-2">
                          {clientData.workouts.slice(0, 5).map(w => (
                            <div key={w._id} className="flex items-center justify-between p-2.5 bg-dark-700 rounded-xl text-sm">
                              <div className="flex items-center gap-2">
                                <span>{TYPE_ICONS[w.type] || '💪'}</span>
                                <span className="text-white capitalize">{w.type}</span>
                                <span className="text-gray-500 text-xs">{new Date(w.date).toLocaleDateString()}</span>
                              </div>
                              <div className="flex gap-3 text-xs text-gray-400 font-mono">
                                <span>{w.duration}m</span>
                                <span className="text-primary-400">{w.calories} kcal</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* Assign plan form */}
              {showAssignPlan && (
                <div className="card border-primary-500/30">
                  <h3 className="font-semibold text-white mb-4">Assign Plan to {selectedClient.name}</h3>
                  <form onSubmit={assignPlan} className="space-y-4">
                    <div>
                      <label className="label">Plan Title</label>
                      <input className="input" value={planForm.title} onChange={e => setPlanForm(f => ({ ...f, title: e.target.value }))} placeholder="Strength Building Program" required />
                    </div>
                    <div>
                      <label className="label">Description</label>
                      <textarea className="input resize-none h-16" value={planForm.description} onChange={e => setPlanForm(f => ({ ...f, description: e.target.value }))} placeholder="Plan overview and goals..." />
                    </div>

                    {/* Schedule */}
                    <div>
                      <label className="label">Training Days</label>
                      <div className="flex flex-wrap gap-2">
                        {DAYS.map(day => {
                          const selected = planForm.schedule.find(s => s.day === day);
                          return (
                            <button key={day} type="button" onClick={() => toggleDay(day)}
                              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${selected ? 'bg-primary-500/20 border border-primary-500 text-primary-400' : 'bg-dark-700 border border-dark-500 text-gray-400 hover:border-dark-400'}`}>
                              {day.slice(0, 3)}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Exercises */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="label mb-0">Exercises</label>
                        <button type="button" onClick={addExercise} className="text-primary-400 text-xs hover:text-primary-300">+ Add Exercise</button>
                      </div>
                      <div className="space-y-2">
                        {planForm.exercises.map((ex, i) => (
                          <div key={i} className="flex items-center gap-2 p-3 bg-dark-700 rounded-xl">
                            <input className="input text-sm flex-1" placeholder="Exercise name" value={ex.name} onChange={e => updateExercise(i, 'name', e.target.value)} required />
                            <input className="input text-sm w-16" type="number" placeholder="Sets" value={ex.sets} onChange={e => updateExercise(i, 'sets', Number(e.target.value))} min="1" />
                            <input className="input text-sm w-16" type="number" placeholder="Reps" value={ex.reps} onChange={e => updateExercise(i, 'reps', Number(e.target.value))} min="0" />
                            <button type="button" onClick={() => removeExercise(i)} className="text-red-400 hover:text-red-300 p-1 flex-shrink-0">✕</button>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <button type="submit" className="btn-primary">Assign Plan</button>
                      <button type="button" onClick={() => setShowAssignPlan(false)} className="btn-secondary">Cancel</button>
                    </div>
                  </form>
                </div>
              )}
            </>
          ) : (
            <div className="card py-20 text-center text-gray-500">
              <p className="text-4xl mb-3">👈</p>
              <p>Select a client to view details and assign plans</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

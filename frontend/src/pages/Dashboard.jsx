import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const StatCard = ({ label, value, unit, color, icon }) => (
  <div className="stat-card">
    <div className="flex items-center justify-between">
      <span className="text-gray-400 text-sm">{label}</span>
      <span className="text-2xl">{icon}</span>
    </div>
    <div className="flex items-end gap-1">
      <span className={`font-display text-4xl tracking-wide ${color}`}>{value}</span>
      {unit && <span className="text-gray-500 text-sm mb-1">{unit}</span>}
    </div>
  </div>
);

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload?.length) {
    return (
      <div className="bg-dark-700 border border-dark-500 rounded-xl p-3 text-sm">
        <p className="text-gray-400 mb-1">{label}</p>
        {payload.map(p => (
          <p key={p.name} className="text-primary-400 font-mono">{p.name}: {p.value}</p>
        ))}
      </div>
    );
  }
  return null;
};

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [workouts, setWorkouts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [statsRes, workoutsRes] = await Promise.all([
          api.get('/workouts/stats'),
          api.get('/workouts?limit=5'),
        ]);
        setStats(statsRes.data);
        setWorkouts(workoutsRes.data.workouts);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const typeColors = { running: 'text-blue-400', cycling: 'text-purple-400', 'weight-training': 'text-amber-400', swimming: 'text-cyan-400', yoga: 'text-pink-400', hiit: 'text-red-400', walking: 'text-green-400', other: 'text-gray-400' };
  const typeBg = { running: 'bg-blue-400/10', cycling: 'bg-purple-400/10', 'weight-training': 'bg-amber-400/10', swimming: 'bg-cyan-400/10', yoga: 'bg-pink-400/10', hiit: 'bg-red-400/10', walking: 'bg-green-400/10', other: 'bg-gray-400/10' };

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="section-title">DASHBOARD</h1>
          <p className="text-gray-400 mt-1">Welcome back, <span className="text-primary-400 font-semibold">{user?.name}</span></p>
        </div>
        <Link to="/workouts" className="btn-primary flex items-center gap-2 w-fit">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
          Log Workout
        </Link>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Workouts" value={stats?.totalWorkouts || 0} icon="🏋️" color="text-primary-400" />
        <StatCard label="Calories Burned" value={stats?.totalCalories?.toLocaleString() || 0} unit="kcal" icon="🔥" color="text-orange-400" />
        <StatCard label="This Month" value={stats?.recentCount || 0} unit="sessions" icon="📅" color="text-blue-400" />
        <StatCard label="Workout Types" value={stats?.workoutsByType?.length || 0} icon="🎯" color="text-purple-400" />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weekly activity chart */}
        <div className="card">
          <h3 className="font-semibold text-white mb-4">Weekly Activity</h3>
          {stats?.weeklyData?.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={stats.weeklyData}>
                <defs>
                  <linearGradient id="calGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00e896" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#00e896" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="_id" tick={{ fill: '#6b7280', fontSize: 11 }} tickFormatter={v => v?.slice(5)} />
                <YAxis tick={{ fill: '#6b7280', fontSize: 11 }} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="calories" stroke="#00e896" fill="url(#calGrad)" strokeWidth={2} name="Calories" />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[200px] flex items-center justify-center text-gray-500">
              <div className="text-center">
                <p className="text-4xl mb-2">📊</p>
                <p>No workout data yet</p>
                <Link to="/workouts" className="text-primary-400 text-sm">Log your first workout →</Link>
              </div>
            </div>
          )}
        </div>

        {/* Workout types breakdown */}
        <div className="card">
          <h3 className="font-semibold text-white mb-4">Activity Breakdown</h3>
          {stats?.workoutsByType?.length > 0 ? (
            <div className="space-y-3">
              {stats.workoutsByType.map(t => {
                const pct = Math.round((t.count / stats.totalWorkouts) * 100);
                return (
                  <div key={t._id}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className={`capitalize font-medium ${typeColors[t._id] || 'text-gray-400'}`}>{t._id}</span>
                      <span className="text-gray-400">{t.count} sessions • {t.totalCalories} kcal</span>
                    </div>
                    <div className="h-2 bg-dark-700 rounded-full overflow-hidden">
                      <div className="h-full bg-primary-500 rounded-full transition-all" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="h-[200px] flex items-center justify-center text-gray-500 text-center">
              <div>
                <p className="text-4xl mb-2">🎯</p>
                <p>Log workouts to see breakdown</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Recent workouts */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-white">Recent Workouts</h3>
          <Link to="/workouts" className="text-primary-400 text-sm hover:text-primary-300">View all →</Link>
        </div>
        {workouts.length > 0 ? (
          <div className="space-y-3">
            {workouts.map(w => (
              <div key={w._id} className="flex items-center justify-between p-3 bg-dark-700 rounded-xl hover:bg-dark-600 transition-colors">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl ${typeBg[w.type] || 'bg-gray-400/10'} flex items-center justify-center text-lg`}>
                    {w.type === 'running' ? '🏃' : w.type === 'cycling' ? '🚴' : w.type === 'weight-training' ? '🏋️' : w.type === 'yoga' ? '🧘' : w.type === 'swimming' ? '🏊' : w.type === 'hiit' ? '⚡' : '🚶'}
                  </div>
                  <div>
                    <p className="font-medium text-white capitalize">{w.type}</p>
                    <p className="text-xs text-gray-400">{new Date(w.date).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-mono text-primary-400">{w.calories} kcal</p>
                  <p className="text-xs text-gray-400">{w.duration} min</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-12 text-center text-gray-500">
            <p className="text-4xl mb-3">🏃</p>
            <p className="mb-3">No workouts logged yet</p>
            <Link to="/workouts" className="btn-primary">Log First Workout</Link>
          </div>
        )}
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { to: '/plans', icon: '📋', label: 'Get Plan', desc: 'AI recommendations' },
          { to: '/device', icon: '⌚', label: 'Sync Device', desc: 'Import wearable data' },
          { to: '/community', icon: '🏆', label: 'Challenges', desc: 'Compete with others' },
          { to: '/analytics', icon: '📈', label: 'Analytics', desc: 'Deep performance data' },
        ].map(({ to, icon, label, desc }) => (
          <Link key={to} to={to} className="card hover:border-primary-500/40 hover:bg-dark-700 transition-all group">
            <div className="text-3xl mb-2">{icon}</div>
            <p className="font-semibold text-white group-hover:text-primary-400 transition-colors">{label}</p>
            <p className="text-xs text-gray-500">{desc}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}

import { useState, useEffect } from 'react';
import {
  LineChart, Line, AreaChart, Area, BarChart, Bar,
  RadarChart, Radar, PolarGrid, PolarAngleAxis,
  XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend
} from 'recharts';
import api from '../services/api';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload?.length) {
    return (
      <div className="bg-dark-700 border border-dark-500 rounded-xl p-3 text-sm shadow-xl">
        <p className="text-gray-400 mb-1 font-mono text-xs">{label}</p>
        {payload.map(p => (
          <p key={p.name} style={{ color: p.color }} className="font-semibold">{p.name}: {typeof p.value === 'number' ? p.value.toFixed(1) : p.value}</p>
        ))}
      </div>
    );
  }
  return null;
};

export default function Analytics() {
  const [metrics, setMetrics] = useState([]);
  const [summary, setSummary] = useState(null);
  const [stats, setStats] = useState(null);
  const [days, setDays] = useState(30);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [metricsRes, summaryRes, statsRes] = await Promise.all([
          api.get('/metrics', { params: { days } }),
          api.get('/metrics/summary'),
          api.get('/workouts/stats'),
        ]);
        setMetrics(metricsRes.data);
        setSummary(summaryRes.data);
        setStats(statsRes.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [days]);

  const heartRateZoneData = summary?.summary ? [
    { zone: 'Zone 1\nRecovery', value: 15, fill: '#4ade80' },
    { zone: 'Zone 2\nFat Burn', value: 28, fill: '#60a5fa' },
    { zone: 'Zone 3\nCardio', value: 32, fill: '#facc15' },
    { zone: 'Zone 4\nPeak', value: 18, fill: '#f97316' },
    { zone: 'Zone 5\nMax', value: 7, fill: '#ef4444' },
  ] : [];

  const radarData = stats?.workoutsByType?.map(t => ({
    subject: t._id,
    sessions: t.count,
    calories: Math.round(t.totalCalories / 100),
  })) || [];

  const trendData = summary?.trend?.map(m => ({
    date: new Date(m.date).toLocaleDateString('en', { month: 'short', day: 'numeric' }),
    score: m.performanceScore,
    heartRate: m.heartRate?.avg || 0,
    steps: Math.round((m.steps || 0) / 100),
  })) || [];

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="section-title">ANALYTICS</h1>
          <p className="text-gray-400 mt-1">Deep dive into your performance data</p>
        </div>
        <div className="flex gap-2">
          {[7, 14, 30, 90].map(d => (
            <button key={d} onClick={() => setDays(d)}
              className={`px-4 py-2 rounded-xl text-sm font-mono transition-all ${days === d ? 'bg-primary-500 text-dark-900 font-semibold' : 'bg-dark-700 text-gray-400 hover:bg-dark-600'}`}>
              {d}D
            </button>
          ))}
        </div>
      </div>

      {/* Summary metrics */}
      {summary?.summary && (
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          {[
            { label: 'Avg Heart Rate', value: Math.round(summary.summary.avgHeartRate || 0), unit: 'bpm', color: 'text-red-400' },
            { label: 'Avg Performance', value: Math.round(summary.summary.avgPerformanceScore || 0), unit: '/100', color: 'text-primary-400' },
            { label: 'Total Steps', value: (summary.summary.totalSteps || 0).toLocaleString(), unit: '', color: 'text-blue-400' },
            { label: 'Avg Cadence', value: Math.round(summary.summary.avgCadence || 0), unit: 'spm', color: 'text-purple-400' },
            { label: 'Total Volume', value: Math.round(summary.summary.totalVolume || 0).toLocaleString(), unit: 'kg', color: 'text-amber-400' },
          ].map(({ label, value, unit, color }) => (
            <div key={label} className="stat-card">
              <span className="text-gray-400 text-xs">{label}</span>
              <div className="flex items-end gap-1">
                <span className={`font-display text-3xl ${color}`}>{value}</span>
                {unit && <span className="text-gray-500 text-xs mb-1">{unit}</span>}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Charts grid */}
      {trendData.length > 0 ? (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Performance score trend */}
            <div className="card">
              <h3 className="font-semibold text-white mb-4">Performance Score Trend</h3>
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={trendData}>
                  <defs>
                    <linearGradient id="scoreGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#00e896" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#00e896" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1a2235" />
                  <XAxis dataKey="date" tick={{ fill: '#6b7280', fontSize: 11 }} />
                  <YAxis domain={[0, 100]} tick={{ fill: '#6b7280', fontSize: 11 }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area type="monotone" dataKey="score" stroke="#00e896" fill="url(#scoreGrad)" strokeWidth={2} name="Score" />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Heart rate trend */}
            <div className="card">
              <h3 className="font-semibold text-white mb-4">Heart Rate Trend</h3>
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1a2235" />
                  <XAxis dataKey="date" tick={{ fill: '#6b7280', fontSize: 11 }} />
                  <YAxis tick={{ fill: '#6b7280', fontSize: 11 }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Line type="monotone" dataKey="heartRate" stroke="#ef4444" strokeWidth={2} dot={false} name="Avg HR (bpm)" />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Steps trend */}
            <div className="card">
              <h3 className="font-semibold text-white mb-4">Daily Steps (×100)</h3>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1a2235" />
                  <XAxis dataKey="date" tick={{ fill: '#6b7280', fontSize: 11 }} />
                  <YAxis tick={{ fill: '#6b7280', fontSize: 11 }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="steps" fill="#60a5fa" radius={[4, 4, 0, 0]} name="Steps ×100" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* HR Zones */}
            <div className="card">
              <h3 className="font-semibold text-white mb-4">Heart Rate Zones Distribution</h3>
              {heartRateZoneData.length > 0 ? (
                <div className="space-y-3 mt-2">
                  {heartRateZoneData.map(z => (
                    <div key={z.zone}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-400 font-mono text-xs">{z.zone.replace('\n', ' ')}</span>
                        <span className="text-gray-300 font-mono">{z.value}%</span>
                      </div>
                      <div className="h-3 bg-dark-700 rounded-full overflow-hidden">
                        <div className="h-full rounded-full transition-all" style={{ width: `${z.value}%`, backgroundColor: z.fill }} />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="h-[180px] flex items-center justify-center text-gray-500">Sync device data for HR zones</div>
              )}
            </div>
          </div>

          {/* Radar chart */}
          {radarData.length >= 3 && (
            <div className="card">
              <h3 className="font-semibold text-white mb-4">Workout Diversity Radar</h3>
              <ResponsiveContainer width="100%" height={300}>
                <RadarChart data={radarData}>
                  <PolarGrid stroke="#1a2235" />
                  <PolarAngleAxis dataKey="subject" tick={{ fill: '#9ca3af', fontSize: 11 }} />
                  <Radar name="Sessions" dataKey="sessions" stroke="#00e896" fill="#00e896" fillOpacity={0.2} />
                  <Radar name="Calories ×100" dataKey="calories" stroke="#60a5fa" fill="#60a5fa" fillOpacity={0.1} />
                  <Legend />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          )}
        </>
      ) : (
        <div className="card py-20 text-center text-gray-500">
          <p className="text-5xl mb-4">📊</p>
          <p className="text-xl mb-2">No analytics data yet</p>
          <p className="text-sm">Log workouts or sync a device to see your performance analytics</p>
        </div>
      )}
    </div>
  );
}

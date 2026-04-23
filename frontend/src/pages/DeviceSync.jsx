import { useState, useEffect } from 'react';
import api from '../services/api';

export default function DeviceSync() {
  const [devices, setDevices] = useState([]);
  const [syncing, setSyncing] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/device/status').then(res => setDevices(res.data)).catch(console.error);
  }, []);

  const handleSync = async (deviceName, deviceId) => {
    setSyncing(true);
    setResult(null);
    setError('');
    try {
      const res = await api.post('/device/sync', { deviceName, deviceId });
      setResult(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Sync failed');
    } finally {
      setSyncing(false);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="section-title">DEVICE SYNC</h1>
        <p className="text-gray-400 mt-1">Connect and sync your wearable fitness devices</p>
      </div>

      {/* Info banner */}
      <div className="p-4 bg-blue-500/5 border border-blue-500/20 rounded-2xl flex items-start gap-3">
        <span className="text-2xl">⌚</span>
        <div>
          <p className="text-blue-400 font-semibold text-sm">Simulated Device Integration</p>
          <p className="text-gray-400 text-sm mt-1">This demo simulates wearable device sync. Click "Sync Now" to import realistic workout sessions including heart rate, steps, cadence, and performance scores. In production, this would connect to real APIs like Fitbit, Apple Health, or Garmin.</p>
        </div>
      </div>

      {/* Device cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {devices.map(device => (
          <div key={device.deviceId} className={`card border transition-all ${device.connected ? 'border-primary-500/30 hover:border-primary-500/50' : 'border-dark-600 opacity-70'}`}>
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl ${device.connected ? 'bg-primary-500/20' : 'bg-dark-700'}`}>
                  ⌚
                </div>
                <div>
                  <h3 className="font-semibold text-white">{device.deviceName}</h3>
                  <p className="text-gray-500 text-xs font-mono">{device.deviceId}</p>
                </div>
              </div>
              <div className={`flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full ${device.connected ? 'bg-primary-500/20 text-primary-400' : 'bg-gray-500/20 text-gray-400'}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${device.connected ? 'bg-primary-400' : 'bg-gray-500'}`} />
                {device.connected ? 'Connected' : 'Disconnected'}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="bg-dark-700 rounded-xl p-3">
                <p className="text-gray-500 text-xs">Battery</p>
                <div className="flex items-center gap-2 mt-1">
                  <div className="flex-1 h-2 bg-dark-600 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full ${device.batteryLevel > 50 ? 'bg-primary-500' : device.batteryLevel > 20 ? 'bg-amber-400' : 'bg-red-500'}`}
                      style={{ width: `${device.batteryLevel}%` }} />
                  </div>
                  <span className="text-white text-xs font-mono">{device.batteryLevel}%</span>
                </div>
              </div>
              <div className="bg-dark-700 rounded-xl p-3">
                <p className="text-gray-500 text-xs">Last Sync</p>
                <p className="text-white text-xs mt-1">{device.lastSync ? new Date(device.lastSync).toLocaleString() : 'Never'}</p>
              </div>
            </div>

            <button onClick={() => handleSync(device.deviceName, device.deviceId)}
              disabled={!device.connected || syncing}
              className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl font-semibold text-sm transition-all ${device.connected ? 'btn-primary' : 'bg-dark-700 text-gray-500 cursor-not-allowed'}`}>
              {syncing ? (
                <><div className="w-4 h-4 border-2 border-dark-900 border-t-transparent rounded-full animate-spin" /> Syncing...</>
              ) : (
                <><span>⚡</span> Sync Now</>
              )}
            </button>
          </div>
        ))}
      </div>

      {/* Sync result */}
      {result && (
        <div className="card border-primary-500/30 bg-primary-500/5">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-primary-500/20 flex items-center justify-center text-xl">✅</div>
            <div>
              <h3 className="font-semibold text-white">Sync Complete!</h3>
              <p className="text-primary-400 text-sm">{result.message}</p>
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {result.sessions?.map((session, i) => (
              <div key={i} className="bg-dark-700 rounded-xl p-3">
                <p className="text-white text-sm font-medium capitalize">{session.workout.type}</p>
                <div className="mt-2 space-y-1 text-xs text-gray-400 font-mono">
                  <p>⏱ {session.workout.duration} min</p>
                  <p>🔥 {session.workout.calories} kcal</p>
                  <p>❤️ {session.metrics.heartRate?.avg} bpm avg</p>
                  <p>⭐ Score: {session.metrics.performanceScore}/100</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400">{error}</div>
      )}

      {/* How it works */}
      <div className="card">
        <h3 className="font-semibold text-white mb-4">How Device Sync Works</h3>
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          {[
            { step: '1', icon: '⌚', title: 'Connect Device', desc: 'Pair your wearable via Bluetooth or WiFi' },
            { step: '2', icon: '📡', title: 'Fetch Data', desc: 'Platform pulls workout sessions from device API' },
            { step: '3', icon: '🔄', title: 'Process Metrics', desc: 'HR zones, cadence, steps calculated automatically' },
            { step: '4', icon: '📊', title: 'View Analytics', desc: 'See synced data in your analytics dashboard' },
          ].map(({ step, icon, title, desc }) => (
            <div key={step} className="text-center">
              <div className="w-12 h-12 rounded-full bg-primary-500/20 flex items-center justify-center text-xl mx-auto mb-3">{icon}</div>
              <p className="font-semibold text-white text-sm">{title}</p>
              <p className="text-gray-400 text-xs mt-1">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

const Workout = require('../models/Workout');
const Metrics = require('../models/Metrics');

// Simulate wearable device data sync
const generateDeviceData = (deviceType) => {
  const now = new Date();
  const sessions = [];

  // Generate 3-5 random workout sessions from the past week
  const count = 3 + Math.floor(Math.random() * 3);
  const types = ['running', 'cycling', 'walking', 'hiit'];

  for (let i = 0; i < count; i++) {
    const date = new Date(now);
    date.setDate(date.getDate() - Math.floor(Math.random() * 7));
    const type = types[Math.floor(Math.random() * types.length)];
    const duration = 20 + Math.floor(Math.random() * 50);
    const calories = Math.round(duration * (6 + Math.random() * 4));
    const distance = type !== 'hiit' ? parseFloat((duration * 0.15).toFixed(2)) : 0;
    const avgHR = 110 + Math.floor(Math.random() * 60);
    const maxHR = avgHR + 20 + Math.floor(Math.random() * 20);
    const cadence = type === 'running' ? 145 + Math.floor(Math.random() * 25) : type === 'cycling' ? 80 + Math.floor(Math.random() * 20) : 0;
    const steps = type !== 'cycling' ? Math.round(duration * 150) : 0;

    sessions.push({
      type, duration, calories, distance, date,
      heartRate: { avg: avgHR, max: maxHR, min: 75 + Math.floor(Math.random() * 20) },
      cadence, steps,
      performanceScore: Math.min(100, Math.round((calories / duration) * 8)),
    });
  }
  return sessions;
};

exports.syncDevice = async (req, res) => {
  try {
    const { deviceName = 'SmartWatch Pro', deviceId = 'SIM-001' } = req.body;
    const sessions = generateDeviceData(deviceName);
    const created = [];

    for (const session of sessions) {
      const { heartRate, cadence, steps, performanceScore, ...workoutData } = session;

      const workout = await Workout.create({
        userId: req.user.id,
        ...workoutData,
        source: 'device',
        notes: `Synced from ${deviceName}`,
      });

      const metrics = await Metrics.create({
        userId: req.user.id,
        workoutId: workout._id,
        heartRate,
        cadence,
        steps,
        performanceScore,
        volume: 0,
        heartRateZones: { zone1: 15, zone2: 30, zone3: 30, zone4: 20, zone5: 5 },
        date: session.date,
      });

      created.push({ workout, metrics });
    }

    res.status(201).json({
      message: `Successfully synced ${created.length} sessions from ${deviceName}`,
      deviceId,
      sessionsImported: created.length,
      sessions: created,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getDeviceStatus = async (req, res) => {
  try {
    const devices = [
      { deviceName: 'SmartWatch Pro', deviceId: 'SIM-001', connected: true, batteryLevel: 78, lastSync: new Date() },
      { deviceName: 'Fitness Band X', deviceId: 'SIM-002', connected: false, batteryLevel: 45, lastSync: null },
    ];
    res.json(devices);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const mongoose = require('mongoose');

const MetricsSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  workoutId: { type: mongoose.Schema.Types.ObjectId, ref: 'Workout' },
  heartRate: {
    avg: { type: Number, default: 0 },
    max: { type: Number, default: 0 },
    min: { type: Number, default: 0 },
  },
  cadence: { type: Number, default: 0 }, // steps/min
  volume: { type: Number, default: 0 }, // total weight lifted (kg)
  steps: { type: Number, default: 0 },
  performanceScore: { type: Number, default: 0 }, // 0-100
  heartRateZones: {
    zone1: { type: Number, default: 0 }, // % time in zone
    zone2: { type: Number, default: 0 },
    zone3: { type: Number, default: 0 },
    zone4: { type: Number, default: 0 },
    zone5: { type: Number, default: 0 },
  },
  date: { type: Date, default: Date.now },
}, { timestamps: true });

module.exports = mongoose.model('Metrics', MetricsSchema);

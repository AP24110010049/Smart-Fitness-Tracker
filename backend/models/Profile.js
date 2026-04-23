const mongoose = require('mongoose');

const ProfileSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  age: { type: Number },
  weight: { type: Number },
  height: { type: Number },
  fitnessGoals: [{ type: String }],
  preferences: {
    workoutDays: { type: Number, default: 3 },
    workoutDuration: { type: Number, default: 45 },
    fitnessLevel: { type: String, enum: ['beginner', 'intermediate', 'advanced'], default: 'beginner' },
  },
  deviceConnections: [{ deviceName: String, deviceId: String, connected: Boolean }],
  bio: { type: String, default: '' },
}, { timestamps: true });

module.exports = mongoose.model('Profile', ProfileSchema);

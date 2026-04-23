const mongoose = require('mongoose');

const WorkoutSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: { type: String, required: true, enum: ['running', 'cycling', 'swimming', 'weight-training', 'yoga', 'hiit', 'walking', 'other'] },
  duration: { type: Number, required: true }, // minutes
  calories: { type: Number, required: true },
  distance: { type: Number, default: 0 }, // km
  notes: { type: String, default: '' },
  date: { type: Date, default: Date.now },
  source: { type: String, enum: ['manual', 'device'], default: 'manual' },
}, { timestamps: true });

module.exports = mongoose.model('Workout', WorkoutSchema);

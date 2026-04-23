const Workout = require('../models/Workout');
const Metrics = require('../models/Metrics');

exports.logWorkout = async (req, res) => {
  try {
    const { type, duration, calories, distance, notes, date } = req.body;
    const workout = await Workout.create({
      userId: req.user.id,
      type, duration, calories, distance, notes,
      date: date || Date.now(),
    });

    // Auto-generate basic metrics
    const performanceScore = Math.min(100, Math.round((calories / duration) * 10));
    await Metrics.create({
      userId: req.user.id,
      workoutId: workout._id,
      heartRate: { avg: 120 + Math.floor(Math.random() * 40), max: 160 + Math.floor(Math.random() * 30), min: 80 },
      cadence: type === 'running' ? 150 + Math.floor(Math.random() * 20) : 0,
      volume: type === 'weight-training' ? duration * 10 : 0,
      steps: type === 'running' ? Math.round(duration * 160) : Math.round(duration * 80),
      performanceScore,
      heartRateZones: { zone1: 10, zone2: 25, zone3: 35, zone4: 20, zone5: 10 },
      date: date || Date.now(),
    });

    res.status(201).json(workout);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getWorkouts = async (req, res) => {
  try {
    const { limit = 20, page = 1, type } = req.query;
    const filter = { userId: req.user.id };
    if (type) filter.type = type;

    const workouts = await Workout.find(filter)
      .sort({ date: -1 })
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit));

    const total = await Workout.countDocuments(filter);
    res.json({ workouts, total, page: Number(page) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getWorkoutById = async (req, res) => {
  try {
    const workout = await Workout.findOne({ _id: req.params.id, userId: req.user.id });
    if (!workout) return res.status(404).json({ message: 'Workout not found' });
    res.json(workout);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.deleteWorkout = async (req, res) => {
  try {
    await Workout.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
    res.json({ message: 'Workout deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getStats = async (req, res) => {
  try {
    const userId = req.user.id;
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const [totalWorkouts, totalCalories, recentWorkouts] = await Promise.all([
      Workout.countDocuments({ userId }),
      Workout.aggregate([{ $match: { userId: require('mongoose').Types.ObjectId.createFromHexString(userId) } }, { $group: { _id: null, total: { $sum: '$calories' } } }]),
      Workout.find({ userId, date: { $gte: thirtyDaysAgo } }).sort({ date: -1 }),
    ]);

    const workoutsByType = await Workout.aggregate([
      { $match: { userId: require('mongoose').Types.ObjectId.createFromHexString(userId) } },
      { $group: { _id: '$type', count: { $sum: 1 }, totalCalories: { $sum: '$calories' }, totalDuration: { $sum: '$duration' } } },
    ]);

    const weeklyData = await Workout.aggregate([
      { $match: { userId: require('mongoose').Types.ObjectId.createFromHexString(userId), date: { $gte: thirtyDaysAgo } } },
      { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$date' } }, calories: { $sum: '$calories' }, duration: { $sum: '$duration' }, count: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]);

    res.json({
      totalWorkouts,
      totalCalories: totalCalories[0]?.total || 0,
      recentCount: recentWorkouts.length,
      workoutsByType,
      weeklyData,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

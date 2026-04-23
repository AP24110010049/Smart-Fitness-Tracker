const Metrics = require('../models/Metrics');

exports.getMetrics = async (req, res) => {
  try {
    const { days = 30 } = req.query;
    const since = new Date();
    since.setDate(since.getDate() - Number(days));

    const metrics = await Metrics.find({ userId: req.user.id, date: { $gte: since } })
      .sort({ date: -1 })
      .populate('workoutId', 'type duration');

    res.json(metrics);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getMetricsSummary = async (req, res) => {
  try {
    const mongoose = require('mongoose');
    const userId = mongoose.Types.ObjectId.createFromHexString(req.user.id);

    const summary = await Metrics.aggregate([
      { $match: { userId } },
      { $group: {
        _id: null,
        avgHeartRate: { $avg: '$heartRate.avg' },
        avgPerformanceScore: { $avg: '$performanceScore' },
        totalSteps: { $sum: '$steps' },
        avgCadence: { $avg: '$cadence' },
        totalVolume: { $sum: '$volume' },
      }},
    ]);

    const trend = await Metrics.aggregate([
      { $match: { userId } },
      { $sort: { date: -1 } },
      { $limit: 14 },
      { $project: { date: 1, performanceScore: 1, heartRate: 1, steps: 1 } },
      { $sort: { date: 1 } },
    ]);

    res.json({ summary: summary[0] || {}, trend });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

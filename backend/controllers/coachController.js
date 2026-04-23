const User = require('../models/User');
const Workout = require('../models/Workout');
const Metrics = require('../models/Metrics');
const Plan = require('../models/Plan');
const Profile = require('../models/Profile');

exports.getClients = async (req, res) => {
  try {
    // Coach sees all regular users
    const clients = await User.find({ role: 'user' }).select('-password');
    res.json(clients);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getClientDetails = async (req, res) => {
  try {
    const { clientId } = req.params;
    const [user, profile, workouts, metrics] = await Promise.all([
      User.findById(clientId).select('-password'),
      Profile.findOne({ userId: clientId }),
      Workout.find({ userId: clientId }).sort({ date: -1 }).limit(10),
      Metrics.find({ userId: clientId }).sort({ date: -1 }).limit(10),
    ]);
    res.json({ user, profile, workouts, metrics });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.assignPlan = async (req, res) => {
  try {
    const { clientId } = req.params;
    const plan = await Plan.create({
      ...req.body,
      userId: clientId,
      coachId: req.user.id,
    });
    res.status(201).json(plan);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getClientPlans = async (req, res) => {
  try {
    const { clientId } = req.params;
    const plans = await Plan.find({ userId: clientId, coachId: req.user.id });
    res.json(plans);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getCoachStats = async (req, res) => {
  try {
    const totalClients = await User.countDocuments({ role: 'user' });
    const totalPlansAssigned = await Plan.countDocuments({ coachId: req.user.id });
    const recentActivity = await Workout.find()
      .sort({ createdAt: -1 })
      .limit(10)
      .populate('userId', 'name email');

    res.json({ totalClients, totalPlansAssigned, recentActivity });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const Challenge = require('../models/Challenge');
const Workout = require('../models/Workout');

exports.createChallenge = async (req, res) => {
  try {
    const challenge = await Challenge.create({ ...req.body, createdBy: req.user.id });
    res.status(201).json(challenge);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getChallenges = async (req, res) => {
  try {
    const challenges = await Challenge.find({ isActive: true })
      .populate('participants.userId', 'name email')
      .populate('leaderboard.userId', 'name email')
      .populate('createdBy', 'name');
    res.json(challenges);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.joinChallenge = async (req, res) => {
  try {
    const challenge = await Challenge.findById(req.params.id);
    if (!challenge) return res.status(404).json({ message: 'Challenge not found' });

    const alreadyJoined = challenge.participants.some(p => p.userId.toString() === req.user.id);
    if (alreadyJoined) return res.status(400).json({ message: 'Already joined' });

    challenge.participants.push({ userId: req.user.id, progress: 0 });
    challenge.leaderboard.push({ userId: req.user.id, score: 0 });
    await challenge.save();
    res.json(challenge);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateProgress = async (req, res) => {
  try {
    const challenge = await Challenge.findById(req.params.id);
    if (!challenge) return res.status(404).json({ message: 'Challenge not found' });

    // Calculate real progress from workouts during challenge period
    const workouts = await Workout.find({
      userId: req.user.id,
      date: { $gte: challenge.startDate, $lte: challenge.endDate }
    });

    let score = 0;
    if (challenge.type === 'calories') score = workouts.reduce((a, w) => a + w.calories, 0);
    else if (challenge.type === 'duration') score = workouts.reduce((a, w) => a + w.duration, 0);
    else if (challenge.type === 'distance') score = workouts.reduce((a, w) => a + (w.distance || 0), 0);
    else if (challenge.type === 'workouts') score = workouts.length;

    // Update participant progress
    const pIdx = challenge.participants.findIndex(p => p.userId.toString() === req.user.id);
    if (pIdx > -1) challenge.participants[pIdx].progress = score;

    // Update leaderboard
    const lIdx = challenge.leaderboard.findIndex(l => l.userId.toString() === req.user.id);
    if (lIdx > -1) challenge.leaderboard[lIdx].score = score;

    // Sort leaderboard
    challenge.leaderboard.sort((a, b) => b.score - a.score);
    challenge.leaderboard.forEach((entry, i) => { entry.rank = i + 1; });

    await challenge.save();
    await challenge.populate('leaderboard.userId', 'name email');
    res.json(challenge);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const Plan = require('../models/Plan');
const Workout = require('../models/Workout');
const Profile = require('../models/Profile');

// Simple rule-based recommendation engine
const generateRecommendations = (workouts, profile) => {
  const level = profile?.preferences?.fitnessLevel || 'beginner';
  const goals = profile?.fitnessGoals || [];
  const recommendations = [];

  const typeCount = workouts.reduce((acc, w) => {
    acc[w.type] = (acc[w.type] || 0) + 1;
    return acc;
  }, {});

  if (!typeCount['weight-training'] || typeCount['weight-training'] < 2) {
    recommendations.push('Add weight training 2-3x per week for strength gains');
  }
  if (!typeCount['running'] && !typeCount['cycling'] && !typeCount['walking']) {
    recommendations.push('Include cardio workouts for cardiovascular health');
  }
  if (workouts.length < 3) {
    recommendations.push('Aim for at least 3 workouts per week for consistent progress');
  }

  const exercises = {
    beginner: [
      { name: 'Bodyweight Squats', sets: 3, reps: 12, duration: 0, restTime: 60 },
      { name: 'Push-ups', sets: 3, reps: 10, duration: 0, restTime: 60 },
      { name: '20-min Brisk Walk', sets: 1, reps: 1, duration: 20, restTime: 0 },
      { name: 'Plank Hold', sets: 3, reps: 1, duration: 1, restTime: 45 },
    ],
    intermediate: [
      { name: 'Barbell Squats', sets: 4, reps: 8, duration: 0, restTime: 90 },
      { name: 'Bench Press', sets: 4, reps: 8, duration: 0, restTime: 90 },
      { name: '30-min Run', sets: 1, reps: 1, duration: 30, restTime: 0 },
      { name: 'Pull-ups', sets: 3, reps: 6, duration: 0, restTime: 90 },
      { name: 'Deadlift', sets: 3, reps: 6, duration: 0, restTime: 120 },
    ],
    advanced: [
      { name: 'Olympic Lifts', sets: 5, reps: 5, duration: 0, restTime: 120 },
      { name: 'HIIT Sprints', sets: 8, reps: 1, duration: 1, restTime: 30 },
      { name: '45-min Tempo Run', sets: 1, reps: 1, duration: 45, restTime: 0 },
      { name: 'Weighted Pull-ups', sets: 4, reps: 6, duration: 0, restTime: 90 },
      { name: 'Box Jumps', sets: 4, reps: 10, duration: 0, restTime: 60 },
    ],
  };

  const schedules = {
    beginner: [
      { day: 'Monday', focus: 'Full Body Strength' },
      { day: 'Wednesday', focus: 'Cardio & Core' },
      { day: 'Friday', focus: 'Full Body + Flexibility' },
    ],
    intermediate: [
      { day: 'Monday', focus: 'Upper Body' },
      { day: 'Tuesday', focus: 'Cardio' },
      { day: 'Thursday', focus: 'Lower Body' },
      { day: 'Saturday', focus: 'HIIT + Core' },
    ],
    advanced: [
      { day: 'Monday', focus: 'Strength - Push' },
      { day: 'Tuesday', focus: 'Cardio Intervals' },
      { day: 'Wednesday', focus: 'Strength - Pull' },
      { day: 'Thursday', focus: 'Active Recovery' },
      { day: 'Friday', focus: 'Legs & Power' },
      { day: 'Saturday', focus: 'Endurance Run' },
    ],
  };

  return {
    exercises: exercises[level],
    schedule: schedules[level],
    recommendations,
  };
};

exports.generatePlan = async (req, res) => {
  try {
    const recentWorkouts = await Workout.find({ userId: req.user.id }).sort({ date: -1 }).limit(10);
    const profile = await Profile.findOne({ userId: req.user.id });
    const { exercises, schedule, recommendations } = generateRecommendations(recentWorkouts, profile);

    const plan = await Plan.create({
      userId: req.user.id,
      title: `AI Recommended Plan - ${new Date().toLocaleDateString()}`,
      description: 'Personalized plan generated based on your workout history and fitness level.',
      exercises,
      schedule,
      recommendations,
      isAIGenerated: true,
    });

    res.status(201).json(plan);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getPlans = async (req, res) => {
  try {
    const plans = await Plan.find({ userId: req.user.id }).sort({ createdAt: -1 });
    res.json(plans);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.createPlan = async (req, res) => {
  try {
    const plan = await Plan.create({ ...req.body, userId: req.user.id });
    res.status(201).json(plan);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.deletePlan = async (req, res) => {
  try {
    await Plan.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
    res.json({ message: 'Plan deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

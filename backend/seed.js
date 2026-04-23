require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const connectDB = require('./config/db');
const User = require('./models/User');
const Profile = require('./models/Profile');
const Workout = require('./models/Workout');
const Metrics = require('./models/Metrics');
const Group = require('./models/Group');
const Challenge = require('./models/Challenge');

const WORKOUT_TYPES = ['running', 'cycling', 'weight-training', 'yoga', 'hiit', 'walking'];

const randomBetween = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

const generateWorkoutsAndMetrics = async (userId, count = 20) => {
  const workouts = [];
  const metrics = [];
  
  for (let i = 0; i < count; i++) {
    const date = new Date();
    date.setDate(date.getDate() - randomBetween(0, 60));
    
    const type = WORKOUT_TYPES[randomBetween(0, WORKOUT_TYPES.length - 1)];
    const duration = randomBetween(20, 75);
    const calories = randomBetween(150, 600);
    const distance = ['running', 'cycling', 'walking'].includes(type) ? parseFloat((duration * 0.12).toFixed(1)) : 0;

    const workout = new Workout({ userId, type, duration, calories, distance, date, source: Math.random() > 0.7 ? 'device' : 'manual', notes: '' });
    workouts.push(workout);

    const avgHR = randomBetween(110, 160);
    const metric = new Metrics({
      userId,
      workoutId: workout._id,
      heartRate: { avg: avgHR, max: avgHR + randomBetween(15, 30), min: randomBetween(70, 90) },
      cadence: type === 'running' ? randomBetween(145, 175) : type === 'cycling' ? randomBetween(75, 100) : 0,
      volume: type === 'weight-training' ? duration * randomBetween(8, 15) : 0,
      steps: type !== 'cycling' ? duration * randomBetween(130, 170) : 0,
      performanceScore: randomBetween(55, 95),
      heartRateZones: { zone1: 15, zone2: 25, zone3: 30, zone4: 20, zone5: 10 },
      date,
    });
    metrics.push(metric);
  }

  await Workout.insertMany(workouts);
  await Metrics.insertMany(metrics);
  console.log(`✓ Created ${count} workouts + metrics for user`);
};

const seed = async () => {
  await connectDB();
  
  console.log('\n🌱 Seeding FitForge Database...\n');

  // Clear collections
  await Promise.all([
    User.deleteMany({}),
    Profile.deleteMany({}),
    Workout.deleteMany({}),
    Metrics.deleteMany({}),
    Group.deleteMany({}),
    Challenge.deleteMany({}),
  ]);
  console.log('✓ Cleared existing data');

  // Create demo users
  const password = await bcrypt.hash('password123', 10);
  
  const demoUser = new User({ name: 'Rahul Sharma', email: 'user@demo.com', password, role: 'user' });
  const demoCoach = new User({ name: 'Coach Priya', email: 'coach@demo.com', password, role: 'coach' });
  const user2 = new User({ name: 'Anjali Patel', email: 'anjali@demo.com', password, role: 'user' });
  const user3 = new User({ name: 'Vikram Singh', email: 'vikram@demo.com', password, role: 'user' });

  await Promise.all([demoUser.save(), demoCoach.save(), user2.save(), user3.save()]);
  console.log('✓ Created demo users (user@demo.com, coach@demo.com / password123)');

  // Create profiles
  await Profile.create([
    {
      userId: demoUser._id,
      age: 28, weight: 75, height: 178,
      bio: 'Passionate runner training for my first marathon.',
      fitnessGoals: ['endurance', 'weight-loss'],
      preferences: { workoutDays: 5, workoutDuration: 45, fitnessLevel: 'intermediate' },
    },
    {
      userId: demoCoach._id,
      bio: 'Certified personal trainer with 8+ years of experience.',
      fitnessGoals: ['sports-performance'],
      preferences: { workoutDays: 6, workoutDuration: 60, fitnessLevel: 'advanced' },
    },
    { userId: user2._id, age: 25, weight: 60, height: 165, fitnessGoals: ['flexibility', 'general-fitness'], preferences: { workoutDays: 3, workoutDuration: 30, fitnessLevel: 'beginner' } },
    { userId: user3._id, age: 32, weight: 85, height: 182, fitnessGoals: ['muscle-gain'], preferences: { workoutDays: 4, workoutDuration: 60, fitnessLevel: 'advanced' } },
  ]);
  console.log('✓ Created profiles');

  // Generate workout data
  await generateWorkoutsAndMetrics(demoUser._id, 25);
  await generateWorkoutsAndMetrics(user2._id, 12);
  await generateWorkoutsAndMetrics(user3._id, 18);

  // Create groups
  const groups = await Group.create([
    { groupName: 'Morning Runners', description: 'Early birds who love hitting the pavement at dawn.', createdBy: demoUser._id, members: [demoUser._id, user2._id, user3._id], category: 'running' },
    { groupName: 'Iron Warriors', description: 'Serious lifters pushing their limits every session.', createdBy: user3._id, members: [user3._id, demoUser._id], category: 'weight-training' },
    { groupName: 'Zen Riders', description: 'Yoga and cycling enthusiasts finding balance.', createdBy: user2._id, members: [user2._id], category: 'yoga' },
  ]);
  console.log('✓ Created 3 groups');

  // Create challenges
  const now = new Date();
  const endDate = new Date(); endDate.setDate(endDate.getDate() + 30);
  const startDate = new Date(); startDate.setDate(startDate.getDate() - 7);

  await Challenge.create([
    {
      challengeName: '30-Day Calorie Blaster',
      description: 'Burn 15,000 calories in 30 days. Are you up for it?',
      createdBy: demoCoach._id,
      type: 'calories',
      target: 15000,
      startDate,
      endDate,
      participants: [
        { userId: demoUser._id, progress: 3200 },
        { userId: user2._id, progress: 1800 },
        { userId: user3._id, progress: 4100 },
      ],
      leaderboard: [
        { userId: user3._id, score: 4100, rank: 1 },
        { userId: demoUser._id, score: 3200, rank: 2 },
        { userId: user2._id, score: 1800, rank: 3 },
      ],
    },
    {
      challengeName: 'September Workout Streak',
      description: 'Complete 20 workouts this month. Consistency is key!',
      createdBy: demoUser._id,
      type: 'workouts',
      target: 20,
      startDate,
      endDate,
      participants: [
        { userId: demoUser._id, progress: 12 },
        { userId: user3._id, progress: 15 },
      ],
      leaderboard: [
        { userId: user3._id, score: 15, rank: 1 },
        { userId: demoUser._id, score: 12, rank: 2 },
      ],
    },
  ]);
  console.log('✓ Created 2 challenges with leaderboards');

  console.log('\n✅ Seeding complete!\n');
  console.log('Demo credentials:');
  console.log('  User:  user@demo.com  / password123');
  console.log('  Coach: coach@demo.com / password123\n');

  process.exit(0);
};

seed().catch(err => { console.error('Seed error:', err); process.exit(1); });

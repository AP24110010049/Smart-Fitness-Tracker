# 🏋️ FitForge — Scalable Fitness Platform

A production-ready full-stack MERN fitness platform with workout tracking, analytics, AI recommendations, device sync, community features, and a coach dashboard.

---

## 🗂️ Project Structure

```
fitness-platform/
├── backend/
│   ├── config/
│   │   └── db.js                  # MongoDB connection
│   ├── controllers/
│   │   ├── authController.js      # Signup, login, JWT
│   │   ├── profileController.js   # User profiles
│   │   ├── workoutController.js   # Log & fetch workouts
│   │   ├── metricsController.js   # Performance metrics
│   │   ├── planController.js      # AI plan generation
│   │   ├── groupController.js     # Community groups
│   │   ├── challengeController.js # Fitness challenges
│   │   ├── coachController.js     # Coach dashboard
│   │   └── deviceController.js   # Wearable device sync
│   ├── middleware/
│   │   ├── auth.js                # JWT middleware
│   │   └── coach.js               # Role guard
│   ├── models/
│   │   ├── User.js
│   │   ├── Profile.js
│   │   ├── Workout.js
│   │   ├── Metrics.js
│   │   ├── Plan.js
│   │   ├── Group.js
│   │   └── Challenge.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── profile.js
│   │   ├── workouts.js
│   │   ├── metrics.js
│   │   ├── plans.js
│   │   ├── groups.js
│   │   ├── challenges.js
│   │   ├── coach.js
│   │   └── device.js
│   ├── .env
│   ├── seed.js                    # Demo data seeder
│   ├── server.js
│   └── package.json
│
└── frontend/
    ├── src/
    │   ├── components/
    │   │   └── Layout.jsx         # Sidebar + navigation
    │   ├── context/
    │   │   └── AuthContext.jsx    # Auth state management
    │   ├── pages/
    │   │   ├── Login.jsx
    │   │   ├── Signup.jsx
    │   │   ├── Dashboard.jsx      # Overview + charts
    │   │   ├── WorkoutTracker.jsx # Log & manage workouts
    │   │   ├── Analytics.jsx      # Deep performance charts
    │   │   ├── Plans.jsx          # AI workout plans
    │   │   ├── Community.jsx      # Groups + challenges
    │   │   ├── DeviceSync.jsx     # Wearable sync
    │   │   ├── CoachDashboard.jsx # Coach tools
    │   │   └── Profile.jsx        # User profile
    │   ├── services/
    │   │   └── api.js             # Axios instance
    │   ├── App.jsx                # Routes
    │   ├── main.jsx
    │   └── index.css              # Tailwind + custom styles
    ├── index.html
    ├── vite.config.js
    ├── tailwind.config.js
    └── package.json
```

---

## 🚀 Local Setup

### Prerequisites
- Node.js v18+
- MongoDB (local or MongoDB Atlas)
- npm or yarn

---

### 1. Clone and navigate
```bash
cd fitness-platform
```

### 2. Backend Setup

```bash
cd backend
npm install
```

Edit `.env`:
```env
MONGO_URI=mongodb://localhost:27017/fitness-platform
JWT_SECRET=mysecret123
PORT=5000
```

> For MongoDB Atlas, replace MONGO_URI with your connection string.

**Seed demo data (optional but recommended):**
```bash
node seed.js
```

**Start backend:**
```bash
npm run dev       # development (nodemon)
npm start         # production
```

Backend runs at: `http://localhost:5000`

---

### 3. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Frontend runs at: `http://localhost:5173`

> Vite proxies `/api` → `http://localhost:5000` automatically.

---

## 🔐 Demo Credentials

| Role  | Email             | Password     |
|-------|-------------------|--------------|
| User  | user@demo.com     | password123  |
| Coach | coach@demo.com    | password123  |

---

## 📡 API Reference

### Auth
| Method | Endpoint         | Description     |
|--------|------------------|-----------------|
| POST   | /api/auth/signup | Register user   |
| POST   | /api/auth/login  | Login + JWT     |
| GET    | /api/auth/me     | Get current user|

### Workouts
| Method | Endpoint              | Description       |
|--------|-----------------------|-------------------|
| POST   | /api/workouts         | Log workout       |
| GET    | /api/workouts         | List workouts     |
| GET    | /api/workouts/stats   | Aggregated stats  |
| DELETE | /api/workouts/:id     | Delete workout    |

### Metrics
| Method | Endpoint              | Description       |
|--------|-----------------------|-------------------|
| GET    | /api/metrics          | Get metrics list  |
| GET    | /api/metrics/summary  | Aggregated metrics|

### Plans
| Method | Endpoint              | Description        |
|--------|-----------------------|--------------------|
| POST   | /api/plans/generate   | AI plan generation |
| GET    | /api/plans            | List plans         |
| DELETE | /api/plans/:id        | Delete plan        |

### Community
| Method | Endpoint                    | Description       |
|--------|-----------------------------|-------------------|
| GET    | /api/groups                 | All groups        |
| POST   | /api/groups                 | Create group      |
| POST   | /api/groups/:id/join        | Join group        |
| GET    | /api/challenges             | All challenges    |
| POST   | /api/challenges             | Create challenge  |
| POST   | /api/challenges/:id/join    | Join challenge    |
| POST   | /api/challenges/:id/progress| Update score      |

### Coach (coach role only)
| Method | Endpoint                          | Description      |
|--------|-----------------------------------|------------------|
| GET    | /api/coach/clients                | All users        |
| GET    | /api/coach/clients/:id            | Client details   |
| POST   | /api/coach/clients/:id/plans      | Assign plan      |
| GET    | /api/coach/stats                  | Dashboard stats  |

### Device
| Method | Endpoint          | Description          |
|--------|-------------------|----------------------|
| POST   | /api/device/sync  | Simulate device sync |
| GET    | /api/device/status| Connected devices    |

---

## 🏗️ Architecture

```
React (Vite) ──Axios──► Express (Node) ──Mongoose──► MongoDB
     ↑                        │
AuthContext               JWT Middleware
React Router              Coach Middleware
Recharts                  Error Handler
```

---

## ✨ Key Features

- **JWT Authentication** with role-based access (user / coach)
- **Workout Logging** — type, duration, calories, distance, notes
- **Auto-generated Metrics** — heart rate, cadence, steps, performance score
- **AI Recommendation Engine** — rule-based plans by fitness level + history
- **Simulated Device Sync** — realistic wearable data generation
- **Community Groups** — create, join, leave fitness groups
- **Challenges + Leaderboards** — real-time progress tracking from workouts
- **Coach Dashboard** — view all clients, their workouts, assign custom plans
- **Analytics** — line/area/bar/radar charts via Recharts
- **Responsive UI** — dark theme, Tailwind CSS, mobile-friendly sidebar

---

## 🔧 Tech Stack

| Layer    | Technology                          |
|----------|-------------------------------------|
| Frontend | React 18, Vite, Tailwind CSS, Recharts, Axios |
| Backend  | Node.js, Express.js, JWT, Bcrypt    |
| Database | MongoDB, Mongoose                   |
| Auth     | JWT + bcryptjs                      |

---

## 📦 Production Build

```bash
# Frontend
cd frontend && npm run build

# Serve with Express (add to server.js)
app.use(express.static(path.join(__dirname, '../frontend/dist')));
app.get('*', (req, res) => res.sendFile(path.join(__dirname, '../frontend/dist/index.html')));
```

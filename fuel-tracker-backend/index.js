const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

// Models Import
const FuelEntry = require('./models/FuelEntry');
const User = require('./models/User');
const Vehicle = require('./models/VehicleSelect');

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || "meraSecretKey123";

// --- CORS CONFIGURATION ---
// Localhost aur Live Server dono ko allow kiya hai
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:5500",
  "http://127.0.0.1:5500",
  "https://fuel-tracker-frontend.vercel.app"
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('CORS Policy Error: Origin not allowed'));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

app.use(express.json());

// --- DATABASE CONNECT ---
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected Successfully!"))
  .catch((err) => console.log("❌ DB Connection Error:", err));

// --- SECURITY MIDDLEWARE ---
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.startsWith('Bearer ')
    ? authHeader.split(' ')[1]
    : authHeader;

  if (!token) return res.status(401).json({ error: "Access Denied. Login Required." });

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: "Invalid or Expired Token" });
    req.user = user;
    next();
  });
};

// --- ROUTES ---

app.get('/', (req, res) => {
  res.send('FUEL TRACKER Backend is LIVE! 🚀');
});

// 1. REGISTER
app.post('/register', async (req, res) => {
    try {
        const { username, email, password } = req.body;
        
        // Validation
        if(!username || !email || !password) return res.status(400).json({ error: "All fields are required" });

        const existingUser = await User.findOne({ email: email.toLowerCase() });
        if (existingUser) return res.status(400).json({ error: "User with this email already exists" });

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({ username, email: email.toLowerCase(), password: hashedPassword });
        await newUser.save();

        res.status(201).json({ message: "User registered successfully!" });
    } catch (error) {
        res.status(500).json({ error: "Registration failed. Database error." });
    }
});

// 2. LOGIN
app.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email: email.toLowerCase() });

        if (!user) return res.status(400).json({ error: "User not found" });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ error: "Invalid password" });

        const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '7d' });
        res.status(200).json({ 
            token, 
            user: { id: user._id, username: user.username, email: user.email } 
        });
    } catch (error) {
        res.status(500).json({ error: "Login failed" });
    }
});

// --- VEHICLE MANAGEMENT ---

app.post('/vehicles/add', authenticateToken, async (req, res) => {
  try {
    const { name, type, maintenanceInterval } = req.body;
    let interval = maintenanceInterval;
    if (type === 'Bike') interval = 1000;
    else if (type === 'Car') interval = 5000;

    const newVehicle = new Vehicle({
      userId: req.user.id,
      name,
      type,
      maintenanceInterval: interval,
      oilLastOdo: 0
    });

    await newVehicle.save();
    res.status(201).json({ message: "Vehicle added successfully!", vehicle: newVehicle });
  } catch (error) {
    res.status(500).json({ error: "Failed to add vehicle" });
  }
});

app.get('/vehicles', authenticateToken, async (req, res) => {
  try {
    const vehicles = await Vehicle.find({ userId: req.user.id });
    res.status(200).json(vehicles);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch vehicles" });
  }
});

// --- FUEL ENTRIES ---

app.post('/add', authenticateToken, async (req, res) => {
  try {
    const { vehicleId } = req.body;
    if (!vehicleId) return res.status(400).json({ error: "Please select a vehicle" });

    const vehicle = await Vehicle.findOne({ _id: vehicleId, userId: req.user.id });
    if (!vehicle) return res.status(403).json({ error: "Unauthorized vehicle access" });

    const newEntry = new FuelEntry({ ...req.body, userId: req.user.id });
    await newEntry.save();
    res.status(201).json({ message: "Fuel entry saved!", data: newEntry });
  } catch (error) {
    res.status(500).json({ error: "Failed to save entry" });
  }
});

app.get('/history', authenticateToken, async (req, res) => {
  try {
    const { vehicleId } = req.query;
    const query = { userId: req.user.id };
    if (vehicleId) query.vehicleId = vehicleId;

    const entries = await FuelEntry.find(query).sort({ createdAt: -1 });
    res.status(200).json(entries);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch history" });
  }
});

// --- MAINTENANCE & DATA FIX ---

app.put('/maintenance/reset', authenticateToken, async (req, res) => {
  try {
    const { vehicleId, currentOdo } = req.body;
    const updated = await Vehicle.findOneAndUpdate(
      { _id: vehicleId, userId: req.user.id },
      { oilLastOdo: currentOdo },
      { new: true }
    );
    res.status(200).json({ message: "Maintenance reset successful!", vehicle: updated });
  } catch (error) {
    res.status(500).json({ error: "Reset failed" });
  }
});

app.put('/fix-my-data', authenticateToken, async (req, res) => {
    try {
        const BIKE_ID = "69665ec08c1e432e5912cbcd"; 
        const result = await FuelEntry.updateMany(
            { userId: req.user.id, vehicleId: { $exists: false } }, 
            { $set: { vehicleId: BIKE_ID } }
        );
        res.json({ message: "Cleanup complete!", count: result.modifiedCount });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// --- SERVER START ---
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`✅ Server is running on http://localhost:${PORT}`);
  });
}

module.exports = app;
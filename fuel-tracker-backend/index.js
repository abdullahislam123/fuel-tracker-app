const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

// Models Import
const FuelEntry = require('./models/FuelEntry');
const User = require('./models/User');
const Vehicle = require('./models/VehicleSelect'); // ⭐ Naya model import

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || "meraSecretKey123";

// --- CORS CONFIGURATION ---
const allowedOrigins = [
  "http://localhost:5173",
  "https://fuel-tracker-frontend.vercel.app"
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('CORS Policy: This origin is not allowed'));
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

  if (!token) return res.status(401).json({ error: "Access Denied" });

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: "Invalid Token" });
    req.user = user;
    next();
  });
};

// --- ROUTES ---

app.get('/', (req, res) => {
  res.send('FUEL TRACKER Backend is LIVE! 🚀');
});

// 1. REGISTER & 2. LOGIN (Logic same rakhi hai)
app.post('/register', async (req, res) => { /* ... existing logic ... */ });
app.post('/login', async (req, res) => { /* ... existing logic ... */ });

// --- ⭐ NEW: VEHICLE MANAGEMENT ROUTES ---

// A. ADD NEW VEHICLE (Bike/Car/Custom)
app.post('/vehicles/add', authenticateToken, async (req, res) => {
  try {
    const { name, type, maintenanceInterval } = req.body;

    // Bike: 1000km default, Car: 5000km default, Custom: User input
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

// B. GET ALL VEHICLES FOR LOGGED IN USER
app.get('/vehicles', authenticateToken, async (req, res) => {
  try {
    const vehicles = await Vehicle.find({ userId: req.user.id });
    res.status(200).json(vehicles);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch vehicles" });
  }
});

// --- ⭐ UPDATED: FUEL ENTRY WITH VEHICLE ID ---

// 3. ADD ENTRY (Improved with ownership check)
app.post('/add', authenticateToken, async (req, res) => {
  try {
    const { vehicleId } = req.body;
    if (!vehicleId) return res.status(400).json({ error: "Vehicle selection is required" });

    // ⭐ Check karein ke gaari usi user ki hai ya nahi
    const vehicle = await Vehicle.findOne({ _id: vehicleId, userId: req.user.id });
    if (!vehicle) {
      return res.status(403).json({ error: "Unauthorized: You do not own this vehicle" });
    }

    const newEntry = new FuelEntry({ ...req.body, userId: req.user.id });
    await newEntry.save();
    res.status(201).json({ message: "Entry Saved!", data: newEntry });
  } catch (error) {
    res.status(500).json({ error: "Save failed" });
  }
});


// 4. GET HISTORY (Ab vehicle filter ke sath)
app.get('/history', authenticateToken, async (req, res) => {
  try {
    const { vehicleId } = req.query; // Frontend se ?vehicleId=... bhejein
    const query = { userId: req.user.id };
    if (vehicleId) query.vehicleId = vehicleId;

    const entries = await FuelEntry.find(query).sort({ createdAt: -1 });
    res.status(200).json(entries);
  } catch (error) {
    res.status(500).json({ error: "Fetch failed" });
  }
});

// index.js mein is hisse ko update karein
app.put('/fix-my-data', authenticateToken, async (req, res) => {
    try {
        // ⭐ Yahan apni Bike ki ID paste karein (MongoDB Compass se copy karke)
        const BIKE_ID = "69665ec08c1e432e5912cbcd"; 

        const result = await FuelEntry.updateMany(
            { 
                userId: req.user.id, 
                vehicleId: { $exists: false } // Wo entries jin mein ID nahi hai
            }, 
            { 
                $set: { vehicleId: BIKE_ID } // Unhein Bike ke sath jorr do
            }
        );

        res.json({ message: "Success!", count: result.modifiedCount });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// --- ⭐ UPDATED: MAINTENANCE DATA PER VEHICLE ---

app.get('/maintenance', authenticateToken, async (req, res) => {
  try {
    const { vehicleId } = req.query;
    if (!vehicleId) return res.status(200).json([]);

    const vehicle = await Vehicle.findOne({ _id: vehicleId, userId: req.user.id });
    res.status(200).json(vehicle ? [vehicle] : []);
  } catch (error) {
    res.status(500).json({ error: "Maintenance fetch failed" });
  }
});

// RESET MAINTENANCE (Oil Change Update)
app.put('/maintenance/reset', authenticateToken, async (req, res) => {
  try {
    const { vehicleId, currentOdo } = req.body;
    await Vehicle.findOneAndUpdate(
      { _id: vehicleId, userId: req.user.id },
      { oilLastOdo: currentOdo }
    );
    res.status(200).json({ message: "Maintenance reset successful!" });
  } catch (error) {
    res.status(500).json({ error: "Reset failed" });
  }
});

// 5, 6, 7, 8 (UPDATE/DELETE/PROFILE logic same rakhi hai)

// --- SERVER START ---
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}
module.exports = app;
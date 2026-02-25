const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

// Models Import
const FuelEntry = require('./models/FuelEntry');
const User = require('./models/User');
const Vehicle = require('./models/VehicleSelect');

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || "meraSecretKey123";

// --- CORS CONFIGURATION (Standard and Robust) ---
const allowedOrigins = [
  "http://localhost:5173",
  "https://fuel-tracker-frontend.vercel.app"
];

const corsOptions = {
  origin: (origin, callback) => {
    // Log incoming origin for debugging in Vercel logs
    console.log("📍 Incoming Origin:", origin);

    if (!origin || allowedOrigins.includes(origin) || origin.includes("vercel.app") || origin.includes("localhost")) {
      callback(null, true);
    } else {
      console.log("❌ CORS Blocked Origin:", origin);
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With", "Accept", "Origin", "X-Api-Version"],
  optionsSuccessStatus: 200
};

// Enable CORS for all routes
app.use(cors(corsOptions));

// --- ⭐ MULTER CONFIGURATION (Image Storage) ---
const uploadDir = path.join(__dirname, 'uploads');
try {
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }
} catch (err) {
  console.log("⚠️ Upload folder creation skipped (Vercel)");
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }
});

app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// --- DATABASE CONNECT ---
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected Successfully!"))
  .catch((err) => console.log("❌ DB Connection Error:", err));

// --- SECURITY MIDDLEWARE ---
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  let token = authHeader && authHeader.startsWith('Bearer ')
    ? authHeader.split(' ')[1]
    : authHeader;

  if (token === "null" || token === "undefined") token = null;

  if (!token) {
    return res.status(401).json({ error: "Access Denied. Login Required." });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: "Invalid or Expired Token" });
    }
    req.user = user;
    next();
  });
};

// --- ROUTES ---

app.get('/', (req, res) => {
  res.send('FUEL TRACKER Backend is LIVE! 🚀');
});

// Diagnostic route for live debugging
app.get('/health-check', async (req, res) => {
  const dbStatus = mongoose.connection.readyState === 1 ? "Connected" : "Disconnected";
  res.json({
    status: "Healthy",
    database: dbStatus,
    timestamp: new Date().toISOString(),
    env_verified: !!process.env.MONGO_URI && !!process.env.JWT_SECRET
  });
});

app.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;
    if (!email || !password || !username) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const normalizedEmail = email.toLowerCase();
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(400).json({ error: "Email is already registered" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({
      username,
      email: normalizedEmail,
      password: hashedPassword
    });

    await newUser.save();
    res.status(201).json({ message: "User registered successfully!" });
  } catch (error) {
    console.error("REGISTER ERROR:", error);
    res.status(500).json({ error: "Registration failed. Please try again." });
  }
});

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

app.delete('/vehicles/:id', authenticateToken, async (req, res) => {
  try {
    const vehicleId = req.params.id;
    const userId = req.user.id;
    const entries = await FuelEntry.find({ vehicleId: vehicleId, userId: userId });
    for (const entry of entries) {
      if (entry.receiptImage) {
        const filePath = path.join(__dirname, entry.receiptImage);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      }
    }
    await FuelEntry.deleteMany({ vehicleId: vehicleId, userId: userId });
    await Vehicle.findOneAndDelete({ _id: vehicleId, userId: userId });
    res.json({ message: "Vehicle and history deleted successfully!" });
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

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
    console.error("GET VEHICLES ERROR:", error);
    res.status(500).json({ error: "Failed to fetch vehicles", details: error.message });
  }
});

app.post('/add', authenticateToken, upload.single('receiptImage'), async (req, res) => {
  try {
    const { vehicleId } = req.body;
    if (!vehicleId) return res.status(400).json({ error: "Please select a vehicle" });

    const vehicle = await Vehicle.findOne({ _id: vehicleId, userId: req.user.id });
    if (!vehicle) return res.status(403).json({ error: "Unauthorized vehicle access" });

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ error: "User not found" });

    const newEntry = new FuelEntry({
      ...req.body,
      userId: req.user.id,
      username: user.username,
      receiptImage: req.file ? `/uploads/${req.file.filename}` : null
    });

    await newEntry.save();
    res.status(201).json({ message: "Fuel entry saved!", data: newEntry });
  } catch (error) {
    console.error("ADD ENTRY ERROR:", error);
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
    console.error("GET HISTORY ERROR:", error);
    res.status(500).json({ error: "Failed to fetch history", details: error.message });
  }
});

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

app.put('/profile', authenticateToken, async (req, res) => {
  try {
    const { username, email, password } = req.body;
    const updateData = { username, email: email.toLowerCase() };

    if (password && password.trim() !== "") {
      const hashedPassword = await bcrypt.hash(password, 10);
      updateData.password = hashedPassword;
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      { $set: updateData },
      { new: true }
    ).select("-password");

    res.status(200).json({ message: "Profile Updated!", user: updatedUser });
  } catch (error) {
    res.status(500).json({ error: "Update failed in database" });
  }
});

app.delete('/profile', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const entries = await FuelEntry.find({ userId: userId });
    for (const entry of entries) {
      if (entry.receiptImage) {
        const filePath = path.join(__dirname, entry.receiptImage);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      }
    }
    await Vehicle.deleteMany({ userId: userId });
    await FuelEntry.deleteMany({ userId: userId });
    await User.findByIdAndDelete(userId);

    res.status(200).json({ message: "Account deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Account deletion failed" });
  }
});

app.delete('/delete/:id', authenticateToken, async (req, res) => {
  try {
    const entryId = req.params.id;
    const userId = req.user.id;
    const entry = await FuelEntry.findOne({ _id: entryId, userId: userId });
    if (!entry) return res.status(404).json({ error: "Entry not found" });

    if (entry.receiptImage) {
      const filePath = path.join(__dirname, entry.receiptImage);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    await FuelEntry.findByIdAndDelete(entryId);
    res.json({ message: "Entry deleted successfully!" });
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.put('/update/:id', authenticateToken, upload.single('receiptImage'), async (req, res) => {
  try {
    const entryId = req.params.id;
    const userId = req.user.id;
    const { odometer, liters, pricePerLiter, cost, removeImage } = req.body;

    const updateData = { odometer, liters, pricePerLiter, cost };

    const entry = await FuelEntry.findOne({ _id: entryId, userId: userId });
    if (!entry) return res.status(404).json({ error: "Entry not found" });

    if (req.file || removeImage === 'true') {
      if (entry.receiptImage) {
        const oldPath = path.join(__dirname, entry.receiptImage);
        if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
      }
      updateData.receiptImage = req.file ? `/uploads/${req.file.filename}` : null;
    }

    const updatedEntry = await FuelEntry.findOneAndUpdate(
      { _id: entryId, userId: userId },
      { $set: updateData },
      { new: true }
    );

    res.status(200).json({ message: "Entry updated!", data: updatedEntry });
  } catch (error) {
    res.status(500).json({ error: "Failed to update entry" });
  }
});

// --- GLOBAL ERROR HANDLER ---
app.use((err, req, res, next) => {
  console.error("❌ GLOBAL ERROR CAUGHT:", err);
  // Ensure CORS headers even on errors
  const origin = req.headers.origin;
  if (origin) res.setHeader('Access-Control-Allow-Origin', origin);
  res.status(500).json({ error: "Something went wrong on the server!" });
});

// --- SERVER START ---
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`✅ Server is running on http://localhost:${PORT}`);
  });
}

module.exports = app;
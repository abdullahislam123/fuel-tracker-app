const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const multer = require('multer'); // ⭐ Naya: Files ke liye
const path = require('path'); // ⭐ Naya: Paths ke liye
const fs = require('fs'); // ⭐ Naya: Folder banane ke liye
require('dotenv').config();

// Models Import
const FuelEntry = require('./models/FuelEntry');
const User = require('./models/User');
const Vehicle = require('./models/VehicleSelect');

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || "meraSecretKey123";

// --- ⭐ MULTER CONFIGURATION (Image Storage) ---
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir); // Agar 'uploads' folder nahi hai to bana do
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    // File ka naam unique banane ke liye timestamp add karna
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 } // Limit: 5MB
});

// --- CORS CONFIGURATION ---
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:5500",
  "http://127.0.0.1:5500",
  "https://fuel-tracker-frontend.vercel.app"
];

app.use(cors({
  origin: (origin, callback) => {
    // Allows localhost and any Vercel deployment of this project
    if (!origin || allowedOrigins.includes(origin) || origin.endsWith("vercel.app")) {
      callback(null, true);
    } else {
      callback(null, false);
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"]
}));

// Handle preflight requests for all routes
app.options('*', cors());

app.use(express.json());
// ⭐ Naya: Uploads folder ko static banayein taake frontend se images access ho sakein
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// --- DATABASE CONNECT ---
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected Successfully!"))
  .catch((err) => console.log("❌ DB Connection Error:", err));

// --- SECURITY MIDDLEWARE ---
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  console.log("Auth Header Received:", authHeader);

  let token = authHeader && authHeader.startsWith('Bearer ')
    ? authHeader.split(' ')[1]
    : authHeader;

  if (token === "null" || token === "undefined") token = null;

  if (!token) {
    console.log("No token found in request.");
    return res.status(401).json({ error: "Access Denied. Login Required." });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      console.log("JWT Verification Error:", err.message);
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

// 1. REGISTER & LOGIN (Pehle wala code same rahega...)
app.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;
    if (!email) return res.status(400).json({ error: "Email is missing" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({
      username,
      email: email.toLowerCase(),
      password: hashedPassword
    });

    await newUser.save();
    res.status(201).json({ message: "User registered successfully!" });
  } catch (error) {
    console.error("REGISTER ERROR:", error);
    res.status(500).json({ error: "Registration failed." });
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

// --- VEHICLE MANAGEMENT ---

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

    const deletedVehicle = await Vehicle.findOneAndDelete({ _id: vehicleId, userId: userId });
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
    res.status(500).json({ error: "Failed to fetch vehicles" });
  }
});

// --- ⭐ FUEL ENTRIES (Image Support Add Ki Hai) ---

app.post('/add', authenticateToken, upload.single('receiptImage'), async (req, res) => {
  try {
    const { vehicleId } = req.body;
    if (!vehicleId) return res.status(400).json({ error: "Please select a vehicle" });

    const vehicle = await Vehicle.findOne({ _id: vehicleId, userId: req.user.id });
    if (!vehicle) return res.status(403).json({ error: "Unauthorized vehicle access" });

    // ⭐ Fetch username dynamically since it's now required in the model
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ error: "User not found" });

    // FormData se aane wala data hamesha string hota hai, isliye hum req.body use karenge
    const newEntry = new FuelEntry({
      ...req.body,
      userId: req.user.id,
      username: user.username, // Set username from the user document
      receiptImage: req.file ? `/uploads/${req.file.filename}` : null // Image path save karein
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
    res.status(500).json({ error: "Failed to fetch history" });
  }
});

// --- MAINTENANCE & PROFILE ---

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
    // Delete the user themselves
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

    // File delete karein agar mojood hai
    if (entry.receiptImage) {
      const filePath = path.join(__dirname, entry.receiptImage);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    await FuelEntry.findByIdAndDelete(entryId);
    res.json({ message: "Entry and image deleted successfully!" });
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.put('/update/:id', authenticateToken, upload.single('receiptImage'), async (req, res) => {
  try {
    const entryId = req.params.id;
    const userId = req.user.id;
    const { odometer, liters, pricePerLiter, cost, removeImage } = req.body;

    const updateData = {
      odometer,
      liters,
      pricePerLiter,
      cost
    };

    const entry = await FuelEntry.findOne({ _id: entryId, userId: userId });
    if (!entry) return res.status(404).json({ error: "Entry not found" });

    if (req.file || removeImage === 'true') {
      // Purani file delete karein
      if (entry.receiptImage) {
        const oldPath = path.join(__dirname, entry.receiptImage);
        if (fs.existsSync(oldPath)) {
          fs.unlinkSync(oldPath);
        }
      }

      if (req.file) {
        updateData.receiptImage = `/uploads/${req.file.filename}`;
      } else {
        updateData.receiptImage = null;
      }
    }

    const updatedEntry = await FuelEntry.findOneAndUpdate(
      { _id: entryId, userId: userId },
      { $set: updateData },
      { new: true }
    );

    if (!updatedEntry) return res.status(404).json({ error: "Entry not found" });
    res.status(200).json({ message: "Entry updated!", data: updatedEntry });
  } catch (error) {
    console.error("UPDATE ENTRY ERROR:", error);
    res.status(500).json({ error: "Failed to update entry" });
  }
});

// --- GLOBAL ERROR HANDLER ---
app.use((err, req, res, next) => {
  console.error("❌ GLOBAL ERROR CAUGHT:", err);
  res.status(500).json({ error: "Something went wrong on the server!" });
});

// --- SERVER START ---
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`✅ Server is running on http://localhost:${PORT}`);
  });
}

module.exports = app;
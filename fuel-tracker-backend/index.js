const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

// Models Import
const FuelEntry = require('./models/FuelEntry');
const User = require('./models/User');

const app = express();
const PORT = process.env.PORT || 5000;
// ⭐ Environment variable use karein, fallback ke sath
const JWT_SECRET = process.env.JWT_SECRET || "meraSecretKey123"; 

// --- ⭐ CORS DEEP FIX (Handles Local & Live) ---
const allowedOrigins = [
  "http://localhost:5173",              // Alternative Local
  "https://fuel-tracker-frontend.vercel.app"    // Live Production URL
];

app.use(cors({
  origin: (origin, callback) => {
    // !origin handles Postman; allowedOrigins handles Browsers
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

// --- ⭐ SECURITY MIDDLEWARE (Bearer Token Fix) ---
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  // Agar frontend "Bearer <token>" bhejta hai to usay clean karein
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

// --- ROUTES (Your original logic, untouched) ---

app.get('/', (req, res) => {
  res.send('FUEL TRACKER Backend is LIVE! 🚀');
});

// 1. REGISTER
app.post('/register', async (req, res) => {
  try {
    const { username, password } = req.body;
    const email = req.body.email ? req.body.email.toLowerCase().trim() : "";
    if (!email) return res.status(400).json({ error: "Email is required" });

    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ error: "Email already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ username, email, password: hashedPassword });
    await newUser.save();

    res.status(201).json({ message: "User registered successfully!" });
  } catch (error) {
    res.status(500).json({ error: "Register failed" });
  }
});

// 2. LOGIN
app.post('/login', async (req, res) => {
  try {
    const { password } = req.body;
    const email = req.body.email ? req.body.email.toLowerCase().trim() : "";

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ error: "User not found" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ error: "Invalid credentials" });

    const token = jwt.sign({ id: user._id }, JWT_SECRET);
    res.json({ token, username: user.username, email: user.email, userId: user._id });
  } catch (error) {
    res.status(500).json({ error: "Login failed" });
  }
});

// 3. ADD ENTRY
app.post('/add', authenticateToken, async (req, res) => {
  try {
    const newEntry = new FuelEntry({ ...req.body, userId: req.user.id });
    await newEntry.save();
    res.status(201).json({ message: "Entry Saved!", data: newEntry });
  } catch (error) {
    res.status(500).json({ error: "Save failed" });
  }
});

// 4. GET HISTORY
app.get('/history', authenticateToken, async (req, res) => {
  try {
    const entries = await FuelEntry.find({ userId: req.user.id }).sort({ createdAt: -1 });
    res.status(200).json(entries);
  } catch (error) {
    res.status(500).json({ error: "Fetch failed" });
  }
});

// 5. UPDATE ENTRY
app.put('/update/:id', authenticateToken, async (req, res) => {
  try {
    const updatedEntry = await FuelEntry.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id }, req.body, { new: true }
    );
    if (!updatedEntry) return res.status(404).json({ error: "Entry not found" });
    res.json({ message: "Updated successfully", data: updatedEntry });
  } catch (error) {
    res.status(500).json({ error: "Update failed" });
  }
});

// 6. DELETE ENTRY
app.delete('/delete/:id', authenticateToken, async (req, res) => {
  try {
    const deletedEntry = await FuelEntry.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
    if (!deletedEntry) return res.status(404).json({ error: "Entry not found" });
    res.status(200).json({ message: "Deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Delete failed" });
  }
});

// 7. UPDATE PROFILE
app.put('/profile', authenticateToken, async (req, res) => {
  try {
    const { username, password } = req.body;
    const email = req.body.email ? req.body.email.toLowerCase().trim() : null;
    const userId = req.user.id;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: "User not found" });

    if (email && email !== user.email) {
      const existingUser = await User.findOne({ email });
      if (existingUser) return res.status(400).json({ error: "Email already taken" });
      user.email = email;
    }

    if (username) user.username = username;
    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      user.password = hashedPassword;
    }
    await user.save();
    res.json({ message: "Profile Updated!", user: { username: user.username, email: user.email } });
  } catch (error) {
    res.status(500).json({ error: "Update failed" });
  }
});

// 8. DELETE ACCOUNT
app.delete('/profile', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.id;
        await FuelEntry.deleteMany({ userId: userId });
        await User.findByIdAndDelete(userId);
        res.status(200).json({ message: "Account deleted successfully." });
    } catch (error) {
        res.status(500).json({ error: "Account deletion failed" });
    }
});

// --- SERVER START ---
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}
module.exports = app;
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

// Models Import
const FuelEntry = require('./models/FuelEntry');
const User = require('./models/User');

// ⭐ WebAuthn Library Imports
const {
  generateRegistrationOptions,
  verifyRegistrationResponse,
  generateAuthenticationOptions,
  verifyAuthenticationResponse,
} = require('@simplewebauthn/server');

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = "meraSecretKey123";

// ⭐ WebAuthn Configuration
const rpID = process.env.RP_ID || 'localhost';
const origin = process.env.RP_ORIGIN || 'http://localhost:3000';

// Middleware
app.use(cors({
    origin: origin,
    credentials: true
}));
app.use(express.json());

// --- DATABASE CONNECT ---
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected Successfully!"))
  .catch((err) => console.log("❌ DB Connection Error:", err));

// --- SECURITY MIDDLEWARE ---
const authenticateToken = (req, res, next) => {
  const token = req.headers['authorization'];
  if (!token) return res.status(401).json({ error: "Access Denied" });

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: "Invalid Token" });
    req.user = user;
    next();
  });
};

// --- ROUTES ---

app.get('/', (req, res) => {
  res.send('Fuel Tracker Backend is LIVE with Auth & Biometrics! 🔐');
});

// 1. REGISTER
app.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;
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
    const { email, password } = req.body;
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

// ======================================================
// ⭐ BIOMETRIC / WEBAUTHN ROUTES (FIXED & SAFE 🛡️)
// ======================================================

// A. REGISTER FINGERPRINT (Challenge)
app.get('/auth/register-challenge', authenticateToken, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ error: 'User not found' });

        const userAuthenticators = user.authenticators || [];

        const options = await generateRegistrationOptions({
            rpName: 'Fuel Tracker App',
            rpID: rpID,
            userID: new Uint8Array(Buffer.from(user._id.toString())),
            userName: user.email,
            // ⭐ SAFE FILTER: Invalid data remove kiya
            excludeCredentials: userAuthenticators
                .filter(auth => auth.credentialID) 
                .map(authenticator => ({
                    id: authenticator.credentialID,
                    type: 'public-key',
                    transports: authenticator.transports,
                })),
            authenticatorSelection: {
                residentKey: 'preferred',
                userVerification: 'preferred',
                authenticatorAttachment: 'platform',
            },
        });

        user.currentChallenge = options.challenge;
        await user.save();

        res.json(options);
    } catch (error) {
        console.error("Reg Challenge Error:", error);
        res.status(500).json({ error: 'Server error', details: error.message });
    }
});

// B. REGISTER FINGERPRINT (Verify)
app.post('/auth/register-verify', authenticateToken, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ error: 'User not found' });

        const { body } = req;

        const verification = await verifyRegistrationResponse({
            response: body,
            expectedChallenge: user.currentChallenge,
            expectedOrigin: origin,
            expectedRPID: rpID,
        });

        if (verification.verified) {
            const { registrationInfo } = verification;
            
            const newAuthenticator = {
                credentialID: registrationInfo.credentialID,
                credentialPublicKey: registrationInfo.credentialPublicKey,
                counter: registrationInfo.counter,
                transports: body.response.transports,
            };

            if (!user.authenticators) user.authenticators = [];
            user.authenticators.push(newAuthenticator);
            
            user.currentChallenge = undefined; 
            await user.save();

            res.json({ verified: true });
        } else {
            res.status(400).json({ verified: false, error: 'Verification failed' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error during verification' });
    }
});

// C. LOGIN FINGERPRINT (Challenge) - ⚠️ ISME FIX KIYA HAI
app.post('/auth/login-challenge', async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ email });
        
        if (!user || !user.authenticators || user.authenticators.length === 0) {
            return res.status(400).json({ error: 'User not found or no biometrics registered' });
        }

        // ⭐ SAFE FILTER: Login ke waqt bhi check karo ke ID maujood hai
        const safeAuthenticators = user.authenticators.filter(auth => auth.credentialID);

        const options = await generateAuthenticationOptions({
            rpID: rpID,
            // ⭐ Yahan pehle crash ho raha tha, ab safe hai
            allowCredentials: safeAuthenticators.map(authenticator => ({
                id: authenticator.credentialID,
                type: 'public-key',
                transports: authenticator.transports,
            })),
            userVerification: 'preferred',
        });

        user.currentChallenge = options.challenge;
        await user.save();

        res.json(options);
    } catch (error) {
        console.error("Login Challenge Error:", error);
        res.status(500).json({ error: 'Could not generate login challenge', details: error.message });
    }
});

// D. LOGIN FINGERPRINT (Verify)
app.post('/auth/login-verify', async (req, res) => {
    try {
        const { email, body } = req.body;
        const user = await User.findOne({ email });

        if (!user) return res.status(404).json({ error: 'User not found' });

        // Safe Find
        const authenticator = (user.authenticators || []).find(
            auth => auth.credentialID === body.id
        );

        if (!authenticator) {
            return res.status(400).json({ error: 'Authenticator not found' });
        }

        const verification = await verifyAuthenticationResponse({
            response: body,
            expectedChallenge: user.currentChallenge,
            expectedOrigin: origin,
            expectedRPID: rpID,
            authenticator: {
                credentialID: authenticator.credentialID,
                credentialPublicKey: authenticator.credentialPublicKey,
                counter: authenticator.counter,
            },
        });

        if (verification.verified) {
            const { authenticationInfo } = verification;
            
            authenticator.counter = authenticationInfo.newCounter;
            user.currentChallenge = undefined;
            await user.save();

            const token = jwt.sign({ id: user._id }, JWT_SECRET);
            
            res.json({ verified: true, token, username: user.username, email: user.email, userId: user._id });
        } else {
            res.status(400).json({ verified: false, error: 'Biometric verification failed' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error during login verification' });
    }
});

// ======================================================

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
      { _id: req.params.id, userId: req.user.id }, 
      req.body,
      { new: true }
    );
    if (!updatedEntry) return res.status(404).json({ error: "Entry not found or unauthorized" });
    res.json({ message: "Updated successfully", data: updatedEntry });
  } catch (error) {
    res.status(500).json({ error: "Update failed" });
  }
});

// 6. DELETE ENTRY
app.delete('/delete/:id', authenticateToken, async (req, res) => {
  try {
    const deletedEntry = await FuelEntry.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
    if (!deletedEntry) return res.status(404).json({ error: "Entry not found or unauthorized" });
    res.status(200).json({ message: "Deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Delete failed" });
  }
});

// 7. UPDATE PROFILE
app.put('/profile', authenticateToken, async (req, res) => {
  try {
    const { username, email, password } = req.body;
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
    res.json({ message: "Profile Updated Successfully!", user: { username: user.username, email: user.email } });
  } catch (error) {
    res.status(500).json({ error: "Update failed" });
  }
});

// 8. DELETE ACCOUNT
app.delete('/profile', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.id;
        await FuelEntry.deleteMany({ userId: userId });
        const deletedUser = await User.findByIdAndDelete(userId);
        if (!deletedUser) return res.status(404).json({ error: "User not found" });
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
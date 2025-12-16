const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  
  // 👇 WebAuthn (Fingerprint) ke liye zaroori fields
  currentChallenge: { type: String },

  authenticators: [{
    credentialID: { type: String },
    credentialPublicKey: { type: String },
    counter: { type: Number },
    transports: [{ type: String }]
  }]
  
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  
  // 👇 YE DO NAYI FIELDS ADD KAREIN 👇
  
  // 1. Temporary Challenge store karne ke liye (Login/Register ke waqt)
  currentChallenge: { type: String },

  // 2. Fingerprint Data store karne ke liye
  authenticators: [{
    credentialID: { type: String },
    credentialPublicKey: { type: String },
    counter: { type: Number },
    transports: [{ type: String }]
  }]
  
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
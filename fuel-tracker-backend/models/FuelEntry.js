const mongoose = require('mongoose');

const FuelEntrySchema = new mongoose.Schema({
  userId: { type: String, required: true }, // <--- YE NAYA HAI (User ID store karega)
  date: { type: String, required: true },
  time: { type: String, required: true },
  liters: { type: Number, required: true },
  pricePerLiter: { type: Number, required: true },
  cost: { type: Number, required: true },
  odometer: { type: Number },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('FuelEntry', FuelEntrySchema);
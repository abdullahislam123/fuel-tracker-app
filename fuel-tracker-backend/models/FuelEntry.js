const mongoose = require('mongoose');

const FuelEntrySchema = new mongoose.Schema({
  // 1. Ab entries user ke bajaye vehicle se link honi chahiye
  vehicleId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Vehicle', 
    required: true 
  },
  userId: { type: String, required: true }, 
  date: { type: String, required: true },
  time: { type: String, required: true },
  liters: { type: Number, required: true },
  pricePerLiter: { type: Number, required: true },
  cost: { type: Number, required: true },
  odometer: { type: Number, required: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('FuelEntry', FuelEntrySchema);
const mongoose = require('mongoose');

const VehicleSchema = new mongoose.Schema({
  // ⭐ Owner of the vehicle
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  // ⭐ Vehicle Name
  name: {
    type: String,
    required: true,
    trim: true // Faltu spaces khatam karne ke liye
  },
  // ⭐ Type: Bike, Car, Custom
  type: {
    type: String,
    enum: ['Bike', 'Car', 'Custom'],
    default: 'Bike'
  },
  // ⭐ Gap (KM)
  maintenanceInterval: {
    type: Number,
    required: true
  },
  // ⭐ Last oil change odometer reading
  oilLastOdo: {
    type: Number,
    default: 0
  },
  // ⭐ Tire Change tracking
  tireLastOdo: { type: Number, default: 0 },
  tireInterval: { type: Number, default: 40000 },

  // ⭐ Air Filter tracking
  filterLastOdo: { type: Number, default: 0 },
  filterInterval: { type: Number, default: 10000 },

  // ⭐ Spark Plug tracking
  plugLastOdo: { type: Number, default: 0 },
  plugInterval: { type: Number, default: 20000 }
}, {
  // ⭐ Ye automatically 'createdAt' aur 'updatedAt' fields add kar dega
  timestamps: true
});

module.exports = mongoose.model('Vehicle', VehicleSchema);
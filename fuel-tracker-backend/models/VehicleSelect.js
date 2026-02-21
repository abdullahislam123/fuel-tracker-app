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
  }
}, { 
  // ⭐ Ye automatically 'createdAt' aur 'updatedAt' fields add kar dega
  timestamps: true 
});

module.exports = mongoose.model('Vehicle', VehicleSchema);
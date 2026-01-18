const mongoose = require('mongoose');

const VehicleSchema = new mongoose.Schema({
  // ⭐ Is gaari ka malik kaun hai (User ID)
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  // ⭐ Gaari ka naam (e.g., "My Honda 70" ya "Family Car")
  name: { 
    type: String, 
    required: true 
  },
  // ⭐ Type: Bike, Car, ya Custom
  type: { 
    type: String, 
    enum: ['Bike', 'Car', 'Custom'], 
    default: 'Bike' 
  },
  // ⭐ Maintenance Gap (Bike: 1000km, Car: 5000km, Custom: User defined)
  maintenanceInterval: { 
    type: Number, 
    required: true 
  },
  // ⭐ Aakhri dafa oil kab change hua (Odometer reading)
  oilLastOdo: { 
    type: Number, 
    default: 0 
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  }
});

module.exports = mongoose.model('Vehicle', VehicleSchema);
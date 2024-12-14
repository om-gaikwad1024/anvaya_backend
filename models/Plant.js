const mongoose = require('mongoose');

const PlantSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  scientificName: {
    type: String,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  ayushSystem: {
    type: String,
    enum: ['Ayurveda', 'Unani', 'Siddha', 'Homeopathy']
  },
  modelPath: {
    type: String,
    required: true
  },
  medicalUses: [String],
  properties: {
    type: Object
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Plant', PlantSchema);
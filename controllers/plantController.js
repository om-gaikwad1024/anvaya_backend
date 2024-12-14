// controllers/plantController.js
const Plant = require('../models/Plant');
const cloudinary = require('cloudinary').v2;

exports.getAllPlants = async (req, res) => {
  try {
    const plants = await Plant.find();
    res.json(plants);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching plants', error: error.message });
  }
};

exports.addPlant = async (req, res) => {
  try {
    const { 
      name, 
      scientificName, 
      description, 
      ayushSystem, 
      medicalUses, 
      properties 
    } = req.body;

    // Upload image to Cloudinary if exists
    let modelPath = '';
    if (req.file) {
      const uploadResult = await new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          { resource_type: 'image' },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        );
        uploadStream.end(req.file.buffer);
      });
      
      modelPath = uploadResult.secure_url;
    }

    // Parse medical uses and properties
    const parsedMedicalUses = JSON.parse(medicalUses || '[]');
    const parsedProperties = JSON.parse(properties || '{}');

    // Create new plant
    const newPlant = new Plant({
      name,
      scientificName,
      description,
      ayushSystem,
      modelPath,
      medicalUses: parsedMedicalUses,
      properties: parsedProperties
    });

    await newPlant.save();

    res.status(201).json(newPlant);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.updatePlant = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body };

    // Handle image upload if new image is provided
    if (req.file) {
      const uploadResult = await new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          { resource_type: 'image' },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        );
        uploadStream.end(req.file.buffer);
      });
      
      updateData.modelPath = uploadResult.secure_url;
    }

    // Parse medical uses and properties if they exist
    if (updateData.medicalUses) {
      updateData.medicalUses = JSON.parse(updateData.medicalUses);
    }
    if (updateData.properties) {
      updateData.properties = JSON.parse(updateData.properties);
    }

    const updatedPlant = await Plant.findByIdAndUpdate(
      id, 
      updateData, 
      { new: true, runValidators: true }
    );

    if (!updatedPlant) {
      return res.status(404).json({ message: 'Plant not found' });
    }

    res.json(updatedPlant);
  } catch (error) {
    res.status(500).json({ message: 'Error updating plant', error: error.message });
  }
};

exports.deletePlant = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedPlant = await Plant.findByIdAndDelete(id);

    if (!deletedPlant) {
      return res.status(404).json({ message: 'Plant not found' });
    }

    // Optionally delete the image from Cloudinary if you want to manage cloud storage
    if (deletedPlant.modelPath) {
      try {
        const publicId = deletedPlant.modelPath.split('/').pop().split('.')[0];
        await cloudinary.uploader.destroy(publicId);
      } catch (cloudinaryError) {
        console.warn('Could not delete image from Cloudinary', cloudinaryError);
      }
    }

    res.json({ message: 'Plant deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting plant', error: error.message });
  }
};
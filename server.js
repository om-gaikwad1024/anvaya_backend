const express = require('express');
const cors = require('cors');
const connectDB = require('./config/database');
require('dotenv').config();
const multer = require('multer');
const cloudinary = require('cloudinary').v2;

const app = express();

// Connect Database
connectDB();

// Cloudinary Configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Multer configuration for file upload
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB file size limit
  }
});

// Routes
app.use('/api/users', require('./routes/authRoutes'));

// Plant Routes
const plantController = require('./controllers/plantController');
app.get('/api/plants', plantController.getAllPlants);
app.post('/api/plants/add', upload.single('image'), plantController.addPlant);
app.put('/api/plants/:id', upload.single('image'), plantController.updatePlant);
app.delete('/api/plants/:id', plantController.deletePlant);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'production' ? {} : err.message
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
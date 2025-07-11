import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import multer from 'multer';
import path from 'path';
import Doctor from './models/DoctorSchema.js';
import User from './models/UserSchema.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));

// MongoDB connection
mongoose.connect('mongodb://127.0.0.1:27017/appointment_booking', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Multer setup for image upload
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});
const upload = multer({ storage });

// Routes
// Get all doctors (with pagination)
app.get('/api/doctors', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 4;
    const skip = (page - 1) * limit;
    const total = await Doctor.countDocuments();
    const doctors = await Doctor.find().skip(skip).limit(limit);
    res.json({
      doctors,
      total,
      page,
      totalPages: Math.ceil(total / limit)
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add a new doctor
app.post('/api/doctors', upload.single('photo'), async (req, res) => {
  try {
    const { name, email, password, phone, ticketPrice, role, specialization, qualifications, experiences, bio, about, timeSlots, featured } = req.body;
    const photo = req.file ? `/uploads/${req.file.filename}` : '';
    const newDoctor = new Doctor({
      name,
      email,
      password,
      phone,
      photo,
      ticketPrice,
      role,
      specialization,
      qualifications: qualifications ? JSON.parse(qualifications) : [],
      experiences: experiences ? JSON.parse(experiences) : [],
      bio,
      about,
      timeSlots: timeSlots ? JSON.parse(timeSlots) : [],
      featured: featured === 'true' || featured === true,
    });
    await newDoctor.save();
    res.status(201).json(newDoctor);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Get doctor by ID
app.get('/api/doctors/:id', async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.id);
    if (!doctor) return res.status(404).json({ error: 'Doctor not found' });
    res.json(doctor);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Update a doctor
app.put('/api/doctors/:id', upload.single('photo'), async (req, res) => {
  try {
    const updateData = { ...req.body };
    if (req.file) {
      updateData.photo = `/uploads/${req.file.filename}`;
    }
    if (updateData.qualifications) updateData.qualifications = JSON.parse(updateData.qualifications);
    if (updateData.experiences) updateData.experiences = JSON.parse(updateData.experiences);
    if (updateData.timeSlots) updateData.timeSlots = JSON.parse(updateData.timeSlots);
    const doctor = await Doctor.findByIdAndUpdate(req.params.id, updateData, { new: true });
    res.json(doctor);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Delete a doctor
app.delete('/api/doctors/:id', async (req, res) => {
  try {
    await Doctor.findByIdAndDelete(req.params.id);
    res.json({ message: 'Doctor deleted' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.post('/api/auth/signup', async (req, res) => {
  try {
    const { name, email, password, phone, gender, role } = req.body;
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      phone,
      gender,
      role: role || 'patient',
    });
    await newUser.save();
    res.status(201).json({ message: 'User registered successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ error: 'Invalid email or password' });
    }
    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: 'Invalid email or password' });
    }
    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id, email: user.email, role: user.role },
      'your_jwt_secret', // Replace with process.env.JWT_SECRET in production
      { expiresIn: '7d' }
    );
    // Return token and user info (excluding password)
    const { password: _, ...userData } = user._doc;
    res.json({ token, user: userData });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 
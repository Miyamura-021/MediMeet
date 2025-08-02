import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import multer from 'multer';
import path from 'path';
import Doctor from './models/DoctorSchema.js';
import User from './models/UserSchema.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import Booking from './models/BookingSchema.js';

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

// Predefined time slots
const TIME_SLOTS = ['9-10am', '10-11am', '11-12am', '12-1pm', '1-2pm', '2-3pm', '3-4pm', '4-5pm'];

// Routes
// Get all doctors (with pagination)
app.get('/api/doctors', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 4;
    const skip = (page - 1) * limit;
    const featured = req.query.featured === 'true';
    
    let filter = {};
    if (featured) {
      filter.featured = true;
    }
    
    const total = await Doctor.countDocuments(filter);
    const doctors = await Doctor.find(filter).skip(skip).limit(limit);
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
    console.log('PUT /api/doctors/:id - Body:', req.body);
    const updateData = { ...req.body };
    if (req.file) {
      updateData.photo = `/uploads/${req.file.filename}`;
    }
    if (updateData.qualifications) updateData.qualifications = JSON.parse(updateData.qualifications);
    if (updateData.experiences) updateData.experiences = JSON.parse(updateData.experiences);
    if (updateData.timeSlots) updateData.timeSlots = JSON.parse(updateData.timeSlots);
    if (updateData.featured !== undefined) {
      console.log('Featured field received:', updateData.featured, 'Type:', typeof updateData.featured);
      updateData.featured = updateData.featured === 'true' || updateData.featured === true;
      console.log('Featured field processed:', updateData.featured);
    }
    console.log('Final update data:', updateData);
    const doctor = await Doctor.findByIdAndUpdate(req.params.id, updateData, { new: true });
    console.log('Updated doctor featured status:', doctor.featured);
    res.json(doctor);
  } catch (err) {
    console.error('Error in PUT /api/doctors/:id:', err);
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
    const { name, email, password, phone, gender } = req.body;
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
      role: 'patient',
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

// Create a booking (with or without doctor)
app.post('/api/bookings', async (req, res) => {
  try {
    const { user, doctor, specialty, appointmentDate, timeSlot } = req.body;
    let assignedDoctor = doctor;
    // If no doctor, auto-assign by specialty and slot
    if (!assignedDoctor && specialty) {
      // Find all doctors in the specialty
      const doctors = await Doctor.find({ specialization: specialty });
      // Find a doctor with the slot available
      for (const doc of doctors) {
        const exists = await Booking.findOne({ doctor: doc._id, appointmentDate, timeSlot });
        if (!exists) {
          assignedDoctor = doc._id;
          break;
        }
      }
      if (!assignedDoctor) {
        return res.status(400).json({ error: 'No available doctor for this slot' });
      }
    }
    // Check if slot is already booked for this doctor
    const alreadyBooked = await Booking.findOne({ doctor: assignedDoctor, appointmentDate, timeSlot });
    if (alreadyBooked) {
      return res.status(400).json({ error: 'Slot already booked' });
    }
    // Get ticket price from doctor
    const docObj = await Doctor.findById(assignedDoctor);
    const ticketPrice = docObj ? docObj.ticketPrice : '0';
    const booking = new Booking({
      user,
      doctor: assignedDoctor,
      specialty,
      appointmentDate,
      timeSlot,
      ticketPrice,
      status: 'pending',
      isPaid: false,
    });
    await booking.save();
    res.status(201).json(booking);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Get available slots for a doctor or specialty on a date
app.get('/api/bookings/slots', async (req, res) => {
  try {
    const { doctor, specialty, appointmentDate } = req.query;
    let doctors = [];
    if (doctor) {
      doctors = [await Doctor.findById(doctor)];
    } else if (specialty) {
      doctors = await Doctor.find({ specialization: specialty });
    }
    if (!doctors.length) return res.json({ slots: [] });
    // Find all bookings for these doctors on the date
    const bookings = await Booking.find({
      doctor: { $in: doctors.map(d => d._id) },
      appointmentDate: new Date(appointmentDate),
    });
    // For each slot, check if at least one doctor is available
    const slots = TIME_SLOTS.map(slot => {
      const booked = doctors.every(doc => bookings.some(b => b.doctor.equals(doc._id) && b.timeSlot === slot));
      return { slot, available: !booked };
    });
    res.json({ slots });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// List bookings (admin: all, doctor: their, patient: their)
app.get('/api/bookings', async (req, res) => {
  try {
    const { userId, role, doctorId } = req.query;
    let filter = {};
    if (role === 'admin') {
      // all bookings
    } else if (role === 'doctor') {
      filter.doctor = doctorId;
    } else if (role === 'patient') {
      filter.user = userId;
    }
    const bookings = await Booking.find(filter).populate('doctor user');
    res.json({ bookings });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Update booking status (accept/reject)
app.patch('/api/bookings/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    const booking = await Booking.findByIdAndUpdate(req.params.id, { status }, { new: true });
    res.json(booking);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 
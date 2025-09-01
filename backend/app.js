import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import multer from 'multer';
import path from 'path';
import config from './config.js';
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
mongoose.connect(config.db, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log('Connected to MongoDB successfully');
})
.catch((err) => {
  console.error('MongoDB connection error:', err);
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

// In-memory storage for appointment records (in production, use a database)
let appointmentRecords = [];
let nextRecordId = 1;

// Routes
// Get all doctors (with pagination)
app.get('/api/doctors', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 4;
    const skip = (page - 1) * limit;
    const featured = req.query.featured === 'true';
    
    let filter = {};
    if ('featured' in req.query) {
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
    
    // Create doctor data with proper defaults
    const doctorData = {
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
      // Set default values for calculated fields
      reviews: [],
      averageRating: 0,
      totalRating: 0,
      isApproved: 'pending',
      appointments: []
    };
    
    const newDoctor = new Doctor(doctorData);
    await newDoctor.save();
    res.status(201).json(newDoctor);
  } catch (err) {
    console.error('Error adding doctor:', err);
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
    
    // Handle file upload
    if (req.file) {
      updateData.photo = `/uploads/${req.file.filename}`;
    }
    
    // Parse JSON fields
    if (updateData.qualifications) updateData.qualifications = JSON.parse(updateData.qualifications);
    if (updateData.experiences) updateData.experiences = JSON.parse(updateData.experiences);
    if (updateData.timeSlots) updateData.timeSlots = JSON.parse(updateData.timeSlots);
    
    // Handle featured field
    if (updateData.featured !== undefined) {
      console.log('Featured field received:', updateData.featured, 'Type:', typeof updateData.featured);
      updateData.featured = updateData.featured === 'true' || updateData.featured === true;
      console.log('Featured field processed:', updateData.featured);
    }
    
    // Remove fields that shouldn't be updated directly
    delete updateData.reviews;
    delete updateData.averageRating;
    delete updateData.totalRating;
    delete updateData.appointments;
    delete updateData.isApproved;
    delete updateData._id;
    delete updateData.__v;
    
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
    const { name, email, password, phone, gender, role = 'patient' } = req.body;
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
      role,
    });
    await newUser.save();
    res.status(201).json({ message: 'User registered successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Doctor registration - links to existing doctor profile
app.post('/api/auth/doctor-signup', async (req, res) => {
  try {
    const { email, password, doctorId } = req.body;
    
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }
    
    // Find the doctor profile
    const doctor = await Doctor.findById(doctorId);
    if (!doctor) {
      return res.status(400).json({ error: 'Doctor profile not found' });
    }
    
    // Check if doctor already has an account
    const existingDoctorUser = await User.findOne({ email: doctor.email });
    if (existingDoctorUser) {
      return res.status(400).json({ error: 'Doctor already has an account' });
    }
    
    // Create user account for doctor (copy photo if exists)
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    const newUser = new User({
      name: doctor.name,
      email: email || doctor.email, // Use provided email or doctor's email
      password: hashedPassword,
      phone: doctor.phone,
      gender: 'Not specified',
      role: 'doctor',
      photo: doctor.photo ? `http://localhost:${PORT}${doctor.photo}` : undefined,
    });
    
    await newUser.save();
    res.status(201).json({ message: 'Doctor account created successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Allow users to update their profile photo
app.put('/api/users/:id/photo', upload.single('photo'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
    const photoPath = `/uploads/${req.file.filename}`;
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { photo: `http://localhost:${PORT}${photoPath}` },
      { new: true }
    );
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ user });
  } catch (err) {
    res.status(400).json({ error: err.message });
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
      config.jwtSecret, // Replace with process.env.JWT_SECRET in production
      { expiresIn: config.jwtExpiration }
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
    const { user, doctor, specialty, appointmentDate, timeSlot, reason } = req.body;
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
      reason,
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
      // Admin sees all bookings - no filter needed
    } else if (role === 'doctor') {
      // Doctor sees bookings assigned to them
      filter.doctor = doctorId;
    } else if (role === 'patient') {
      // Patient sees their own bookings
      filter.user = userId;
    }
    
    const bookings = await Booking.find(filter)
      .populate('doctor', 'name specialization photo')
      .populate('user', 'name email phone photo')
      .sort({ createdAt: -1 }); // Most recent first
    
    res.json({ bookings });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update booking status (accept/reject)
app.patch('/api/bookings/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    const booking = await Booking.findByIdAndUpdate(
      req.params.id, 
      { status }, 
      { new: true }
    ).populate('doctor', 'name specialization photo')
     .populate('user', 'name email phone photo');
    
    // If booking is accepted, add to appointment records
    if (status === 'accepted') {
      const record = {
        id: nextRecordId++,
        bookingId: booking._id,
        patientName: booking.user.name,
        doctorName: booking.doctor.name,
        appointmentDate: booking.appointmentDate,
        timeSlot: booking.timeSlot,
        reason: booking.reason,
        status: 'confirmed',
        createdAt: new Date()
      };
      appointmentRecords.push(record);
    }
    
    res.json(booking);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete a booking (admin only)
app.delete('/api/bookings/:id', async (req, res) => {
  try {
    console.log('Delete booking request for ID:', req.params.id);
    
    // Check if the ID is a valid MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      console.log('Invalid booking ID format:', req.params.id);
      return res.status(400).json({ error: 'Invalid booking ID format' });
    }
    
    const booking = await Booking.findByIdAndDelete(req.params.id);
    console.log('Booking found and deleted:', booking);
    
    if (!booking) {
      console.log('Booking not found for ID:', req.params.id);
      return res.status(404).json({ error: 'Booking not found' });
    }
    
    console.log('Booking deleted successfully');
    res.json({ message: 'Booking deleted successfully' });
  } catch (err) {
    console.error('Error deleting booking:', err);
    res.status(500).json({ error: err.message });
  }
});

// Get all appointment records
app.get('/api/appointment-records', async (req, res) => {
  try {
    res.json({ records: appointmentRecords });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add new appointment record
app.post('/api/appointment-records', async (req, res) => {
  try {
    const { patientName, doctorName, appointmentDate, timeSlot, reason, status } = req.body;
    const record = {
      id: nextRecordId++,
      patientName,
      doctorName,
      appointmentDate,
      timeSlot,
      reason,
      status: status || 'confirmed',
      createdAt: new Date()
    };
    appointmentRecords.push(record);
    res.status(201).json(record);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Update appointment record
app.put('/api/appointment-records/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    const recordIndex = appointmentRecords.findIndex(r => r.id === parseInt(id));
    
    if (recordIndex === -1) {
      return res.status(404).json({ error: 'Record not found' });
    }
    
    appointmentRecords[recordIndex] = { ...appointmentRecords[recordIndex], ...updateData };
    res.json(appointmentRecords[recordIndex]);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Delete appointment record
app.delete('/api/appointment-records/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const recordIndex = appointmentRecords.findIndex(r => r.id === parseInt(id));
    
    if (recordIndex === -1) {
      return res.status(404).json({ error: 'Record not found' });
    }
    
    appointmentRecords.splice(recordIndex, 1);
    res.json({ message: 'Record deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add new column to appointment records
app.post('/api/appointment-records/columns', async (req, res) => {
  try {
    const { columnName, defaultValue } = req.body;
    
    // Add the new column to all existing records
    appointmentRecords.forEach(record => {
      record[columnName] = defaultValue || '';
    });
    
    res.json({ message: 'Column added successfully', records: appointmentRecords });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Delete column from appointment records
app.delete('/api/appointment-records/columns/:columnName', async (req, res) => {
  try {
    const { columnName } = req.params;
    
    // Remove the column from all records
    appointmentRecords.forEach(record => {
      delete record[columnName];
    });
    
    res.json({ message: 'Column deleted successfully', records: appointmentRecords });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Blog management endpoints
// In-memory storage for blog posts (in production, use a database)
let blogPosts = [
  {
    id: 1,
    title: "How Much Aspirin to Take for Stroke Prevention",
    excerpt: "Understanding the correct dosage of aspirin for stroke prevention is crucial for patient safety and effective treatment outcomes. This comprehensive guide covers the latest medical recommendations.",
    content: "Understanding the correct dosage of aspirin for stroke prevention is crucial for patient safety and effective treatment outcomes. This comprehensive guide covers the latest medical recommendations and best practices.",
    image: "doc1.jpg",
    date: "15 Nov 2024",
    author: "Dr. Alex",
    comments: 3,
    category: "Cardiology",
    slug: "aspirin-stroke-prevention",
    featured: true,
    readTime: "5 min read"
  },
  {
    id: 2,
    title: "Implant Surgical Equipment Technology",
    excerpt: "Modern surgical implants have revolutionized medical procedures. Discover the latest advancements in implant technology and how they're improving patient outcomes.",
    content: "Modern surgical implants have revolutionized medical procedures, offering patients better outcomes and faster recovery times. This article explores the latest advancements in implant technology.",
    image: "doc2.jpg",
    date: "12 Nov 2024",
    author: "Dr. Sarah",
    comments: 5,
    category: "Surgery",
    slug: "surgical-equipment-technology",
    featured: true,
    readTime: "7 min read"
  },
  {
    id: 3,
    title: "The Benefits of Middle-Age Fitness",
    excerpt: "Fitness in middle age is more important than ever. Learn about the specific benefits and how to maintain an effective exercise routine as you age.",
    content: "Fitness in middle age is more important than ever. As we age, maintaining physical activity becomes crucial for overall health and quality of life.",
    image: "doc3.jpg",
    date: "20 Nov 2024",
    author: "Dr. Michael",
    comments: 2,
    category: "Fitness",
    slug: "middle-age-fitness-benefits",
    featured: true,
    readTime: "6 min read"
  },
  {
    id: 4,
    title: "Good Reasons to Break the Fast-Food Habit",
    excerpt: "Fast food can have serious health implications. Discover the compelling reasons to break this habit and adopt healthier eating patterns for better long-term health.",
    content: "Fast food can have serious health implications that extend far beyond temporary satisfaction. Understanding these risks can motivate positive changes in eating habits.",
    image: "doc4.jpg",
    date: "23 Nov 2024",
    author: "Dr. Emily",
    comments: 7,
    category: "Nutrition",
    slug: "break-fast-food-habit",
    featured: true,
    readTime: "8 min read"
  }
];
let nextBlogId = 5;

// Get all blog posts
app.get('/api/blog', async (req, res) => {
  try {
    const { featured } = req.query;
    let posts = [...blogPosts];
    
    if (featured === 'true') {
      posts = posts.filter(post => post.featured);
    }
    
    res.json({ posts });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get single blog post by slug
app.get('/api/blog/:slug', async (req, res) => {
  try {
    const { slug } = req.params;
    const post = blogPosts.find(p => p.slug === slug);
    
    if (!post) {
      return res.status(404).json({ error: 'Blog post not found' });
    }
    
    res.json({ post });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add new blog post
app.post('/api/blog', upload.single('image'), async (req, res) => {
  try {
    const { title, excerpt, content, author, category, featured, readTime } = req.body;
    
    const slug = title.toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
    
    const post = {
      id: nextBlogId++,
      title,
      excerpt,
      content,
      image: req.file ? `/uploads/${req.file.filename}` : 'doc1.jpg', // Default image if none uploaded
      date: new Date().toLocaleDateString('en-US', { 
        day: 'numeric', 
        month: 'short', 
        year: 'numeric' 
      }),
      author,
      comments: 0,
      category,
      slug,
      featured: featured === 'true' || featured === true,
      readTime: readTime || '5 min read'
    };
    
    blogPosts.push(post);
    res.status(201).json(post);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Update blog post
app.put('/api/blog/:id', upload.single('image'), async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    const postIndex = blogPosts.findIndex(p => p.id === parseInt(id));
    
    if (postIndex === -1) {
      return res.status(404).json({ error: 'Blog post not found' });
    }
    
    // Handle image update
    if (req.file) {
      updateData.image = `/uploads/${req.file.filename}`;
    }
    
    blogPosts[postIndex] = { ...blogPosts[postIndex], ...updateData };
    res.json(blogPosts[postIndex]);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Delete blog post
app.delete('/api/blog/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const postIndex = blogPosts.findIndex(p => p.id === parseInt(id));
    
    if (postIndex === -1) {
      return res.status(404).json({ error: 'Blog post not found' });
    }
    
    blogPosts.splice(postIndex, 1);
    res.json({ message: 'Blog post deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Toggle featured status
app.patch('/api/blog/:id/featured', async (req, res) => {
  try {
    const { id } = req.params;
    const { featured } = req.body;
    const postIndex = blogPosts.findIndex(p => p.id === parseInt(id));
    
    if (postIndex === -1) {
      return res.status(404).json({ error: 'Blog post not found' });
    }
    
    blogPosts[postIndex].featured = featured;
    res.json(blogPosts[postIndex]);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Start server
app.listen(config.port, () => {
  console.log(`Server running on port ${config.port}`);
}); 
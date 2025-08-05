const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/medimeet', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// User Schema
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  phone: { type: String },
  gender: { type: String },
  role: { type: String, enum: ["patient", "admin", "doctor"], default: "patient" },
}, { timestamps: true });

// Doctor Schema
const doctorSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String },
  photo: { type: String },
  ticketPrice: { type: String },
  specialization: { type: String },
  bio: { type: String },
  about: { type: String },
  address: { type: String },
  featured: { type: Boolean, default: false },
  social: {
    facebook: String,
    twitter: String,
    instagram: String
  },
  certificates: [String]
}, { timestamps: true });

const User = mongoose.model('User', userSchema);
const Doctor = mongoose.model('Doctor', doctorSchema);

async function addTestData() {
  try {
    console.log('Adding test data...');

    // Create admin account
    const existingAdmin = await User.findOne({ email: 'admin@gmail.com' });
    if (!existingAdmin) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('admin123', salt);
      
      const admin = new User({
        name: 'Admin User',
        email: 'admin@gmail.com',
        password: hashedPassword,
        phone: '1234567890',
        gender: 'Not specified',
        role: 'admin'
      });
      await admin.save();
      console.log('✅ Admin account created');
    } else {
      console.log('✅ Admin account already exists');
    }

    // Create test doctor profiles
    const testDoctors = [
      {
        name: 'Dr. Sarah Johnson',
        email: 'sarah.johnson@medimeet.com',
        phone: '+1-555-0101',
        specialization: 'Cardiology',
        bio: 'Experienced cardiologist with 15+ years of practice',
        about: 'Specializing in heart disease prevention and treatment',
        address: '123 Medical Center Dr, Suite 100',
        ticketPrice: '150',
        featured: true
      },
      {
        name: 'Dr. Michael Chen',
        email: 'michael.chen@medimeet.com',
        phone: '+1-555-0102',
        specialization: 'Neurology',
        bio: 'Board-certified neurologist specializing in brain disorders',
        about: 'Expert in treating neurological conditions and disorders',
        address: '456 Health Plaza, Suite 200',
        ticketPrice: '180',
        featured: true
      },
      {
        name: 'Dr. Emily Rodriguez',
        email: 'emily.rodriguez@medimeet.com',
        phone: '+1-555-0103',
        specialization: 'Pediatrics',
        bio: 'Caring pediatrician with expertise in child development',
        about: 'Dedicated to providing the best care for children',
        address: '789 Children\'s Hospital Way, Suite 150',
        ticketPrice: '120',
        featured: false
      },
      {
        name: 'Dr. James Wilson',
        email: 'james.wilson@medimeet.com',
        phone: '+1-555-0104',
        specialization: 'Orthopedics',
        bio: 'Orthopedic surgeon specializing in joint replacement',
        about: 'Expert in sports medicine and joint surgery',
        address: '321 Sports Medicine Ave, Suite 300',
        ticketPrice: '200',
        featured: true
      }
    ];

    for (const doctorData of testDoctors) {
      const existingDoctor = await Doctor.findOne({ email: doctorData.email });
      if (!existingDoctor) {
        const doctor = new Doctor(doctorData);
        await doctor.save();
        console.log(`✅ Doctor profile created: ${doctorData.name}`);
      } else {
        console.log(`✅ Doctor profile already exists: ${doctorData.name}`);
      }
    }

    console.log('\n🎉 Test data added successfully!');
    console.log('\n📋 Available Accounts:');
    console.log('Admin: admin@gmail.com / admin123');
    console.log('\n📋 Available Doctor Profiles for Registration:');
    console.log('- Dr. Sarah Johnson (Cardiology)');
    console.log('- Dr. Michael Chen (Neurology)');
    console.log('- Dr. Emily Rodriguez (Pediatrics)');
    console.log('- Dr. James Wilson (Orthopedics)');
    console.log('\n💡 Next Steps:');
    console.log('1. Start backend: cd backend && npm start');
    console.log('2. Start frontend: cd frontend && npm run dev');
    console.log('3. Login as admin: admin@gmail.com / admin123');
    console.log('4. Register doctor accounts at /doctor-signup');

  } catch (error) {
    console.error('Error adding test data:', error);
  } finally {
    mongoose.connection.close();
  }
}

addTestData(); 
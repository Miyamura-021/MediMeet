const bcrypt = require('bcrypt');
const mongoose = require('mongoose');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/medimeet', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// User Schema (same as in your backend)
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  phone: { type: String },
  gender: { type: String },
  role: { type: String, enum: ["patient", "admin", "doctor"], default: "patient" },
}, { timestamps: true });

const User = mongoose.model('User', userSchema);

async function createAdmin() {
  try {
    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: 'admin@gmail.com' });
    if (existingAdmin) {
      console.log('Admin account already exists!');
      return;
    }

    // Create admin account
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
    console.log('✅ Admin account created successfully!');
    console.log('Email: admin@gmail.com');
    console.log('Password: admin123');
    console.log('You can now login with these credentials.');
  } catch (error) {
    console.error('Error creating admin:', error);
  } finally {
    mongoose.connection.close();
  }
}

createAdmin(); 
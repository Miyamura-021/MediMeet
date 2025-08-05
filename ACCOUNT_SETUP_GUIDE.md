# 🏥 MediMeet Account Setup Guide

## 📋 **Account Types & Setup**

### **1. Admin Account**
**Purpose**: Full system control - manage all bookings, doctors, and system settings

**Setup Method**: 
- **Email**: `admin@gmail.com`
- **Password**: `admin123`
- **Role**: Admin (full access)

**How to Create**:
1. Start your backend server: `cd backend && npm start`
2. Start your frontend: `cd frontend && npm run dev`
3. Go to `/login` page
4. Login with the credentials above
5. You'll have full admin access to manage everything

### **2. Patient Accounts**
**Purpose**: Book appointments and track booking status

**Setup Method**:
1. Go to `/signup` page
2. Select "Patient" role
3. Fill in your details
4. Create account
5. Login and start booking appointments

**Features**:
- Book appointments by specialty (Contact Us page)
- Book appointments with specific doctors (Doctor detail pages)
- View booking history and status in profile
- Track pending/accepted/rejected bookings

### **3. Doctor Accounts**
**Purpose**: Manage booking requests and patient appointments

**Setup Method**:
1. **First**: Admin must add doctor profiles through admin panel
2. **Then**: Go to `/doctor-signup` page
3. Select your doctor profile from dropdown
4. Create login credentials
5. Login to manage booking requests

**Features**:
- View all booking requests sent to you
- Accept or reject booking requests
- See patient details, appointment times, and reasons
- Manage your schedule

## 🔄 **Complete Workflow**

### **For Patients**:
1. **Register**: Go to `/signup` → Select "Patient" → Create account
2. **Book Appointment**: 
   - **Option A**: Contact Us page (auto-assigns doctor by specialty)
   - **Option B**: Doctor detail page (book with specific doctor)
3. **Track Status**: Check profile page for booking updates
4. **Get Notified**: See when booking is accepted/rejected

### **For Doctors**:
1. **Admin Adds Profile**: Admin creates doctor profile in admin panel
2. **Register Account**: Go to `/doctor-signup` → Select profile → Create account
3. **Login**: Access profile to see booking requests
4. **Manage Requests**: Accept/reject booking requests
5. **Track Schedule**: See all appointments and patient details

### **For Admins**:
1. **Login**: Use admin credentials (`admin@gmail.com` / `admin123`)
2. **Manage Doctors**: Add, edit, delete doctor profiles
3. **Monitor Bookings**: View all bookings across system
4. **Control System**: Accept/reject any booking, manage featured doctors

## 🛠 **Technical Setup**

### **Backend APIs**:
```javascript
// Patient registration
POST /api/auth/signup
{
  name: "Patient Name",
  email: "patient@email.com",
  password: "password123",
  phone: "1234567890",
  gender: "male",
  role: "patient"
}

// Doctor registration
POST /api/auth/doctor-signup
{
  email: "doctor@email.com",
  password: "password123",
  doctorId: "doctor_profile_id"
}

// Login (all users)
POST /api/auth/login
{
  email: "user@email.com",
  password: "password123"
}
```

### **Database Collections**:
- **Users**: User accounts (patients, doctors, admins)
- **Doctors**: Doctor profiles (created by admin)
- **Bookings**: Appointment requests and status

## 🎯 **Testing Scenarios**

### **Scenario 1: Patient Booking**
1. Create patient account
2. Book appointment via Contact Us
3. Check booking status in profile
4. Verify auto-assignment to available doctor

### **Scenario 2: Doctor Management**
1. Admin creates doctor profile
2. Doctor registers account
3. Doctor logs in and sees booking requests
4. Doctor accepts/rejects requests

### **Scenario 3: Admin Control**
1. Admin logs in
2. Admin adds new doctor profiles
3. Admin monitors all bookings
4. Admin manages featured doctors

## 🔐 **Security Notes**

- **Admin Access**: Only admin can create doctor profiles
- **Role Protection**: Each role sees only relevant data
- **Password Security**: All passwords are hashed with bcrypt
- **JWT Tokens**: Secure authentication for all users

## 🚀 **Ready to Use**

Your MediMeet system is now complete with:
- ✅ **Admin Account**: Full system control
- ✅ **Patient Registration**: Easy account creation
- ✅ **Doctor Registration**: Linked to doctor profiles
- ✅ **Booking Management**: Complete workflow
- ✅ **Role-Based Access**: Secure and organized

**Start Testing**: Login as admin and begin managing the system! 🎉 
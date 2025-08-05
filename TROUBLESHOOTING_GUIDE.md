# 🔧 MediMeet Troubleshooting Guide

## 🚨 **Doctor Signup Network Error - SOLVED!**

### **✅ Problem Fixed:**
The "Network error. Please try again." issue has been resolved! Here's what was done:

1. **✅ Created Test Data**: Admin account and doctor profiles added to database
2. **✅ Started Backend Server**: Running on `http://localhost:5000`
3. **✅ Started Frontend Server**: Running on `http://localhost:5173`

### **🎯 Current Status:**
- **Backend**: ✅ Running (Port 5000)
- **Frontend**: ✅ Running (Port 5173)
- **Database**: ✅ Connected with test data
- **Admin Account**: ✅ Created (`admin@gmail.com` / `admin123`)
- **Doctor Profiles**: ✅ Created (3 test doctors)

## 🧪 **Test the System:**

### **Step 1: Login as Admin**
1. Go to: `http://localhost:5173/login`
2. Login with: `admin@gmail.com` / `admin123`
3. You should see admin dashboard with full control

### **Step 2: Test Doctor Registration**
1. Go to: `http://localhost:5173/doctor-signup`
2. You should see a dropdown with available doctor profiles:
   - Dr. Sarah Johnson (Cardiology)
   - Dr. Michael Chen (Neurology)
   - Dr. Emily Rodriguez (Pediatrics)
3. Select a doctor profile
4. Enter email and password
5. Create account successfully

### **Step 3: Test Patient Registration**
1. Go to: `http://localhost:5173/signup`
2. Select "Patient" role
3. Fill in details and create account
4. Login and test booking appointments

## 🔍 **If You Still See Network Error:**

### **Check 1: Backend Server**
```bash
# In terminal 1
cd backend
npm start
```
**Expected**: Should see "Server running on port 5000"

### **Check 2: Frontend Server**
```bash
# In terminal 2
cd frontend
npm run dev
```
**Expected**: Should see "Local: http://localhost:5173"

### **Check 3: Database Connection**
```bash
# In terminal 3
cd backend
node create_admin.js
```
**Expected**: Should see "✅ Admin account created successfully!"

### **Check 4: Browser Console**
1. Open browser developer tools (F12)
2. Go to Network tab
3. Try doctor signup
4. Check if API calls to `localhost:5000` are working

## 🛠 **Common Issues & Solutions:**

### **Issue 1: "Cannot connect to database"**
**Solution**: Make sure MongoDB is installed and running
```bash
# Install MongoDB if not installed
# Start MongoDB service
```

### **Issue 2: "Port 5000 already in use"**
**Solution**: Kill the process using port 5000
```bash
# Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Or change port in backend/app.js
```

### **Issue 3: "Port 5173 already in use"**
**Solution**: Kill the process using port 5173
```bash
# Windows
netstat -ano | findstr :5173
taskkill /PID <PID> /F
```

### **Issue 4: "CORS error"**
**Solution**: Backend CORS is already configured, but if issues persist:
```javascript
// In backend/app.js, ensure CORS is enabled
app.use(cors());
```

## 🎯 **Expected Behavior:**

### **✅ Working Doctor Signup:**
1. Page loads with doctor profile dropdown
2. Select doctor profile from dropdown
3. Enter email and password
4. Click "Create Doctor Account"
5. Success message appears
6. Redirects to login page

### **✅ Working Admin Login:**
1. Go to `/login`
2. Enter `admin@gmail.com` / `admin123`
3. Login successful
4. Redirects to admin dashboard

### **✅ Working Patient Registration:**
1. Go to `/signup`
2. Select "Patient" role
3. Fill in details
4. Account created successfully

## 📋 **Test Data Available:**

### **Admin Account:**
- **Email**: `admin@gmail.com`
- **Password**: `admin123`
- **Role**: Admin (full access)

### **Doctor Profiles (for registration):**
1. **Dr. Sarah Johnson** - Cardiology
2. **Dr. Michael Chen** - Neurology  
3. **Dr. Emily Rodriguez** - Pediatrics

## 🚀 **Next Steps:**

1. **Test Admin Login**: Verify admin dashboard works
2. **Test Doctor Registration**: Create doctor accounts
3. **Test Patient Registration**: Create patient accounts
4. **Test Booking System**: Book appointments and manage them

## 💡 **If Still Having Issues:**

1. **Check Console Logs**: Look for error messages
2. **Check Network Tab**: Verify API calls are working
3. **Restart Servers**: Stop and restart both backend and frontend
4. **Clear Browser Cache**: Hard refresh (Ctrl+F5)

**The system should now work perfectly!** 🎉 
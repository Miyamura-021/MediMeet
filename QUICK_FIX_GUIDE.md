# 🔧 Quick Fix: Doctor Registration Network Error

## 🚨 **Problem:**
Doctor registration page shows "Network error. Please try again."

## ✅ **Solution:**

### **Step 1: Check if Servers are Running**
Both servers should be running in separate terminals:

**Terminal 1 - Backend:**
```bash
cd backend
npm start
```
**Expected Output:** "Server running on port 5000"

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```
**Expected Output:** "Local: http://localhost:5173"

### **Step 2: Test the Connection**
1. Open browser and go to: `http://localhost:5173/doctor-signup`
2. You should see the dropdown with doctor profiles
3. If you still see "Network error", check the browser console (F12)

### **Step 3: Verify Backend is Working**
Test the backend API directly:
1. Open browser
2. Go to: `http://localhost:5000/api/doctors`
3. Should see JSON data with doctor profiles

### **Step 4: Check Browser Console**
1. Press F12 in browser
2. Go to Console tab
3. Look for error messages
4. Go to Network tab
5. Try doctor registration
6. Check if API calls to `localhost:5000` are failing

## 🔍 **Common Issues & Solutions:**

### **Issue 1: "Cannot connect to database"**
**Solution:**
```bash
cd backend
node create_admin.js
```
Should see: "✅ Admin account created successfully!"

### **Issue 2: "Port 5000 already in use"**
**Solution:**
```bash
# Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F
```

### **Issue 3: "Port 5173 already in use"**
**Solution:**
```bash
# Windows
netstat -ano | findstr :5173
taskkill /PID <PID> /F
```

### **Issue 4: "CORS error"**
**Solution:** Backend CORS is configured, but if issues persist:
1. Check if backend is running on port 5000
2. Check if frontend is running on port 5173
3. Restart both servers

## 🎯 **Expected Working Flow:**

1. **Backend Running**: `http://localhost:5000` ✅
2. **Frontend Running**: `http://localhost:5173` ✅
3. **Database Connected**: Test data available ✅
4. **Doctor Registration**: Dropdown shows doctor profiles ✅
5. **Account Creation**: Success message appears ✅

## 📋 **Test Data Available:**

| Account Type | Email | Password | Purpose |
|-------------|-------|----------|---------|
| **Admin** | `admin@gmail.com` | `admin123` | Full system control |
| **Doctor Profiles** | Available for registration | - | Create doctor accounts |

## 🚀 **Quick Test:**

1. **Login as Admin**: `http://localhost:5173/login`
   - Email: `admin@gmail.com`
   - Password: `admin123`

2. **Test Doctor Registration**: `http://localhost:5173/doctor-signup`
   - Should see dropdown with doctor profiles
   - Select a profile and create account

3. **If Still Not Working**:
   - Check browser console (F12)
   - Look for specific error messages
   - Verify both servers are running

## 💡 **If Still Having Issues:**

1. **Restart Everything**:
   ```bash
   # Kill all processes
   taskkill /F /IM node.exe
   
   # Start backend
   cd backend && npm start
   
   # Start frontend (new terminal)
   cd frontend && npm run dev
   ```

2. **Check MongoDB**: Make sure MongoDB is running

3. **Clear Browser Cache**: Hard refresh (Ctrl+F5)

**The system should work perfectly once both servers are running!** 🎉 
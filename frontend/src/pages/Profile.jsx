import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DoctorForm from '../components/Doctors/DoctorForm';
import RecordForm from '../components/Forms/RecordForm';
import BlogForm from '../components/Forms/BlogForm';

const API_URL = 'https://medimeet-n9p5.onrender.com/api';
const API_BASE = 'https://medimeet-n9p5.onrender.com';

const Profile = () => {
  const [user, setUser] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [allBookings, setAllBookings] = useState([]); // for admin
  const [doctors, setDoctors] = useState([]); // for admin
  const [loadingDoctors, setLoadingDoctors] = useState(false);
  const [showAddDoctor, setShowAddDoctor] = useState(false);
  const [addDoctorLoading, setAddDoctorLoading] = useState(false);
  const [addDoctorError, setAddDoctorError] = useState('');
  const [editDoctorId, setEditDoctorId] = useState(null);
  const [editDoctorLoading, setEditDoctorLoading] = useState(false);
  const [editDoctorError, setEditDoctorError] = useState('');
  const [activeTab, setActiveTab] = useState('profile'); // profile, bookings, admin, records, blog
  const navigate = useNavigate();
  
  // Appointment records state
  const [appointmentRecords, setAppointmentRecords] = useState([]);
  const [showAddRecord, setShowAddRecord] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [newColumnName, setNewColumnName] = useState('');
  const [newColumnDefault, setNewColumnDefault] = useState('');
  
  // Blog management state
  const [blogPosts, setBlogPosts] = useState([]);
  const [showAddBlog, setShowAddBlog] = useState(false);
  const [editingBlog, setEditingBlog] = useState(null);
  
  // Confirmation modal state
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmMessage, setConfirmMessage] = useState('');
  const [confirmCallback, setConfirmCallback] = useState(null);

  const normalizePhoto = (p) => (p && p.startsWith('/uploads') ? `${API_BASE}${p}` : p);

  useEffect(() => {
    // Get user from localStorage
    const userData = localStorage.getItem('user');
    console.log('User data from localStorage:', userData);
    
    if (!userData) {
      console.log('No user data found, redirecting to login');
      navigate('/login');
      return;
    }
    
    const parsed = JSON.parse(userData);
    console.log('Parsed user data:', parsed);
    console.log('User role:', parsed.role);
    
    parsed.photo = normalizePhoto(parsed.photo);
    setUser(parsed);
  }, [navigate]);

  // Fetch doctors for admin
  useEffect(() => {
    if (user && user.role === 'admin') {
      setLoadingDoctors(true);
      fetch(`${API_URL}/doctors`)
        .then(res => res.json())
        .then(data => {
          setDoctors(data.doctors || []);
          setLoadingDoctors(false);
        })
        .catch(() => setLoadingDoctors(false));
    }
  }, [user]);

  // Fetch bookings based on user role
  useEffect(() => {
    if (user) {
      fetchBookings();
    }
  }, [user]);

  // Fetch appointment records for admin
  useEffect(() => {
    if (user && user.role === 'admin') {
      fetchAppointmentRecords();
    }
  }, [user]);

  // Fetch blog posts for admin
  useEffect(() => {
    if (user && user.role === 'admin') {
      fetchBlogPosts();
    }
  }, [user]);

  const fetchBookings = async () => {
    try {
      let url = `${API_URL}/bookings?`;
      
      if (user.role === 'admin') {
        // Admin sees all bookings
        url += 'role=admin';
      } else if (user.role === 'doctor') {
        // Doctor sees their own bookings
        url += `role=doctor&doctorId=${user._id}`;
      } else {
        // Patient sees their own bookings
        url += `role=patient&userId=${user._id}`;
      }

      const response = await fetch(url);
      const data = await response.json();
      
      if (user.role === 'admin') {
        setAllBookings(data.bookings || []);
      } else {
        setBookings(data.bookings || []);
      }
    } catch (err) {
      console.error('Error fetching bookings:', err);
    }
  };

  const handleBookingStatusUpdate = async (bookingId, status) => {
    try {
      const response = await fetch(`${API_URL}/bookings/${bookingId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      });

      if (response.ok) {
        // Show success message
        const statusText = status === 'accepted' ? 'accepted' : 'rejected';
        alert(`Booking ${statusText} successfully!`);
        // Refresh bookings after status update
        fetchBookings();
      } else {
        const errorData = await response.json();
        alert(`Failed to update booking: ${errorData.error}`);
      }
    } catch (err) {
      console.error('Error updating booking status:', err);
      alert('Failed to update booking status. Please try again.');
    }
  };

  const handleDeleteDoctor = async (id) => {
    showConfirmDialog(
      'Are you sure you want to delete this doctor?',
      async () => {
        try {
          const response = await fetch(`${API_URL}/doctors/${id}`, {
            method: 'DELETE',
          });
          
          if (response.ok) {
            alert('Doctor deleted successfully!');
            // Refresh doctors list
            setDoctors(prev => prev.filter(d => d._id !== id));
          } else {
            const errorData = await response.json();
            alert(`Failed to delete doctor: ${errorData.error}`);
          }
        } catch (err) {
          console.error('Error deleting doctor:', err);
          alert('Failed to delete doctor. Please try again.');
        }
      }
    );
  };

  const handleAddDoctor = async (doctorData) => {
    setAddDoctorLoading(true);
    setAddDoctorError('');
    
    try {
      // Create FormData for multipart/form-data submission
      const formData = new FormData();
      
      // Define allowed fields for new doctors
      const allowedFields = [
        'name', 'email', 'phone', 'photo', 'specialization', 'bio', 'about', 
        'address', 'certificates', 'social', 'featured', 'qualifications', 
        'experiences', 'timeSlots'
      ];
      
      // Only add allowed fields to FormData
      Object.keys(doctorData).forEach(key => {
        if (!allowedFields.includes(key)) {
          return; // Skip fields that shouldn't be added
        }
        
        if (key === 'photo' && doctorData[key] instanceof File) {
          formData.append('photo', doctorData[key]);
        } else if (key === 'qualifications' || key === 'experiences' || key === 'timeSlots') {
          // Convert arrays to JSON strings for the backend
          formData.append(key, JSON.stringify(doctorData[key] || []));
        } else if (key === 'featured') {
          // Convert boolean to string for the backend
          formData.append(key, doctorData[key] ? 'true' : 'false');
        } else if (key === 'certificates') {
          // Handle certificates array
          formData.append(key, JSON.stringify(doctorData[key] || []));
        } else if (key === 'social') {
          // Handle social media object
          formData.append(key, JSON.stringify(doctorData[key] || {}));
        } else {
          formData.append(key, doctorData[key] || '');
        }
      });
      
      const response = await fetch(`${API_URL}/doctors`, {
        method: 'POST',
        body: formData, // Don't set Content-Type header - let browser set it for FormData
      });
      
      if (response.ok) {
        const newDoctor = await response.json();
        setDoctors(prev => [...prev, newDoctor]);
      setShowAddDoctor(false);
        alert('Doctor added successfully!');
      } else {
        const errorData = await response.json();
        setAddDoctorError(errorData.error || 'Failed to add doctor');
      }
    } catch (err) {
      console.error('Add doctor error:', err);
      setAddDoctorError('Failed to add doctor. Please try again.');
    } finally {
      setAddDoctorLoading(false);
    }
  };

  const handleEditDoctor = async (doctorData) => {
    setEditDoctorLoading(true);
    setEditDoctorError('');
    
    try {
      // Create FormData for multipart/form-data submission
      const formData = new FormData();
      
      // Define allowed fields that can be updated
      const allowedFields = [
        'name', 'email', 'phone', 'photo', 'specialization', 'bio', 'about', 
        'address', 'certificates', 'social', 'featured', 'qualifications', 
        'experiences', 'timeSlots'
      ];
      
      // Only add allowed fields to FormData
      Object.keys(doctorData).forEach(key => {
        if (!allowedFields.includes(key)) {
          return; // Skip fields that shouldn't be updated
        }
        
        if (key === 'photo' && doctorData[key] instanceof File) {
          formData.append('photo', doctorData[key]);
        } else if (key === 'qualifications' || key === 'experiences' || key === 'timeSlots') {
          // Convert arrays to JSON strings for the backend
          formData.append(key, JSON.stringify(doctorData[key] || []));
        } else if (key === 'featured') {
          // Convert boolean to string for the backend
          formData.append(key, doctorData[key] ? 'true' : 'false');
        } else if (key === 'certificates') {
          // Handle certificates array
          formData.append(key, JSON.stringify(doctorData[key] || []));
        } else if (key === 'social') {
          // Handle social media object
          formData.append(key, JSON.stringify(doctorData[key] || {}));
        } else {
          formData.append(key, doctorData[key] || '');
        }
      });
      
      const response = await fetch(`${API_URL}/doctors/${editDoctorId}`, {
        method: 'PUT',
        body: formData, // Don't set Content-Type header - let browser set it for FormData
      });
      
      if (response.ok) {
        const updatedDoctor = await response.json();
        setDoctors(prev => prev.map(d => d._id === editDoctorId ? updatedDoctor : d));
      setEditDoctorId(null);
        alert('Doctor updated successfully!');
      } else {
        const errorData = await response.json();
        setEditDoctorError(errorData.error || 'Failed to update doctor');
      }
    } catch (err) {
      console.error('Edit doctor error:', err);
      setEditDoctorError('Failed to update doctor. Please try again.');
    } finally {
      setEditDoctorLoading(false);
    }
  };

  const openEditDoctor = (doctor) => {
    setEditDoctorId(doctor._id);
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    navigate('/login');
  };

  const handlePhotoChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    const data = new FormData();
    data.append('photo', file);
    
    try {
      const res = await fetch(`${API_BASE}/api/users/${user._id}/photo`, {
        method: 'PUT',
        body: data,
      });
      if (!res.ok) {
        const err = await res.json();
        alert(err.error || 'Failed to update photo');
        return;
      }
      const json = await res.json();
      const updated = json.user;
      // Normalize, persist and refresh state
      updated.photo = normalizePhoto(updated.photo);
      localStorage.setItem('user', JSON.stringify(updated));
      setUser(updated);
    } catch (err) {
      console.error(err);
      alert('Failed to update photo');
    }
  };

  if (!user) return null;

  const getStatusColor = (status) => {
    switch (status) {
      case 'accepted': return 'bg-green-500 text-white';
      case 'rejected': return 'bg-red-500 text-white';
      case 'pending': return 'bg-yellow-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  const getStatusText = (status) => {
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  // Appointment Records Functions
  const fetchAppointmentRecords = async () => {
    try {
      const response = await fetch(`${API_URL}/appointment-records`);
      const data = await response.json();
      setAppointmentRecords(data.records || []);
    } catch (err) {
      console.error('Error fetching appointment records:', err);
    }
  };

  const handleAddRecord = async (recordData) => {
    try {
      const response = await fetch(`${API_URL}/appointment-records`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(recordData),
      });

      if (response.ok) {
        const newRecord = await response.json();
        setAppointmentRecords(prev => [...prev, newRecord]);
        setShowAddRecord(false);
        alert('Record added successfully!');
      } else {
        const errorData = await response.json();
        alert(`Failed to add record: ${errorData.error}`);
      }
    } catch (err) {
      console.error('Error adding record:', err);
      alert('Failed to add record. Please try again.');
    }
  };

  const handleEditRecord = async (recordData) => {
    try {
      const response = await fetch(`${API_URL}/appointment-records/${editingRecord.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(recordData),
      });

      if (response.ok) {
        const updatedRecord = await response.json();
        setAppointmentRecords(prev => prev.map(r => r.id === editingRecord.id ? updatedRecord : r));
        setEditingRecord(null);
        alert('Record updated successfully!');
      } else {
        const errorData = await response.json();
        alert(`Failed to update record: ${errorData.error}`);
      }
    } catch (err) {
      console.error('Error updating record:', err);
      alert('Failed to update record. Please try again.');
    }
  };

  const handleDeleteRecord = async (id) => {
    showConfirmDialog(
      'Are you sure you want to delete this record?',
      async () => {
        try {
          const response = await fetch(`${API_URL}/appointment-records/${id}`, {
            method: 'DELETE',
          });
          
          if (response.ok) {
            setAppointmentRecords(prev => prev.filter(r => r.id !== id));
            alert('Record deleted successfully!');
          } else {
            const errorData = await response.json();
            alert(`Failed to delete record: ${errorData.error}`);
          }
        } catch (err) {
          console.error('Error deleting record:', err);
          alert('Failed to delete record. Please try again.');
        }
      }
    );
  };

  const handleAddColumn = async () => {
    if (!newColumnName.trim()) {
      alert('Please enter a column name');
      return;
    }

    try {
      const response = await fetch(`${API_URL}/appointment-records/columns`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ columnName: newColumnName, defaultValue: newColumnDefault }),
      });

      if (response.ok) {
        const data = await response.json();
        setAppointmentRecords(data.records);
        setNewColumnName('');
        setNewColumnDefault('');
        alert('Column added successfully!');
      } else {
        const errorData = await response.json();
        alert(`Failed to add column: ${errorData.error}`);
      }
    } catch (err) {
      console.error('Error adding column:', err);
      alert('Failed to add column. Please try again.');
    }
  };

  const handleDeleteColumn = async (columnName) => {
    showConfirmDialog(
      `Are you sure you want to delete the column "${columnName}"?`,
      async () => {
        try {
          const response = await fetch(`${API_URL}/appointment-records/columns/${columnName}`, {
            method: 'DELETE',
          });
          
          if (response.ok) {
            const data = await response.json();
            setAppointmentRecords(data.records);
            alert('Column deleted successfully!');
          } else {
            const errorData = await response.json();
            alert(`Failed to delete column: ${errorData.error}`);
          }
        } catch (err) {
          console.error('Error deleting column:', err);
          alert('Failed to delete column. Please try again.');
        }
      }
    );
  };

  // Blog Management Functions
  const fetchBlogPosts = async () => {
    try {
      const response = await fetch(`${API_URL}/blog`);
      const data = await response.json();
      setBlogPosts(data.posts || []);
    } catch (err) {
      console.error('Error fetching blog posts:', err);
    }
  };

  const handleAddBlog = async (blogData) => {
    try {
      // Create FormData for file upload
      const formData = new FormData();
      
      // Add all text fields
      Object.keys(blogData).forEach(key => {
        if (key === 'image' && blogData[key] instanceof File) {
          formData.append('image', blogData[key]);
        } else if (key === 'featured') {
          formData.append(key, blogData[key] ? 'true' : 'false');
        } else if (key !== 'image') {
          formData.append(key, blogData[key]);
        }
      });

      const response = await fetch(`${API_URL}/blog`, {
        method: 'POST',
        body: formData, // Don't set Content-Type header - let browser set it for FormData
      });

      if (response.ok) {
        const newBlog = await response.json();
        setBlogPosts(prev => [...prev, newBlog]);
        setShowAddBlog(false);
        alert('Blog post added successfully!');
      } else {
        const errorData = await response.json();
        alert(`Failed to add blog post: ${errorData.error}`);
      }
    } catch (err) {
      console.error('Error adding blog post:', err);
      alert('Failed to add blog post. Please try again.');
    }
  };

  const handleEditBlog = async (blogData) => {
    try {
      // Create FormData for file upload
      const formData = new FormData();
      
      // Add all text fields
      Object.keys(blogData).forEach(key => {
        if (key === 'image' && blogData[key] instanceof File) {
          formData.append('image', blogData[key]);
        } else if (key === 'featured') {
          formData.append(key, blogData[key] ? 'true' : 'false');
        } else if (key !== 'image') {
          formData.append(key, blogData[key]);
        }
      });

      const response = await fetch(`${API_URL}/blog/${editingBlog.id}`, {
        method: 'PUT',
        body: formData, // Don't set Content-Type header - let browser set it for FormData
      });

      if (response.ok) {
        const updatedBlog = await response.json();
        setBlogPosts(prev => prev.map(b => b.id === editingBlog.id ? updatedBlog : b));
        setEditingBlog(null);
        alert('Blog post updated successfully!');
      } else {
        const errorData = await response.json();
        alert(`Failed to update blog post: ${errorData.error}`);
      }
    } catch (err) {
      console.error('Error updating blog post:', err);
      alert('Failed to update blog post. Please try again.');
    }
  };

  const handleDeleteBlog = async (id) => {
    showConfirmDialog(
      'Are you sure you want to delete this blog post?',
      async () => {
        try {
          const response = await fetch(`${API_URL}/blog/${id}`, {
            method: 'DELETE',
          });
          
          if (response.ok) {
            setBlogPosts(prev => prev.filter(b => b.id !== id));
            alert('Blog post deleted successfully!');
          } else {
            const errorData = await response.json();
            alert(`Failed to delete blog post: ${errorData.error}`);
          }
        } catch (err) {
          console.error('Error deleting blog post:', err);
          alert('Failed to delete blog post. Please try again.');
        }
      }
    );
  };

  const handleToggleFeatured = async (id, featured) => {
    try {
      const response = await fetch(`${API_URL}/blog/${id}/featured`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ featured: !featured }),
      });

      if (response.ok) {
        const updatedBlog = await response.json();
        setBlogPosts(prev => prev.map(b => b.id === id ? updatedBlog : b));
        alert(`Blog post ${!featured ? 'featured' : 'unfeatured'} successfully!`);
      } else {
        const errorData = await response.json();
        alert(`Failed to update featured status: ${errorData.error}`);
      }
    } catch (err) {
      console.error('Error updating featured status:', err);
      alert('Failed to update featured status. Please try again.');
    }
  };

  // Custom confirmation modal
  const showConfirmDialog = (message, onConfirm) => {
    console.log('showConfirmDialog called with message:', message);
    setConfirmMessage(message);
    setConfirmCallback(() => onConfirm);
    setShowConfirmModal(true);
  };

  // Delete booking function
  const handleDeleteBooking = async (id) => {
    console.log('handleDeleteBooking called with ID:', id);
    console.log('API_URL:', API_URL);
    
    showConfirmDialog(
      'Are you sure you want to delete this booking?',
      async () => {
        console.log('Starting delete process...');
        try {
          const url = `${API_URL}/bookings/${id}`;
          console.log('Making DELETE request to:', url);
          
          const response = await fetch(url, {
            method: 'DELETE',
            headers: {
              'Content-Type': 'application/json',
            },
          });
          
          console.log('Response received:', response);
          console.log('Response status:', response.status);
          console.log('Response ok:', response.ok);
          
          if (response.ok) {
            if (user.role === 'admin') {
              setAllBookings(prev => prev.filter(b => b._id !== id));
            } else {
              setBookings(prev => prev.filter(b => b._id !== id));
            }
            alert('Booking deleted successfully!');
          } else {
            const errorData = await response.json();
            console.error('Error response data:', errorData);
            alert(`Failed to delete booking: ${errorData.error}`);
          }
        } catch (err) {
          console.error('Error deleting booking:', err);
          alert('Failed to delete booking. Please try again.');
        }
      }
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <div className="max-w-7xl mx-auto py-8 px-4">
        {/* Header Section */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Welcome Back, {user.name}!</h1>
          <p className="text-gray-400 text-lg">Manage your profile and appointments</p>
        </div>

        {/* Profile Card */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl p-8 mb-8 border border-white/20">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
            {/* Profile Photo */}
            <div className="relative">
              <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-teal-400 shadow-lg">
                {user.photo ? (
                  <img 
                    src={normalizePhoto(user.photo)} 
                    alt="Profile" 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-teal-500 flex items-center justify-center">
                    <span className="text-white text-4xl font-bold">{user.name.charAt(0).toUpperCase()}</span>
                  </div>
                )}
              </div>
              <label className="absolute bottom-0 right-0 bg-teal-500 hover:bg-teal-600 text-white p-2 rounded-full cursor-pointer shadow-lg transition-all duration-200 hover:scale-110">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <input type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} />
              </label>
            </div>

            {/* Profile Info */}
            <div className="flex-1 text-center md:text-left">
              <h2 className="text-3xl font-bold text-white mb-2">{user.name}</h2>
              <div className="space-y-2 mb-6">
                <div className="flex items-center justify-center md:justify-start gap-2 text-gray-300">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                  </svg>
                  <span>{user.email}</span>
                </div>
                {user.phone && (
                  <div className="flex items-center justify-center md:justify-start gap-2 text-gray-300">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    <span>{user.phone}</span>
                  </div>
                )}
                <div className="inline-flex items-center gap-2 bg-teal-500/20 text-teal-400 px-4 py-2 rounded-full">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="capitalize font-medium">{user.role}</span>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-3 justify-center md:justify-start">
                <button 
                  onClick={handleLogout}
                  className="bg-red-500 hover:bg-red-600 text-white font-semibold px-6 py-3 rounded-lg transition-all duration-200 hover:scale-105 shadow-lg flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex flex-wrap gap-2 mb-8 justify-center">
          <button
            onClick={() => setActiveTab('profile')}
            className={`px-6 py-3 rounded-lg font-semibold transition-all duration-200 ${
              activeTab === 'profile'
                ? 'bg-teal-500 text-white shadow-lg'
                : 'bg-white/10 text-gray-300 hover:bg-white/20'
            }`}
          >
            Profile
          </button>
          <button
            onClick={() => setActiveTab('bookings')}
            className={`px-6 py-3 rounded-lg font-semibold transition-all duration-200 ${
              activeTab === 'bookings'
                ? 'bg-teal-500 text-white shadow-lg'
                : 'bg-white/10 text-gray-300 hover:bg-white/20'
            }`}
          >
            {user.role === 'admin' ? 'All Bookings' : 'My Bookings'}
          </button>
          {user.role === 'admin' && (
            <>
              <button
                onClick={() => setActiveTab('admin')}
                className={`px-6 py-3 rounded-lg font-semibold transition-all duration-200 ${
                  activeTab === 'admin'
                    ? 'bg-teal-500 text-white shadow-lg'
                    : 'bg-white/10 text-gray-300 hover:bg-white/20'
                }`}
              >
                Manage Doctors
              </button>
              <button
                onClick={() => setActiveTab('records')}
                className={`px-6 py-3 rounded-lg font-semibold transition-all duration-200 ${
                  activeTab === 'records'
                    ? 'bg-teal-500 text-white shadow-lg'
                    : 'bg-white/10 text-gray-300 hover:bg-white/20'
                }`}
              >
                Appointment Records
              </button>
              <button
                onClick={() => setActiveTab('blog')}
                className={`px-6 py-3 rounded-lg font-semibold transition-all duration-200 ${
                  activeTab === 'blog'
                    ? 'bg-teal-500 text-white shadow-lg'
                    : 'bg-white/10 text-gray-300 hover:bg-white/20'
                }`}
              >
                Blog Management
              </button>
            </>
          )}
        </div>

        {/* Tab Content */}
        {activeTab === 'profile' && (
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl p-8 border border-white/20">
            <h3 className="text-2xl font-bold text-white mb-6">Profile Information</h3>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">Full Name</label>
                  <div className="bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white">
                    {user.name}
        </div>
      </div>
        <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">Email Address</label>
                  <div className="bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white">
                    {user.email}
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                        <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">Phone Number</label>
                  <div className="bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white">
                    {user.phone || 'Not provided'}
                        </div>
                      </div>
                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">Account Type</label>
                  <div className="bg-white/5 border border-white/10 rounded-lg px-4 py-3">
                    <span className="inline-flex items-center gap-2 bg-teal-500/20 text-teal-400 px-3 py-1 rounded-full text-sm font-medium">
                      {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                      </span>
                  </div>
                </div>
              </div>
            </div>
        </div>
      )}

        {activeTab === 'bookings' && (
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl p-8 border border-white/20">
            <h3 className="text-2xl font-bold text-white mb-6">
              {user.role === 'admin' ? 'All Booking Requests' : 'My Bookings'}
            </h3>
            
            {(user.role === 'admin' ? allBookings : bookings).length === 0 ? (
              <div className="text-center py-12">
                <div className="w-24 h-24 mx-auto mb-4 bg-gray-600/20 rounded-full flex items-center justify-center">
                  <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <p className="text-gray-400 text-lg">No bookings found</p>
                <p className="text-gray-500 text-sm">When you have appointments, they will appear here</p>
              </div>
            ) : (
              <div className="space-y-4">
                {(user.role === 'admin' ? allBookings : bookings).map((booking) => (
                  <div key={booking._id} className="bg-white/5 backdrop-blur-lg rounded-xl p-6 border border-white/10 hover:border-teal-400/50 transition-all duration-200">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-4">
                      <div className="flex items-center gap-4">
                        {/* Patient/User Info */}
                        {user.role !== 'patient' && (
                      <div className="flex items-center gap-3">
                            {booking.user?.photo ? (
                              <img 
                                src={normalizePhoto(booking.user.photo)} 
                                alt={booking.user?.name} 
                                className="w-12 h-12 rounded-full object-cover border-2 border-teal-400"
                              />
                            ) : (
                              <div className="w-12 h-12 bg-teal-500 rounded-full flex items-center justify-center">
                                <span className="text-white font-bold text-lg">{booking.user?.name?.charAt(0).toUpperCase()}</span>
                              </div>
                            )}
                            <div>
                              <h4 className="font-bold text-white text-lg">{booking.user?.name || 'Unknown Patient'}</h4>
                              <p className="text-gray-400 text-sm">{booking.user?.email}</p>
                              {booking.user?.phone && (
                                <p className="text-gray-400 text-sm">{booking.user.phone}</p>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Doctor Info */}
                        {user.role !== 'doctor' && (
                          <div className="flex items-center gap-3">
                            {booking.doctor?.photo ? (
                              <img 
                                src={`${API_BASE}${booking.doctor.photo}`} 
                                alt={`Dr. ${booking.doctor?.name}`} 
                                className="w-12 h-12 rounded-full object-cover border-2 border-teal-400"
                              />
                            ) : (
                              <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
                                <span className="text-white font-bold text-lg">Dr</span>
                              </div>
                        )}
                        <div>
                              <h4 className="font-bold text-white text-lg">Dr. {booking.doctor?.name || 'Unknown Doctor'}</h4>
                              <p className="text-teal-400 text-sm">{booking.doctor?.specialization}</p>
                            </div>
                        </div>
                        )}
                      </div>

                      {/* Status Badge */}
                      <div className="flex flex-col items-end gap-2">
                        <span className={`px-4 py-2 rounded-full text-sm font-bold ${getStatusColor(booking.status)}`}>
                          {getStatusText(booking.status)}
                      </span>
                        <p className="text-gray-400 text-xs">
                          {new Date(booking.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    {/* Booking Details */}
                    <div className="grid md:grid-cols-3 gap-4 mb-4">
                      <div className="bg-white/5 rounded-lg p-3">
                        <p className="text-gray-400 text-xs uppercase tracking-wide mb-1">Date</p>
                        <p className="text-white font-semibold">{new Date(booking.appointmentDate).toLocaleDateString()}</p>
                      </div>
                      <div className="bg-white/5 rounded-lg p-3">
                        <p className="text-gray-400 text-xs uppercase tracking-wide mb-1">Time</p>
                        <p className="text-white font-semibold">{booking.timeSlot}</p>
                      </div>
                      <div className="bg-white/5 rounded-lg p-3">
                        <p className="text-gray-400 text-xs uppercase tracking-wide mb-1">Reason</p>
                        <p className="text-white font-semibold">{booking.reason || 'Not specified'}</p>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3 pt-4 border-t border-white/10">
                      {booking.status === 'pending' && (user.role === 'admin' || user.role === 'doctor') && (
                        <>
                          <button
                            onClick={() => handleBookingStatusUpdate(booking._id, 'accepted')}
                            className="bg-green-500 hover:bg-green-600 text-white font-semibold px-6 py-2 rounded-lg transition-all duration-200 hover:scale-105 flex items-center gap-2"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            Accept
                          </button>
                          <button
                            onClick={() => handleBookingStatusUpdate(booking._id, 'rejected')}
                            className="bg-red-500 hover:bg-red-600 text-white font-semibold px-6 py-2 rounded-lg transition-all duration-200 hover:scale-105 flex items-center gap-2"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                            Reject
                          </button>
                        </>
                      )}
                      {(() => {
                        console.log('Rendering delete button, user role:', user.role);
                        return user.role === 'admin';
                      })() && (
                        <button
                          onClick={() => {
                            console.log('Delete button clicked!');
                            console.log('Booking ID:', booking._id);
                            console.log('User role:', user.role);
                            handleDeleteBooking(booking._id);
                          }}
                          className="bg-red-500 hover:bg-red-600 text-white font-semibold px-6 py-2 rounded-lg transition-all duration-200 hover:scale-105 flex items-center gap-2"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                          Delete
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
        </div>
      )}

        {activeTab === 'admin' && user.role === 'admin' && (
          <div className="space-y-8">
            {/* Doctor Management */}
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl p-8 border border-white/20">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-white">Manage Doctors</h3>
                <button 
                  className="bg-teal-500 hover:bg-teal-600 text-white font-semibold px-6 py-3 rounded-lg transition-all duration-200 hover:scale-105 shadow-lg flex items-center gap-2"
                  onClick={() => setShowAddDoctor(true)}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Add Doctor
                </button>
              </div>

              {loadingDoctors ? (
                <div className="text-center py-12">
                  <div className="animate-spin w-8 h-8 border-4 border-teal-500 border-t-transparent rounded-full mx-auto mb-4"></div>
                  <p className="text-gray-400">Loading doctors...</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {doctors.map((doctor) => (
                    <div key={doctor._id} className="bg-white/5 backdrop-blur-lg rounded-xl p-6 border border-white/10 hover:border-teal-400/50 transition-all duration-200">
                      <div className="flex items-center gap-4 mb-4">
                        {doctor.photo ? (
                          <img 
                            src={`${API_BASE}${doctor.photo}`} 
                            alt={`Dr. ${doctor.name}`} 
                            className="w-16 h-16 rounded-full object-cover border-2 border-teal-400"
                          />
                        ) : (
                          <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center">
                            <span className="text-white font-bold text-xl">Dr</span>
                          </div>
                        )}
                        <div className="flex-1">
                          <h4 className="font-bold text-white text-lg">Dr. {doctor.name}</h4>
                          <p className="text-teal-400 text-sm">{doctor.specialization}</p>
                          {doctor.bio && (
                            <p className="text-gray-400 text-sm mt-1">{doctor.bio}</p>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex gap-2">
                        <button
                          className="bg-yellow-500 hover:bg-yellow-600 text-white font-semibold px-4 py-2 rounded-lg transition-all duration-200 hover:scale-105 flex-1 flex items-center justify-center gap-2"
                          onClick={() => openEditDoctor(doctor)}
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                          Edit
                        </button>
                        <button
                          className="bg-red-500 hover:bg-red-600 text-white font-semibold px-4 py-2 rounded-lg transition-all duration-200 hover:scale-105 flex items-center justify-center"
                          onClick={() => handleDeleteDoctor(doctor._id)}
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          </div>
        )}

        {/* Appointment Records Tab */}
        {activeTab === 'records' && user.role === 'admin' && (
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl p-8 border border-white/20">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-white">Appointment Records</h3>
              <button
                onClick={() => setShowAddRecord(true)}
                className="bg-teal-500 hover:bg-teal-600 text-white font-semibold px-4 py-2 rounded-lg transition-all duration-200 hover:scale-105 flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Add Record
              </button>
            </div>

            {/* Column Management */}
            <div className="bg-white/5 rounded-lg p-4 mb-6">
              <h4 className="text-lg font-semibold text-white mb-3">Manage Columns</h4>
              <div className="flex gap-3 flex-wrap">
                <input
                  type="text"
                  placeholder="New column name"
                  value={newColumnName}
                  onChange={(e) => setNewColumnName(e.target.value)}
                  className="bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white placeholder-gray-400"
                />
                <input
                  type="text"
                  placeholder="Default value"
                  value={newColumnDefault}
                  onChange={(e) => setNewColumnDefault(e.target.value)}
                  className="bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white placeholder-gray-400"
                />
                <button
                  onClick={handleAddColumn}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg"
                >
                  Add Column
                </button>
              </div>
            </div>

            {/* Records Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-white/20">
                    <th className="py-3 px-4 text-white font-semibold">Patient</th>
                    <th className="py-3 px-4 text-white font-semibold">Doctor</th>
                    <th className="py-3 px-4 text-white font-semibold">Date</th>
                    <th className="py-3 px-4 text-white font-semibold">Time</th>
                    <th className="py-3 px-4 text-white font-semibold">Reason</th>
                    <th className="py-3 px-4 text-white font-semibold">Status</th>
                    <th className="py-3 px-4 text-white font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {appointmentRecords.map((record) => (
                    <tr key={record.id} className="border-b border-white/10 hover:bg-white/5">
                      <td className="py-3 px-4 text-white">{record.patientName}</td>
                      <td className="py-3 px-4 text-white">{record.doctorName}</td>
                      <td className="py-3 px-4 text-white">{new Date(record.appointmentDate).toLocaleDateString()}</td>
                      <td className="py-3 px-4 text-white">{record.timeSlot}</td>
                      <td className="py-3 px-4 text-white">{record.reason}</td>
                      <td className="py-3 px-4 text-white">
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          record.status === 'confirmed' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'
                        }`}>
                          {record.status}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex gap-2">
                          <button
                            onClick={() => setEditingRecord(record)}
                            className="bg-yellow-500 hover:bg-yellow-600 text-white p-1 rounded"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => handleDeleteRecord(record.id)}
                            className="bg-red-500 hover:bg-red-600 text-white p-1 rounded"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Blog Management Tab */}
        {activeTab === 'blog' && user.role === 'admin' && (
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl p-8 border border-white/20">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-white">Blog Management</h3>
              <button
                onClick={() => setShowAddBlog(true)}
                className="bg-teal-500 hover:bg-teal-600 text-white font-semibold px-4 py-2 rounded-lg transition-all duration-200 hover:scale-105 flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Add Blog Post
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {blogPosts.map((post) => (
                <div key={post.id} className="bg-white/5 backdrop-blur-lg rounded-xl p-6 border border-white/10 hover:border-teal-400/50 transition-all duration-200">
                  <div className="mb-4">
                    <h4 className="font-bold text-white text-lg mb-2">{post.title}</h4>
                    <p className="text-gray-400 text-sm line-clamp-2">{post.excerpt}</p>
                  </div>
                  
                  <div className="flex items-center gap-2 mb-4">
                    <span className="text-teal-400 text-sm">{post.category}</span>
                    <span className="text-gray-500 text-sm">•</span>
                    <span className="text-gray-400 text-sm">{post.readTime}</span>
                  </div>

                  <div className="flex gap-2 mb-4">
                    <button
                      onClick={() => setEditingBlog(post)}
                      className="bg-yellow-500 hover:bg-yellow-600 text-white font-semibold px-3 py-2 rounded-lg transition-all duration-200 hover:scale-105 flex-1 flex items-center justify-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                      Edit
                    </button>
                    <button
                      onClick={() => handleToggleFeatured(post.id, post.featured)}
                      className={`px-3 py-2 rounded-lg transition-all duration-200 hover:scale-105 flex items-center justify-center ${
                        post.featured 
                          ? 'bg-orange-500 hover:bg-orange-600 text-white' 
                          : 'bg-gray-500 hover:bg-gray-600 text-white'
                      }`}
                    >
                      {post.featured ? 'Featured' : 'Feature'}
                    </button>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => handleDeleteBlog(post.id)}
                      className="bg-red-500 hover:bg-red-600 text-white font-semibold px-3 py-2 rounded-lg transition-all duration-200 hover:scale-105 flex-1 flex items-center justify-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Modals */}
          {showAddDoctor && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-white/20">
              <div className="p-6">
                <h4 className="text-2xl font-bold text-white mb-6">Add New Doctor</h4>
                <DoctorForm 
                  onSubmit={handleAddDoctor} 
                  loading={addDoctorLoading} 
                  error={addDoctorError} 
                  onCancel={() => setShowAddDoctor(false)} 
                />
              </div>
              </div>
            </div>
          )}

          {editDoctorId && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-white/20">
              <div className="p-6">
                <h4 className="text-2xl font-bold text-white mb-6">Edit Doctor</h4>
                <DoctorForm 
                  initialValues={doctors.find(d => d._id === editDoctorId)} 
                  onSubmit={handleEditDoctor} 
                  loading={editDoctorLoading} 
                  error={editDoctorError} 
                  onCancel={() => setEditDoctorId(null)} 
                />
              </div>
              </div>
            </div>
          )}

          {/* Add Record Modal */}
          {showAddRecord && (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
              <div className="bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-white/20">
                <div className="p-6">
                  <h4 className="text-2xl font-bold text-white mb-6">Add New Record</h4>
                  <RecordForm 
                    onSubmit={handleAddRecord} 
                    onCancel={() => setShowAddRecord(false)} 
                  />
                </div>
              </div>
            </div>
          )}

          {/* Edit Record Modal */}
          {editingRecord && (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
              <div className="bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-white/20">
                <div className="p-6">
                  <h4 className="text-2xl font-bold text-white mb-6">Edit Record</h4>
                  <RecordForm 
                    initialValues={editingRecord}
                    onSubmit={handleEditRecord} 
                    onCancel={() => setEditingRecord(null)} 
                  />
                </div>
              </div>
            </div>
          )}

          {/* Add Blog Modal */}
          {showAddBlog && (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
              <div className="bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-white/20">
                <div className="p-6">
                  <h4 className="text-2xl font-bold text-white mb-6">Add New Blog Post</h4>
                  <BlogForm 
                    onSubmit={handleAddBlog} 
                    onCancel={() => setShowAddBlog(false)} 
                  />
                </div>
              </div>
            </div>
          )}

          {/* Edit Blog Modal */}
          {editingBlog && (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
              <div className="bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-white/20">
                <div className="p-6">
                  <h4 className="text-2xl font-bold text-white mb-6">Edit Blog Post</h4>
                  <BlogForm 
                    initialValues={editingBlog}
                    onSubmit={handleEditBlog} 
                    onCancel={() => setEditingBlog(null)} 
                  />
                </div>
              </div>
            </div>
          )}
          
          {/* Confirmation Modal */}
          {showConfirmModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-[#181d23] border-2 border-teal-400 rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl">
                <div className="text-center">
                  <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-white mb-4">Confirm Deletion</h3>
                  <p className="text-gray-300 mb-6">{confirmMessage}</p>
                  <div className="flex gap-4 justify-center">
                    <button
                      onClick={() => {
                        setShowConfirmModal(false);
                        setConfirmMessage('');
                        setConfirmCallback(null);
                      }}
                      className="bg-gray-600 hover:bg-gray-700 text-white font-semibold px-6 py-3 rounded-lg transition-all duration-200"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => {
                        setShowConfirmModal(false);
                        setConfirmMessage('');
                        if (confirmCallback) {
                          confirmCallback();
                        }
                      }}
                      className="bg-red-500 hover:bg-red-600 text-white font-semibold px-6 py-3 rounded-lg transition-all duration-200"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
    </div>
  );
};

export default Profile; 
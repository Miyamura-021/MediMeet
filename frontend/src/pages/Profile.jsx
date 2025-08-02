import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DoctorForm from '../components/Doctors/DoctorForm';

const API_URL = 'http://localhost:5000/api';

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
  const navigate = useNavigate();

  useEffect(() => {
    // Get user from localStorage
    const userData = localStorage.getItem('user');
    if (!userData) {
      navigate('/login');
      return;
    }
    setUser(JSON.parse(userData));
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

  const handleDeleteDoctor = async (id) => {
    if (!window.confirm('Are you sure you want to delete this doctor?')) return;
    await fetch(`${API_URL}/doctors/${id}`, { method: 'DELETE' });
    setDoctors(doctors.filter(doc => doc._id !== id));
  };

  const handleAddDoctor = async (formData) => {
    setAddDoctorLoading(true);
    setAddDoctorError('');
    try {
      const data = new FormData();
      data.append('name', formData.name);
      data.append('email', formData.email);
      data.append('phone', formData.phone);
      data.append('specialization', formData.specialization);
      data.append('bio', formData.bio);
      data.append('about', formData.about);
      data.append('address', formData.address);
      if (formData.photo) data.append('photo', formData.photo);
      // Set default password for new doctors
      data.append('password', 'doctor123');
      // Add social links and certificates as JSON
      data.append('social', JSON.stringify(formData.social));
      data.append('certificates', JSON.stringify(formData.certificates));
      data.append('featured', formData.featured);
      
      const res = await fetch(`${API_URL}/doctors`, {
        method: 'POST',
        body: data,
      });
      if (!res.ok) throw new Error('Failed to add doctor');
      const newDoctor = await res.json();
      setDoctors((prev) => [...prev, newDoctor]);
      setShowAddDoctor(false);
    } catch (err) {
      setAddDoctorError('Failed to add doctor.');
    } finally {
      setAddDoctorLoading(false);
    }
  };

  const openEditDoctor = (doctor) => {
    setEditDoctorId(doctor._id);
  };

  const handleEditDoctor = async (formData) => {
    setEditDoctorLoading(true);
    setEditDoctorError('');
    try {
      const data = new FormData();
      data.append('name', formData.name);
      data.append('email', formData.email);
      data.append('phone', formData.phone);
      data.append('specialization', formData.specialization);
      data.append('bio', formData.bio);
      data.append('about', formData.about);
      data.append('address', formData.address);
      if (formData.photo) data.append('photo', formData.photo);
      data.append('social', JSON.stringify(formData.social));
      data.append('certificates', JSON.stringify(formData.certificates));
      data.append('featured', formData.featured);
      
      const res = await fetch(`${API_URL}/doctors/${editDoctorId}`, {
        method: 'PUT',
        body: data,
      });
      if (!res.ok) throw new Error('Failed to update doctor');
      const updated = await res.json();
      setDoctors((prev) => prev.map(doc => doc._id === updated._id ? updated : doc));
      setEditDoctorId(null);
    } catch (err) {
      setEditDoctorError('Failed to update doctor.');
    } finally {
      setEditDoctorLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  if (!user) return null;

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-6">Profile</h1>
      <div className="bg-[#181d23] rounded-lg shadow p-6 mb-8">
        <div className="flex items-center gap-4 mb-4">
          {user.photo && <img src={user.photo} alt="avatar" className="w-16 h-16 rounded-full object-cover" />}
          <div>
            <div className="text-xl font-bold text-white">{user.name}</div>
            <div className="text-gray-400">{user.email}</div>
            <div className="text-gray-400 capitalize">Role: {user.role}</div>
          </div>
        </div>
        <button className="mt-2 bg-teal-500 hover:bg-teal-600 text-white font-bold px-4 py-2 rounded" onClick={handleLogout}>Logout</button>
      </div>
      {user.role === 'patient' && (
        <div>
          <h2 className="text-2xl font-semibold mb-4">Your Bookings</h2>
          {/* TODO: List patient's bookings with status */}
          <div className="bg-[#23282f] rounded-lg p-4 text-white">(Booking list will appear here)</div>
        </div>
      )}
      {user.role === 'admin' && (
        <div>
          <h2 className="text-2xl font-semibold mb-4">Admin Panel</h2>
          {/* TODO: List all booking requests with accept/reject controls */}
          <div className="bg-[#23282f] rounded-lg p-4 text-white mb-6">(All booking requests will appear here)</div>
          <h3 className="text-xl font-semibold mb-2 flex items-center justify-between">
            Manage Doctors
            <button className="bg-teal-500 hover:bg-teal-600 text-white font-bold px-4 py-2 rounded-lg ml-4" onClick={() => setShowAddDoctor(true)}>
              + Add Doctor
            </button>
          </h3>
          <div className="bg-[#23282f] rounded-lg p-4 text-white">
            {loadingDoctors ? (
              <div>Loading doctors...</div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {doctors.map((doctor) => (
                  <div key={doctor._id} className="bg-[#181d23] rounded-lg p-4 flex flex-col gap-2">
                    <div className="flex items-center gap-3">
                      {doctor.photo && <img src={`http://localhost:5000${doctor.photo}`} alt={doctor.name} className="w-12 h-12 rounded-full object-cover" />}
                      <div>
                        <div className="font-bold text-lg">{doctor.name}</div>
                        <div className="text-teal-400 text-sm">{doctor.specialization}</div>
                      </div>
                    </div>
                    <div className="text-gray-300 text-xs mb-2">{doctor.bio}</div>
                    <div className="flex gap-2 mt-auto">
                      <button className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded text-xs font-bold" onClick={() => openEditDoctor(doctor)}>Edit</button>
                      <button className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-xs font-bold" onClick={() => handleDeleteDoctor(doctor._id)}>Delete</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          {/* Add Doctor Modal */}
          {showAddDoctor && (
            <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
              <div className="bg-[#23282f] p-6 rounded-lg shadow-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <h4 className="text-lg font-bold mb-4 text-white">Add Doctor</h4>
                <DoctorForm onSubmit={handleAddDoctor} loading={addDoctorLoading} error={addDoctorError} onCancel={() => setShowAddDoctor(false)} />
              </div>
            </div>
          )}
          {/* Edit Doctor Modal */}
          {editDoctorId && (
            <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
              <div className="bg-[#23282f] p-6 rounded-lg shadow-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <h4 className="text-lg font-bold mb-4 text-white">Edit Doctor</h4>
                <DoctorForm 
                  initialValues={doctors.find(d => d._id === editDoctorId)} 
                  onSubmit={handleEditDoctor} 
                  loading={editDoctorLoading} 
                  error={editDoctorError} 
                  onCancel={() => setEditDoctorId(null)} 
                />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Profile; 
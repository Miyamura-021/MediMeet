import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

const API_URL = 'http://localhost:5000/api';

const DoctorDetails = () => {
  const { id } = useParams();
  const [doctor, setDoctor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState('');
  const [availableTimeSlots, setAvailableTimeSlots] = useState([]);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState('');
  const [bookingForm, setBookingForm] = useState({
    name: '',
    email: '',
    phone: '',
    reason: ''
  });
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);

  useEffect(() => {
    fetch(`${API_URL}/doctors/${id}`)
      .then(res => res.json())
      .then(data => {
        setDoctor(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [id]);

  // Handle date change to fetch available time slots for this specific doctor
  const handleDateChange = (e) => {
    const date = e.target.value;
    setSelectedDate(date);
    setSelectedTimeSlot('');
    
    if (date) {
      fetchAvailableTimeSlots(date);
    } else {
      setAvailableTimeSlots([]);
    }
  };

  // Fetch available time slots for this specific doctor
  const fetchAvailableTimeSlots = async (date) => {
    try {
      const response = await fetch(`${API_URL}/bookings/slots?doctor=${id}&appointmentDate=${date}`);
      const data = await response.json();
      
      // Generate time slots with availability
      const timeSlots = [
        '9-10am', '10-11am', '11-12am', '12-1pm',
        '1-2pm', '2-3pm', '3-4pm', '4-5pm'
      ];
      
      const availableSlots = timeSlots.map(slot => {
        const slotData = data.slots?.find(s => s.slot === slot);
        const isAvailable = slotData?.available !== false;
        const isPastTime = isTimeSlotPast(slot, date);
        
        return {
          slot,
          available: isAvailable && !isPastTime,
          isPastTime
        };
      });
      
      setAvailableTimeSlots(availableSlots);
    } catch (err) {
      console.error('Error fetching time slots:', err);
      // Default to all slots available if API fails
      const timeSlots = [
        '9-10am', '10-11am', '11-12am', '12-1pm',
        '1-2pm', '2-3pm', '3-4pm', '4-5pm'
      ];
      
      const availableSlots = timeSlots.map(slot => ({
        slot,
        available: !isTimeSlotPast(slot, date),
        isPastTime: isTimeSlotPast(slot, date)
      }));
      
      setAvailableTimeSlots(availableSlots);
    }
  };

  // Check if a time slot is in the past for the selected date
  const isTimeSlotPast = (timeSlot, date) => {
    const today = new Date();
    const selectedDate = new Date(date);
    
    // If selected date is today, check if time slot is past
    if (selectedDate.toDateString() === today.toDateString()) {
      const currentHour = today.getHours();
      const currentMinute = today.getMinutes();
      
      // Extract hour from time slot (e.g., "9-10am" -> 9)
      const slotHour = parseInt(timeSlot.split('-')[0]);
      const isAM = timeSlot.includes('am');
      
      // Convert to 24-hour format for comparison
      let slotHour24 = slotHour;
      if (!isAM && slotHour !== 12) slotHour24 += 12;
      if (isAM && slotHour === 12) slotHour24 = 0;
      
      // Check if current time is past this slot
      if (currentHour > slotHour24) {
        return true;
      } else if (currentHour === slotHour24) {
        // If same hour, check minutes (slots are 1 hour long, so if we're past the start time, it's too late)
        return currentMinute > 0;
      }
    }
    
    return false;
  };

  // Handle booking form submission
  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    
    if (!localStorage.getItem("token")) {
      alert('Please login to book an appointment');
      return;
    }

    if (!selectedDate || !selectedTimeSlot) {
      alert('Please select a date and time slot');
      return;
    }

    setBookingLoading(true);

    try {
      const user = JSON.parse(localStorage.getItem('user'));
      const bookingData = {
        user: user._id,
        doctor: id,
        appointmentDate: selectedDate,
        timeSlot: selectedTimeSlot,
        ticketPrice: '50', // Default price
        ...bookingForm
      };

      const response = await fetch(`${API_URL}/bookings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(bookingData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to book appointment');
      }

      const booking = await response.json();
      setBookingSuccess(true);
      setShowBookingModal(false);
      setBookingForm({ name: '', email: '', phone: '', reason: '' });
      setSelectedDate('');
      setSelectedTimeSlot('');
      
      // Hide success message after 3 seconds
      setTimeout(() => setBookingSuccess(false), 3000);
    } catch (err) {
      alert(err.message);
    } finally {
      setBookingLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setBookingForm(prev => ({ ...prev, [name]: value }));
  };

  if (loading) return <div className="text-center py-10 text-white">Loading...</div>;
  if (!doctor) return <div className="text-center py-10 text-red-400">Doctor not found.</div>;

  return (
    <div className="w-full min-h-screen bg-[#181d23] flex flex-col items-center py-12 px-2">
      {/* Success Message */}
      {bookingSuccess && (
        <div className="fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50">
          Appointment booked successfully with Dr. {doctor.name}!
        </div>
      )}

      <div className="w-full max-w-5xl flex flex-col md:flex-row bg-[#23282f] rounded-xl shadow-lg overflow-hidden">
        {/* Social icons vertical */}
        <div className="hidden md:flex flex-col items-center justify-center px-4 bg-[#181d23]">
          <a href={doctor.social?.instagram || '#'} className="mb-4 text-teal-400 hover:text-teal-300" target="_blank" rel="noopener noreferrer"><i className="fab fa-instagram fa-lg"></i></a>
          <a href={doctor.social?.twitter || '#'} className="mb-4 text-teal-400 hover:text-teal-300" target="_blank" rel="noopener noreferrer"><i className="fab fa-twitter fa-lg"></i></a>
          <a href={doctor.social?.facebook || '#'} className="mb-4 text-teal-400 hover:text-teal-300" target="_blank" rel="noopener noreferrer"><i className="fab fa-facebook-f fa-lg"></i></a>
        </div>
        {/* Photo */}
        <div className="flex-shrink-0 flex flex-col items-center justify-center p-8 bg-[#181d23]">
          <img src={doctor.photo ? `http://localhost:5000${doctor.photo}` : '/default-avatar.png'} alt={doctor.name} className="w-64 h-64 rounded-xl object-cover mb-4 border-4 border-[#23282f]" />
        </div>
        {/* Details */}
        <div className="flex-1 flex flex-col justify-center p-8 gap-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-2">
            <div>
              <h2 className="text-3xl font-bold mb-1 text-white">{doctor.name}</h2>
              <div className="text-teal-400 font-semibold mb-2 text-lg">{doctor.specialization || 'Specialist'}</div>
            </div>
            <button 
              className="bg-teal-500 hover:bg-teal-600 text-white font-bold px-8 py-3 rounded-lg text-base uppercase tracking-wide"
              onClick={() => setShowBookingModal(true)}
            >
              Book with {doctor.name}
            </button>
          </div>
          <div className="border-t border-[#333] pt-4">
            <div className="flex flex-col gap-2 text-gray-300 text-base">
              <span><b className="text-teal-400">Phone:</b> {doctor.phone || '-'}</span>
              <span><b className="text-teal-400">Email:</b> {doctor.email || '-'}</span>
              <span><b className="text-teal-400">Website:</b> {doctor.website ? <a href={doctor.website} className="underline text-teal-300" target="_blank" rel="noopener noreferrer">{doctor.website}</a> : '-'}</span>
              <span><b className="text-teal-400">Address:</b> {doctor.address || '-'}</span>
            </div>
          </div>
        </div>
      </div>
      {/* Overview Section */}
      <div className="w-full max-w-5xl bg-[#23282f] rounded-xl shadow-lg mt-8 p-8">
        <h3 className="text-2xl font-bold text-teal-400 mb-3">Overview</h3>
        <p className="text-gray-300 text-base">{doctor.bio || doctor.about || 'No overview available.'}</p>
      </div>

      {/* Booking Modal */}
      {showBookingModal && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowBookingModal(false);
            }
          }}
        >
          <div className="bg-[#23282f] rounded-xl p-6 max-w-lg w-full shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-white">
                Book with Dr. {doctor.name}
              </h3>
              <button
                onClick={() => setShowBookingModal(false)}
                className="text-gray-400 hover:text-white text-xl transition"
              >
                ×
              </button>
            </div>
            
            <form onSubmit={handleBookingSubmit} className="space-y-4">
              {/* Date Selection */}
              <div>
                <label className="block text-white text-sm font-medium mb-2">
                  Select Date
                </label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={handleDateChange}
                  className="w-full p-3 rounded-lg bg-[#181d23] text-white border border-[#333] focus:border-teal-400 focus:outline-none transition"
                  required
                />
              </div>

              {/* Time Slots */}
              {selectedDate && (
                <div>
                  <label className="block text-white text-sm font-medium mb-2">
                    Select Time Slot
                  </label>
                  <select
                    value={selectedTimeSlot}
                    onChange={(e) => setSelectedTimeSlot(e.target.value)}
                    className="w-full p-3 rounded-lg bg-[#181d23] text-white border border-[#333] focus:border-teal-400 focus:outline-none transition"
                    required
                  >
                    <option value="">Select Time Slot</option>
                    {availableTimeSlots.map((slot) => (
                      <option key={slot.slot} value={slot.slot} disabled={!slot.available}>
                        {slot.slot} {slot.isPastTime ? '(Past)' : ''}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Form Fields */}
              <div className="space-y-3">
                <input
                  type="text"
                  name="name"
                  placeholder="Full Name"
                  value={bookingForm.name}
                  onChange={handleInputChange}
                  className="w-full p-3 rounded-lg bg-[#181d23] text-white border border-[#333] focus:border-teal-400 focus:outline-none transition"
                  required
                />
                <input
                  type="email"
                  name="email"
                  placeholder="Email"
                  value={bookingForm.email}
                  onChange={handleInputChange}
                  className="w-full p-3 rounded-lg bg-[#181d23] text-white border border-[#333] focus:border-teal-400 focus:outline-none transition"
                  required
                />
                <input
                  type="tel"
                  name="phone"
                  placeholder="Phone"
                  value={bookingForm.phone}
                  onChange={handleInputChange}
                  className="w-full p-3 rounded-lg bg-[#181d23] text-white border border-[#333] focus:border-teal-400 focus:outline-none transition"
                  required
                />
                <textarea
                  name="reason"
                  placeholder="Reason for visit"
                  value={bookingForm.reason}
                  onChange={handleInputChange}
                  className="w-full p-3 rounded-lg bg-[#181d23] text-white border border-[#333] focus:border-teal-400 focus:outline-none transition resize-none"
                  rows="3"
                  required
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  disabled={bookingLoading || !selectedDate || !selectedTimeSlot}
                  className="flex-1 bg-teal-500 hover:bg-teal-600 disabled:bg-gray-600 text-white font-bold py-3 px-6 rounded-lg transition"
                >
                  {bookingLoading ? 'Booking...' : 'Book Appointment'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowBookingModal(false)}
                  className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-3 px-6 rounded-lg transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DoctorDetails;
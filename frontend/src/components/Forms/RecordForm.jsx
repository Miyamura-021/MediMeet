import React, { useState, useEffect } from 'react';

const RecordForm = ({ initialValues, onSubmit, loading, error, onCancel }) => {
  const [formData, setFormData] = useState({
    patientName: '',
    doctorName: '',
    appointmentDate: '',
    timeSlot: '',
    reason: '',
    status: 'confirmed'
  });

  useEffect(() => {
    if (initialValues) {
      setFormData({
        patientName: initialValues.patientName || '',
        doctorName: initialValues.doctorName || '',
        appointmentDate: initialValues.appointmentDate ? new Date(initialValues.appointmentDate).toISOString().split('T')[0] : '',
        timeSlot: initialValues.timeSlot || '',
        reason: initialValues.reason || '',
        status: initialValues.status || 'confirmed'
      });
    }
  }, [initialValues]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const timeSlots = [
    '9:00 AM', '9:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM',
    '12:00 PM', '12:30 PM', '1:00 PM', '1:30 PM', '2:00 PM', '2:30 PM',
    '3:00 PM', '3:30 PM', '4:00 PM', '4:30 PM', '5:00 PM', '5:30 PM'
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-gray-300 text-sm font-medium mb-2">
            Patient Name *
          </label>
          <input
            type="text"
            name="patientName"
            value={formData.patientName}
            onChange={handleChange}
            required
            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-teal-400 transition-colors duration-200"
            placeholder="Enter patient name"
          />
        </div>

        <div>
          <label className="block text-gray-300 text-sm font-medium mb-2">
            Doctor Name *
          </label>
          <input
            type="text"
            name="doctorName"
            value={formData.doctorName}
            onChange={handleChange}
            required
            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-teal-400 transition-colors duration-200"
            placeholder="Enter doctor name"
          />
        </div>

        <div>
          <label className="block text-gray-300 text-sm font-medium mb-2">
            Appointment Date *
          </label>
          <input
            type="date"
            name="appointmentDate"
            value={formData.appointmentDate}
            onChange={handleChange}
            required
            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-teal-400 transition-colors duration-200"
          />
        </div>

        <div>
          <label className="block text-gray-300 text-sm font-medium mb-2">
            Time Slot *
          </label>
          <select
            name="timeSlot"
            value={formData.timeSlot}
            onChange={handleChange}
            required
            className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-teal-400 transition-colors duration-200"
          >
            <option value="" className="bg-gray-700 text-white">Select time slot</option>
            {timeSlots.map(slot => (
              <option key={slot} value={slot} className="bg-gray-700 text-white">{slot}</option>
            ))}
          </select>
        </div>

        <div className="md:col-span-2">
          <label className="block text-gray-300 text-sm font-medium mb-2">
            Reason for Visit *
          </label>
          <textarea
            name="reason"
            value={formData.reason}
            onChange={handleChange}
            required
            rows="3"
            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-teal-400 transition-colors duration-200"
            placeholder="Enter reason for visit"
          />
        </div>

        <div>
          <label className="block text-gray-300 text-sm font-medium mb-2">
            Status
          </label>
          <select
            name="status"
            value={formData.status}
            onChange={handleChange}
            className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-teal-400 transition-colors duration-200"
          >
            <option value="confirmed" className="bg-gray-700 text-white">Confirmed</option>
            <option value="pending" className="bg-gray-700 text-white">Pending</option>
            <option value="cancelled" className="bg-gray-700 text-white">Cancelled</option>
            <option value="completed" className="bg-gray-700 text-white">Completed</option>
          </select>
        </div>
      </div>

      <div className="flex gap-4 pt-4">
        <button
          type="submit"
          disabled={loading}
          className="flex-1 bg-teal-500 hover:bg-teal-600 disabled:bg-teal-500/50 text-white font-bold py-3 px-6 rounded-lg transition-all duration-200 hover:scale-105 shadow-lg flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full"></div>
              {initialValues ? 'Updating...' : 'Adding...'}
            </>
          ) : (
            <>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              {initialValues ? 'Update Record' : 'Add Record'}
            </>
          )}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white font-bold rounded-lg transition-all duration-200 hover:scale-105 shadow-lg"
        >
          Cancel
        </button>
      </div>
    </form>
  );
};

export default RecordForm; 
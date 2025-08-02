import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

const API_URL = 'http://localhost:5000/api';

const DoctorDetails = () => {
  const { id } = useParams();
  const [doctor, setDoctor] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_URL}/doctors/${id}`)
      .then(res => res.json())
      .then(data => {
        setDoctor(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="text-center py-10 text-white">Loading...</div>;
  if (!doctor) return <div className="text-center py-10 text-red-400">Doctor not found.</div>;

  return (
    <div className="w-full min-h-screen bg-[#181d23] flex flex-col items-center py-12 px-2">
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
              onClick={() => window.location.href = '/#contact'}
            >
              Make an Appointment
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
    </div>
  );
};

export default DoctorDetails;
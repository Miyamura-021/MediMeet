import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
// Removed: import doctors from "../../assets/data/doctors";

const renderStars = (rating = 0) => {
  const stars = [];
  for (let i = 1; i <= 5; i++) {
    stars.push(
      <svg
        key={i}
        className={`w-5 h-5 inline-block ${i <= rating ? 'text-yellow-400' : 'text-gray-300'}`}
        fill="currentColor"
        viewBox="0 0 20 20"
      >
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.967a1 1 0 00.95.69h4.175c.969 0 1.371 1.24.588 1.81l-3.38 2.455a1 1 0 00-.364 1.118l1.287 3.966c.3.922-.755 1.688-1.54 1.118l-3.38-2.454a1 1 0 00-1.175 0l-3.38 2.454c-.784.57-1.838-.196-1.54-1.118l1.287-3.966a1 1 0 00-.364-1.118L2.05 9.394c-.783-.57-.38-1.81.588-1.81h4.175a1 1 0 00.95-.69l1.286-3.967z" />
      </svg>
    );
  }
  return stars;
};

const Doctors = () => {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetch("http://localhost:5000/api/doctors")
      .then((res) => res.json())
      .then((data) => {
        setDoctors(data.doctors || []);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to fetch doctors:", err);
        setLoading(false);
      });
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <div className="max-w-6xl w-full grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 md:gap-8 py-6 sm:py-8 md:py-10 px-4 sm:px-6">
      {doctors.map((doctor) => (
        <div
          key={doctor._id}
          className="bg-[#23282f] rounded-2xl shadow-lg flex flex-col items-center p-3 sm:p-4 pt-4 sm:pt-6 min-w-[200px] sm:min-w-[220px] max-w-[250px] sm:max-w-[270px] mx-auto"
        >
          {/* Image */}
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full overflow-hidden border-2 sm:border-4 border-[#181d23] mb-2 sm:mb-3 flex items-center justify-center bg-gray-700">
            {doctor.photo ? (
              <img
                src={`http://localhost:5000${doctor.photo}`}
                alt={doctor.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <svg className="w-8 h-8 sm:w-10 sm:h-10 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
              </svg>
            )}
          </div>
          {/* Name */}
          <h3 className="text-white font-bold text-sm sm:text-base mb-1 text-center">Dr. {doctor.name}</h3>
          {/* Specialization */}
          <span className="text-teal-400 font-semibold mb-2 text-xs text-center block">{doctor.specialization || "General Practitioner"}</span>
          {/* Bio */}
          <p className="text-gray-300 text-xs mb-3 sm:mb-4 text-center min-h-[32px] sm:min-h-[40px]">{doctor.bio || "Experienced medical professional dedicated to providing quality healthcare services to patients."}</p>
          {/* View More Button */}
          <button
            className="w-full bg-teal-500 hover:bg-teal-600 text-white font-bold py-1.5 sm:py-2 rounded-lg transition-colors duration-300 text-xs sm:text-sm tracking-wide mt-auto"
            onClick={() => navigate(`/doctors/${doctor._id}`)}
          >
            View More
          </button>
        </div>
      ))}
    </div>
  );
};

export default Doctors;
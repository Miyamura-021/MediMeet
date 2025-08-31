import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

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
  const [filteredDoctors, setFilteredDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSpecialty, setSelectedSpecialty] = useState("");
  const [sortBy, setSortBy] = useState("name");
  const navigate = useNavigate();

  useEffect(() => {
    fetch("http://localhost:5000/api/doctors")
      .then((res) => res.json())
      .then((data) => {
        const doctorsList = data.doctors || [];
        setDoctors(doctorsList);
        setFilteredDoctors(doctorsList);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to fetch doctors:", err);
        setLoading(false);
      });
  }, []);

  // Filter and sort doctors
  useEffect(() => {
    let filtered = [...doctors];

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(doctor =>
        doctor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doctor.specialization?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doctor.bio?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by specialty
    if (selectedSpecialty) {
      filtered = filtered.filter(doctor =>
        doctor.specialization === selectedSpecialty
      );
    }

    // Sort doctors
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "name":
          return a.name.localeCompare(b.name);
        case "specialty":
          return (a.specialization || "").localeCompare(b.specialization || "");
        case "rating":
          return (b.averageRating || 0) - (a.averageRating || 0);
        case "experience":
          return (b.experiences?.length || 0) - (a.experiences?.length || 0);
        default:
          return 0;
      }
    });

    setFilteredDoctors(filtered);
  }, [doctors, searchTerm, selectedSpecialty, sortBy]);

  // Get unique specialties
  const specialties = [...new Set(doctors.map(doctor => doctor.specialization).filter(Boolean))];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-16 h-16 border-4 border-teal-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-400 text-xl">Loading doctors...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      {/* Header Section */}
      <div className="bg-[#23282f] py-16 sm:py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 text-center">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-white mb-4">
            Our Medical Experts
          </h1>
          <p className="text-gray-300 text-lg sm:text-xl max-w-3xl mx-auto">
            Meet our team of highly qualified and experienced healthcare professionals dedicated to providing exceptional medical care.
          </p>
        </div>
      </div>

      {/* Search and Filter Section */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        <div className="bg-[#181d23] rounded-2xl p-6 shadow-2xl border border-white/10">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="md:col-span-2">
              <label className="block text-gray-300 text-sm font-medium mb-2">Search Doctors</label>
              <div className="relative">
                <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  placeholder="Search by name, specialty, or bio..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-teal-400 transition-colors duration-200"
                />
              </div>
            </div>

            {/* Specialty Filter */}
            <div>
              <label className="block text-gray-300 text-sm font-medium mb-2">Specialty</label>
              <select
                value={selectedSpecialty}
                onChange={(e) => setSelectedSpecialty(e.target.value)}
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-teal-400 transition-colors duration-200"
              >
                <option value="" className="bg-gray-700 text-white">All Specialties</option>
                {specialties.map(specialty => (
                  <option key={specialty} value={specialty} className="bg-gray-700 text-white">{specialty}</option>
                ))}
              </select>
            </div>

            {/* Sort By */}
            <div>
              <label className="block text-gray-300 text-sm font-medium mb-2">Sort By</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-teal-400 transition-colors duration-200"
              >
                <option value="name" className="bg-gray-700 text-white">Name</option>
                <option value="specialty" className="bg-gray-700 text-white">Specialty</option>
                <option value="rating" className="bg-gray-700 text-white">Rating</option>
                <option value="experience" className="bg-gray-700 text-white">Experience</option>
              </select>
            </div>
          </div>

          {/* Results Count */}
          <div className="mt-4 pt-4 border-t border-white/10">
            <p className="text-gray-400 text-sm">
              Showing {filteredDoctors.length} of {doctors.length} doctors
            </p>
          </div>
        </div>
      </div>

      {/* Doctors Grid */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 pb-16">
        {filteredDoctors.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-24 h-24 mx-auto mb-6 bg-gray-600/20 rounded-full flex items-center justify-center">
              <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">No Doctors Found</h3>
            <p className="text-gray-400">Try adjusting your search criteria or filters.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredDoctors.map((doctor) => (
              <div
                key={doctor._id}
                className="bg-[#181d23] rounded-2xl shadow-2xl hover:shadow-teal-500/20 transition-all duration-300 hover:scale-105 border border-white/10 overflow-hidden group"
              >
                {/* Image Section */}
                <div className="relative h-48 overflow-hidden">
                  {doctor.photo ? (
                    <img
                      src={`http://localhost:5000${doctor.photo}`}
                      alt={doctor.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-teal-500 to-blue-600 flex items-center justify-center">
                      <svg className="w-20 h-20 text-white/80" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                      </svg>
                    </div>
                  )}
                  <div className="absolute top-3 right-3">
                    {doctor.featured && (
                      <span className="bg-yellow-500 text-white px-2 py-1 rounded-full text-xs font-semibold">
                        Featured
                      </span>
                    )}
                  </div>
                </div>

                {/* Content Section */}
                <div className="p-6">
                  {/* Name and Specialization */}
                  <div className="text-center mb-4">
                    <h3 className="text-xl font-bold text-white mb-2 group-hover:text-teal-400 transition-colors duration-200">
                      Dr. {doctor.name}
                    </h3>
                    <span className="inline-block bg-teal-500/20 text-teal-400 px-3 py-1 rounded-full text-sm font-semibold">
                      {doctor.specialization || "General Practitioner"}
                    </span>
                  </div>

                  {/* Bio */}
                  <p className="text-gray-300 text-sm text-center mb-4 line-clamp-3 min-h-[60px]">
                    {doctor.bio || "Experienced medical professional dedicated to providing quality healthcare services to patients."}
                  </p>

                  {/* Rating */}
                  {doctor.averageRating > 0 && (
                    <div className="flex items-center justify-center gap-1 mb-4">
                      {renderStars(doctor.averageRating)}
                      <span className="text-gray-400 text-sm ml-2">
                        ({doctor.averageRating.toFixed(1)})
                      </span>
                    </div>
                  )}

                  {/* Experience */}
                  {doctor.experiences && doctor.experiences.length > 0 && (
                    <div className="text-center mb-4">
                      <p className="text-gray-400 text-xs">
                        {doctor.experiences.length} year{doctor.experiences.length !== 1 ? 's' : ''} of experience
                      </p>
                    </div>
                  )}

                  {/* View More Button */}
                  <button
                    className="w-full bg-teal-500 hover:bg-teal-600 text-white font-bold py-3 rounded-lg transition-all duration-200 hover:scale-105 shadow-lg flex items-center justify-center gap-2 group"
                    onClick={() => navigate(`/doctors/${doctor._id}`)}
                  >
                    View Profile
                    <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Doctors;
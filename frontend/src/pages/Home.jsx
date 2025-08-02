import React, { useEffect, useState, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import home1 from "../assets/images/home1.jpeg";
import home2 from "../assets/images/home2.jpg";
import { FaHospitalAlt } from "react-icons/fa";
import about1 from "../assets/images/about1.png";
import about2 from "../assets/images/about2.jpg";
import doc1 from '../assets/images/doc1.jpg';
import doc2 from '../assets/images/doc2.jpg';
import doc3 from '../assets/images/doc3.jpg';
import doc4 from '../assets/images/doc4.jpg';
import contactImg from "../assets/images/contact.jpg";
// Service images
import psychiatristImg from "../assets/images/psychiatrist.jpeg";
import cardiologyImg from "../assets/images/cardiology.jpg";
import immunologyImg from "../assets/images/immunology.jpg";

const heroSlides = [
  {
    id: 1,
    image: home1,
    align: "left",
    headline: (
      <>
        {/* MEDIMEET text at top */}
        <div className="mb-3 flex items-center gap-2">
          <svg width="40" height="40" className="text-[#2de1c2]" fill="none" viewBox="0 0 48 48">
            <path d="M24 4v40M4 24h40" stroke="#2de1c2" strokeWidth="3" strokeLinecap="round"/>
          </svg>
          <span className="uppercase text-[#2de1c2] text-lg font-semibold tracking-widest">MEDIMEET</span>
        </div>
        <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold text-white leading-tight tracking-tight mb-4 text-left">
          Your Health,<br />
          Our Priority<br />
          <span className="text-[#2de1c2]">Expert Care</span>,<br />
          <span className="text-[#2de1c2]">Just a Click Away</span>
        </h1>
      </>
    ),
    subheadline: null,
    description: (
      <p className="text-gray-300 text-lg md:text-xl lg:text-2xl mb-8 lg:mb-12 max-w-2xl text-left">
        Access expert medical care from the comfort of your home.<br />
        Fast, easy, and secure appointment booking for you and your family.
      </p>
    ),
    button: (
      <button
        className="border-2 border-teal-400 bg-transparent text-teal-400 font-bold px-10 py-4 rounded-xl shadow-lg transition text-lg tracking-wide hover:bg-teal-500 hover:text-white focus:outline-none focus:ring-2 focus:ring-teal-400 text-left"
      >
        Book Your Appointment
      </button>
    ),
    anim: [
      'translate-x-16',
      'translate-x-16',
      'translate-x-16',
      'translate-x-16',
    ]
  },
  {
    id: 2,
    image: home2,
    align: "right",
    headline: (
      <>
        <div className="flex items-center gap-3 mb-2 justify-end">
          <svg width="32" height="32" className="text-[#2de1c2]" fill="none" viewBox="0 0 48 48">
            <path d="M24 4v40M4 24h40" stroke="#2de1c2" strokeWidth="3" strokeLinecap="round"/>
          </svg>
          <span className="uppercase text-white text-lg font-semibold tracking-widest">We Give You The Best!</span>
        </div>
        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-extrabold text-white leading-tight tracking-tight text-right mb-2">
          Medical Services<br />
          <span className="text-[#2de1c2]">That You Can Trust</span>
        </h1>
      </>
    ),
    subheadline: null,
    description: (
      <p className="text-gray-300 text-base md:text-lg lg:text-xl xl:text-2xl mb-6 lg:mb-10 text-right max-w-2xl ml-auto">
        Need professional help? Our support staff<br /> will answer your questions.<br />
        Visit us Now or Make an Appointment!
      </p>
    ),
    button: (
      <button
        className="border-2 border-teal-400 bg-transparent text-teal-400 font-bold px-6 py-3 rounded-lg shadow transition text-base tracking-wide hover:bg-teal-500 hover:text-white focus:outline-none focus:ring-2 focus:ring-teal-400"
      >
        Make an Appointment!
      </button>
    ),
    anim: [
      '-translate-x-16',
      '-translate-x-16',
    ]
  },
];

const Home = () => {
  const [showHeadline, setShowHeadline] = useState(false);
  const [showQuality, setShowQuality] = useState(false);
  const [showSub, setShowSub] = useState(false);
  const [showButton, setShowButton] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [contentVisible, setContentVisible] = useState(true);
  const location = useLocation();
  const contactRef = useRef(null);
  const [showLoginPopup, setShowLoginPopup] = useState(false);
  const [animHeadline, setAnimHeadline] = useState(false);
  const [animSub, setAnimSub] = useState(false);
  const [animDesc, setAnimDesc] = useState(false);
  const [animButton, setAnimButton] = useState(false);
  const [doctors, setDoctors] = useState([]);
  const [loadingDoctors, setLoadingDoctors] = useState(true);
  const [selectedDate, setSelectedDate] = useState('');
  const [availableTimeSlots, setAvailableTimeSlots] = useState([]);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState('');

  useEffect(() => {
    setTimeout(() => setShowHeadline(true), 800);
    setTimeout(() => setShowQuality(true), 1300);
    setTimeout(() => setShowSub(true), 1700);
    setTimeout(() => setShowButton(true), 2100);
  }, []);

  // Fetch doctors from backend
  useEffect(() => {
    fetch("http://localhost:5000/api/doctors")
      .then((res) => res.json())
      .then((data) => {
        setDoctors(data.doctors || []);
        setLoadingDoctors(false);
      })
      .catch((err) => {
        console.error("Failed to fetch doctors:", err);
        setLoadingDoctors(false);
      });
  }, []);

  useEffect(() => {
    // Scroll to #home section on mount or when navigated to /
    if (location.pathname === "/") {
      const homeSection = document.getElementById("home");
      if (homeSection) {
        homeSection.scrollIntoView({ behavior: "smooth" });
      }
    }
  }, [location.pathname]);

  // Animation trigger on slide/content change
  useEffect(() => {
    setAnimHeadline(false);
    setAnimSub(false);
    setAnimDesc(false);
    setAnimButton(false);
    const t1 = setTimeout(() => setAnimHeadline(true), 800); // 0.8s
    const t2 = setTimeout(() => setAnimSub(true), 1200);    // 1.2s
    const t3 = setTimeout(() => setAnimDesc(true), 2000);   // 2s
    const t4 = setTimeout(() => setAnimButton(true), 2800); // 2.8s
    return () => {
      clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); clearTimeout(t4);
    };
  }, [currentSlide, contentVisible]);

  // Carousel autoplay (with content transition)
  useEffect(() => {
    const timer = setInterval(() => {
      setContentVisible(false);
      setTimeout(() => {
        setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
        setContentVisible(true);
      }, 400); // 400ms fade out before slide change
    }, 12000); // 12s per slide
    return () => clearInterval(timer);
  }, []);

  // Manual slide change (with content transition)
  const goToSlide = (idx) => {
    setContentVisible(false);
    setTimeout(() => {
      setCurrentSlide(idx);
      setContentVisible(true);
    }, 400);
  };

  const slide = heroSlides[currentSlide];

  // Doctor data array for easy backend integration
  // const doctors = [
  //   {
  //     id: 1,
  //     name: "Dr. Roy Coleman",
  //     specialization: "Cardiologist Specialist",
  //     image: doc1,
  //   },
  //   {
  //     id: 2,
  //     name: "Dr. Andrew Bert",
  //     specialization: "Neurology Specialist",
  //     image: doc3, // swapped
  //   },
  //   {
  //     id: 3,
  //     name: "Dr. Teresa Mayer",
  //     specialization: "Senior Pathologist",
  //     image: doc2, // swapped
  //   },
  //   {
  //     id: 4,
  //     name: "Dr. Robert Burton",
  //     specialization: "Senior Dr. at MediMeet",
  //     image: doc4,
  //   },
  // ];

  // Scroll to contact section
  const scrollToContact = () => {
    if (contactRef.current) {
      contactRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  // Contact form submit handler
  const handleContactSubmit = (e) => {
    e.preventDefault();
    if (!localStorage.getItem("token")) {
      setShowLoginPopup(true);
      return;
    }
    // ... handle actual submission here ...
  };

    return (
      <>
        <div className="bg-[#102733] min-h-screen w-full font-sans">
      {/* Hero Carousel Section */}
      <div className="relative w-full h-screen flex items-stretch overflow-hidden" id="home">
        {/* Background Image */}
        <img
          src={slide.image}
          alt="Doctors"
          className="absolute inset-0 w-full h-full object-cover object-right"
          style={{ zIndex: 1 }}
        />
        {/* Gradient Overlay (right to left) */}
        <div
          className="absolute inset-0 w-full h-full"
          style={{
            zIndex: 2,
            background:
              slide.align === "left"
                ? "linear-gradient(90deg, rgba(16,39,51,0.92) 55%, rgba(16,39,51,0.7) 70%, rgba(44,255,224,0.10) 100%)"
                : slide.align === "right"
                ? "linear-gradient(270deg, rgba(16,39,51,0.92) 55%, rgba(16,39,51,0.7) 70%, rgba(44,255,224,0.10) 100%)"
                : "linear-gradient(90deg, rgba(16,39,51,0.92) 55%, rgba(16,39,51,0.7) 70%, rgba(44,255,224,0.10) 100%)",
          }}
        />
        {/* Content */}
        <div
          className={`relative z-10 flex flex-col justify-center ${slide.align === 'right' ? 'items-end text-right' : 'items-start text-left'} w-full px-4 sm:px-6 md:px-8 lg:px-16 py-6 md:py-10`}
          style={slide.align === "right" ? { marginLeft: "auto" } : { }}
        >
          {/* Shadowed content background for right-aligned slide */}
          {slide.align === "right" && (
            <div className="absolute inset-0 bg-black bg-opacity-40 rounded-2xl shadow-2xl -z-10" />
          )}
          {/* Animated content rows */}
          {currentSlide === 0 ? (
            <>
              {/* Headline */}
              <div className={`transition-all duration-700 ${animHeadline ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-16'}`}>
                {typeof slide.headline === 'function' ? slide.headline(false) : slide.headline}
              </div>
              {/* Subheadline */}
              {slide.subheadline && (
                <div className={`transition-all duration-700 ${animSub ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-16'}`}>
                  {slide.subheadline}
                </div>
              )}
              {/* Description */}
              <div className={`transition-all duration-700 ${animDesc ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-10'}`}>
                {slide.description}
              </div>
              {/* Button */}
              <div className={`transition-all duration-700 ${animButton ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
                <button
                  className="border-2 border-teal-400 bg-transparent text-teal-400 font-bold px-4 sm:px-5 py-2 rounded-lg shadow transition text-sm sm:text-base tracking-wide hover:bg-teal-500 hover:text-white focus:outline-none focus:ring-2 focus:ring-teal-400"
                  onClick={scrollToContact}
                >
                  Book Your Appointment
                </button>
              </div>
            </>
          ) : (
            <>
              {/* Headline (words animate in) */}
              <div className={`transition-all duration-700 ${animHeadline ? 'opacity-100 -translate-y-0' : 'opacity-0 -translate-y-10'}`}>
                {typeof slide.headline === 'function' ? slide.headline(!animHeadline) : slide.headline}
              </div>
              {/* Description */}
              <div className={`transition-all duration-700 ${animDesc ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-10'}`}>
                {slide.description}
              </div>
              {/* Button */}
              <div className={`transition-all duration-700 ${animButton ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
                <button
                  className="border-2 border-teal-400 bg-transparent text-teal-400 font-bold px-4 sm:px-5 py-2 rounded-lg shadow transition text-sm sm:text-base tracking-wide hover:bg-teal-500 hover:text-white focus:outline-none focus:ring-2 focus:ring-teal-400"
                  onClick={scrollToContact}
                >
                  MAKE AN APPOINTMENT!
                </button>
              </div>
            </>
          )}
        </div>
        {/* Carousel Arrows */}
        <button
          className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 bg-black bg-opacity-40 hover:bg-opacity-70 text-white rounded-full w-8 h-8 sm:w-12 sm:h-12 flex items-center justify-center z-20"
          onClick={() => goToSlide((currentSlide - 1 + heroSlides.length) % heroSlides.length)}
        >
          <svg width="16" height="16" className="sm:w-6 sm:h-6" fill="none" viewBox="0 0 24 24">
            <path d="M15 19l-7-7 7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        <button
          className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 bg-black bg-opacity-40 hover:bg-opacity-70 text-white rounded-full w-8 h-8 sm:w-12 sm:h-12 flex items-center justify-center z-20"
          onClick={() => goToSlide((currentSlide + 1) % heroSlides.length)}
        >
          <svg width="16" height="16" className="sm:w-6 sm:h-6" fill="none" viewBox="0 0 24 24">
            <path d="M9 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </div>
      {/* About Section */}
      <section id="about" className="relative w-full bg-[#181d23] py-12 sm:py-16 md:py-20 px-4 sm:px-6 md:px-0 flex justify-center items-center">
        <div className="max-w-6xl w-full flex flex-col lg:flex-row items-center gap-8 sm:gap-12 md:gap-20">
          {/* Responsive Images: stacked on mobile, overlap on desktop */}
          <div className="flex-1 flex justify-center items-center w-full lg:w-auto mb-6 lg:mb-0 relative min-h-[260px] sm:min-h-[320px] md:min-h-[420px] lg:min-h-[500px]">
            {/* Mobile/Tablet: only about2, no overlap */}
            <img
              src={about2}
              alt="About"
              className="block lg:hidden w-full max-w-xs sm:max-w-sm md:max-w-md rounded shadow-2xl object-cover"
            />
            {/* Desktop: overlapping images */}
            <>
              <div className="hidden lg:block absolute left-0 top-0 w-80 h-80 md:w-[22rem] md:h-[22rem] rounded overflow-hidden z-0" style={{background: 'repeating-linear-gradient(0deg, #23282f 0px, #23282f 2px, transparent 2px, transparent 20px), repeating-linear-gradient(90deg, #23282f 0px, #23282f 2px, transparent 2px, transparent 20px)'}}>
                <img src={about1} alt="About 1" className="w-full h-full object-cover rounded" />
                <button className="absolute left-0 bottom-0 m-4 px-6 py-2 bg-teal-500 hover:bg-teal-600 text-white font-bold rounded shadow font-sans text-sm tracking-wide">GET IT KNOW <span className="ml-1">&gt;</span></button>
              </div>
              <div className="hidden lg:block absolute left-40 top-24 w-80 h-80 md:w-[22rem] md:h-[22rem] rounded overflow-hidden border-4 border-white shadow-2xl z-10">
                <img src={about2} alt="About 2" className="w-full h-full object-cover rounded" />
              </div>
            </>
          </div>
          {/* Text Content */}
          <div className="flex-1 flex flex-col items-start">
            <span className="uppercase text-teal-400 text-xs sm:text-sm font-semibold tracking-widest mb-2">Our Medical</span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold text-white mb-3 sm:mb-4">We're Setting the Standards in Research & Clinical Care</h2>
            <p className="text-gray-300 text-sm sm:text-base md:text-lg mb-4 sm:mb-6 max-w-xl">We provide the most full medical services, so every person could have the opportunity to receive qualitative medical help. Our Clinic has grown to provide a world class facility for the treatment of tooth loss, dental cosmetics and bore advanced restos qualified implant providers in the AUS with over 30 years of quality training and experience.</p>
            <div className="mb-6 sm:mb-8 w-full">
              <span className="block text-white font-bold mb-2 text-sm sm:text-base">MediMeet Special Features</span>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4">
                <li className="flex items-center gap-2 sm:gap-3 text-teal-400 font-medium text-xs sm:text-sm"><span className="w-2 h-2 sm:w-3 sm:h-3 bg-teal-400 rounded-full inline-block"></span>Adult Trauma Center</li>
                <li className="flex items-center gap-2 sm:gap-3 text-teal-400 font-medium text-xs sm:text-sm"><span className="w-2 h-2 sm:w-3 sm:h-3 bg-teal-400 rounded-full inline-block"></span>Children's Trauma Center</li>
                <li className="flex items-center gap-2 sm:gap-3 text-teal-400 font-medium text-xs sm:text-sm"><span className="w-2 h-2 sm:w-3 sm:h-3 bg-teal-400 rounded-full inline-block"></span>Birthing and Lactation Class</li>
                <li className="flex items-center gap-2 sm:gap-3 text-teal-400 font-medium text-xs sm:text-sm"><span className="w-2 h-2 sm:w-3 sm:h-3 bg-teal-400 rounded-full inline-block"></span>Heart and Vascular Institute</li>
                <li className="flex items-center gap-2 sm:gap-3 text-teal-400 font-medium text-xs sm:text-sm"><span className="w-2 h-2 sm:w-3 sm:h-3 bg-teal-400 rounded-full inline-block"></span>Dental and Oral Surgery</li>
                <li className="flex items-center gap-2 sm:gap-3 text-teal-400 font-medium text-xs sm:text-sm"><span className="w-2 h-2 sm:w-3 sm:h-3 bg-teal-400 rounded-full inline-block"></span>Plastic Surgery</li>
              </ul>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 w-full">
              <button className="bg-[#23282f] hover:bg-teal-600 text-white font-bold px-6 sm:px-8 py-2.5 sm:py-3 rounded shadow transition text-sm sm:text-base tracking-wide border border-[#23282f]">GET IT KNOW <span className="ml-1">&gt;</span></button>
              <button className="bg-teal-500 hover:bg-teal-600 text-white font-bold px-6 sm:px-8 py-2.5 sm:py-3 rounded shadow transition text-sm sm:text-base tracking-wide" onClick={scrollToContact}>Contact Us!</button>
            </div>
          </div>
        </div>
      </section>
      {/* Services Section */}
      <section id="services" className="relative w-full bg-[#162029] py-12 sm:py-16 md:py-20 px-4 sm:px-6 md:px-0 flex flex-col items-center">
        <div className="max-w-4xl w-full flex flex-col items-center mb-8 sm:mb-12">
          <span className="uppercase text-teal-400 text-xs sm:text-sm font-semibold tracking-widest mb-2">Our Services</span>
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold text-white mb-2 text-center">Special High-quality Services</h2>
          <p className="text-gray-300 text-sm sm:text-base md:text-lg mb-4 sm:mb-6 max-w-2xl text-center">Since its founding MediMeet has been providing its patients with the full medical care, encompassing outpatients services, neurology, laboratory, imaging diagnostics and more.</p>
        </div>
        <div className="max-w-6xl w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {/* Card 1 */}
          <div className="bg-[#181d23] rounded shadow-lg overflow-hidden flex flex-col">
            <img src={psychiatristImg} alt="Psychiatry" className="w-full h-40 sm:h-56 object-cover" />
            <div className="p-4 sm:p-6 flex-1 flex flex-col">
              <h3 className="text-lg sm:text-xl font-bold text-white mb-2">Psychiatry</h3>
              <p className="text-gray-300 mb-4 flex-1 text-sm sm:text-base">Our Psychiatry department utilizes state-of-the-art technology and employs a team of true experts in mental health care.</p>
              <a href="#" className="text-teal-400 font-bold uppercase text-xs sm:text-sm tracking-wide hover:underline">Read More</a>
            </div>
          </div>
          {/* Card 2 */}
          <div className="bg-[#181d23] rounded shadow-lg overflow-hidden flex flex-col">
            <img src={cardiologyImg} alt="Cardiology" className="w-full h-40 sm:h-56 object-cover" />
            <div className="p-4 sm:p-6 flex-1 flex flex-col">
              <h3 className="text-lg sm:text-xl font-bold text-white mb-2">Cardiology</h3>
              <p className="text-gray-300 mb-4 flex-1 text-sm sm:text-base">Our Cardiology hospital utilizes state-of-the-art technology and employs a team of true experts in heart care.</p>
              <a href="#" className="text-teal-400 font-bold uppercase text-xs sm:text-sm tracking-wide hover:underline">Read More</a>
            </div>
          </div>
          {/* Card 3 */}
          <div className="bg-[#181d23] rounded shadow-lg overflow-hidden flex flex-col md:col-span-2 lg:col-span-1">
            <img src={immunologyImg} alt="Immunology" className="w-full h-40 sm:h-56 object-cover" />
            <div className="p-4 sm:p-6 flex-1 flex flex-col">
              <h3 className="text-lg sm:text-xl font-bold text-white mb-2">Immunology</h3>
              <p className="text-gray-300 mb-4 flex-1 text-sm sm:text-base">Our Immunology department utilizes state-of-the-art technology and employs a team of true experts in immune system care.</p>
              <a href="#" className="text-teal-400 font-bold uppercase text-xs sm:text-sm tracking-wide hover:underline">Read More</a>
            </div>
          </div>
        </div>
      </section>
      {/* Our Doctors Section */}
      <section id="doctors" className="relative w-full bg-[#181d23] py-12 sm:py-16 md:py-20 px-4 sm:px-6 md:px-0 flex flex-col items-center">
        <div className="max-w-4xl w-full flex flex-col items-center mb-8 sm:mb-12">
          <span className="uppercase text-teal-400 text-xs sm:text-sm font-semibold tracking-widest mb-2">Meet Our Experienced Team</span>
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold text-white mb-2 text-center">Our Dedicated Doctors Team</h2>
          <p className="text-gray-300 text-sm sm:text-base md:text-lg mb-4 sm:mb-6 max-w-2xl text-center">We offer extensive medical procedures to outbound and inbound patients. We are very proud of achievement of our staff. We all work together to help all our patients for recovery.</p>
        </div>
        <div className="max-w-6xl w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          {loadingDoctors ? (
            <div className="col-span-full text-center text-white">Loading doctors...</div>
          ) : doctors.length === 0 ? (
            <div className="col-span-full text-center text-white">No doctors found.</div>
          ) : (
            doctors.map((doc) => (
              <div key={doc._id} className="bg-[#23282f] rounded shadow-lg overflow-hidden flex flex-col items-center pb-4 sm:pb-6">
                <div className="w-full aspect-square bg-[#23282f] flex items-center justify-center">
                  <img
                    src={doc.photo ? `http://localhost:5000${doc.photo}` : '/default-avatar.png'}
                    alt={doc.name}
                    className="w-full h-full object-cover rounded border-2 border-[#23282f]"
                  />
                </div>
                <div className="flex-1 flex flex-col items-center mt-3 sm:mt-4 px-2 sm:px-4">
                  <span className="text-teal-400 font-semibold mb-1 text-xs sm:text-sm text-center">{doc.specialization || 'Specialist'}</span>
                  <Link to={`/doctors/${doc._id}`} className="text-white font-bold text-base sm:text-lg lg:text-xl hover:text-teal-400 transition text-center block">{doc.name}</Link>
                </div>
              </div>
            ))
          )}
        </div>
        <div className="w-full flex justify-center mt-8 sm:mt-12">
          <Link
            to="/doctors"
            className="border-2 border-teal-400 bg-transparent text-teal-400 font-bold px-4 sm:px-5 py-2 rounded-lg shadow transition text-sm sm:text-base tracking-wide hover:bg-teal-500 hover:text-white focus:outline-none focus:ring-2 focus:ring-teal-400 inline-block"
          >
            View More
          </Link>
        </div>
      </section>
      {/* Contact Section */}
      <section id="contact" ref={contactRef} className="relative w-full bg-[#181d23] py-12 sm:py-16 md:py-20 px-4 sm:px-6 md:px-0 flex justify-center items-center">
        <div className="max-w-5xl w-full flex flex-col lg:flex-row items-center gap-8 sm:gap-12 md:gap-20 bg-[#181d23] rounded-2xl shadow-2xl overflow-hidden">
          {/* Left: Image */}
          <div className="flex-1 flex items-center justify-center min-w-[250px] sm:min-w-[300px] h-[300px] sm:h-[400px] md:h-[500px] bg-[#23282f]">
            <img src={contactImg} alt="Contact" className="w-full h-full object-cover rounded-l-2xl" />
          </div>
          {/* Right: Form */}
          <div className="flex-1 flex flex-col items-center justify-center p-4 sm:p-6 md:p-8">
            <span className="uppercase text-teal-400 text-xs sm:text-sm font-semibold tracking-widest mb-2">Contact Us</span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold text-white mb-3 sm:mb-4">Make an Appointment</h2>
            <p className="text-gray-300 text-sm sm:text-base md:text-lg mb-4 sm:mb-6 max-w-xl text-center">Contact us any suitable way and make an appointment with the doctor whose help you need! Visit us at the scheduled time.</p>
            <form className="w-full max-w-xl grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6" onSubmit={handleContactSubmit}>
              <input type="text" placeholder="Full Name" className="col-span-1 px-3 sm:px-4 py-2.5 sm:py-3 rounded bg-[#23282f] text-white placeholder-gray-400 focus:outline-none text-sm sm:text-base" />
              <input type="email" placeholder="Email Address" className="col-span-1 px-3 sm:px-4 py-2.5 sm:py-3 rounded bg-[#23282f] text-white placeholder-gray-400 focus:outline-none text-sm sm:text-base" />
              <input type="text" placeholder="Phone" className="col-span-1 px-3 sm:px-4 py-2.5 sm:py-3 rounded bg-[#23282f] text-white placeholder-gray-400 focus:outline-none text-sm sm:text-base" />
              <select className="col-span-1 px-3 sm:px-4 py-2.5 sm:py-3 rounded bg-[#23282f] text-white focus:outline-none text-sm sm:text-base">
                <option>Select Department</option>
                <option>Cardiology</option>
                <option>Neurology</option>
                <option>Pathology</option>
                <option>General</option>
              </select>
              <input type="date" placeholder="Appointment Date" className="col-span-1 px-3 sm:px-4 py-2.5 sm:py-3 rounded bg-[#23282f] text-white placeholder-gray-400 focus:outline-none text-sm sm:text-base" />
              <input type="time" placeholder="Appointment Time" className="col-span-1 px-3 sm:px-4 py-2.5 sm:py-3 rounded bg-[#23282f] text-white placeholder-gray-400 focus:outline-none text-sm sm:text-base" />
              <button type="submit" className="col-span-1 sm:col-span-2 bg-teal-500 hover:bg-teal-600 text-white font-bold px-6 sm:px-8 py-2.5 sm:py-3 rounded shadow transition text-sm sm:text-base tracking-wide">GET A FREE CONSULTATION</button>
            </form>
            {/* Login Required Popup */}
            {showLoginPopup && (
              <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-60 z-50 animate-fadeIn">
                <div className="bg-[#181d23] border-2 border-teal-400 rounded-2xl shadow-2xl p-6 sm:p-8 text-center max-w-xs w-full mx-4">
                  <h3 className="text-lg sm:text-xl font-bold text-teal-400 mb-2">You must login first.</h3>
                  <button
                    className="mt-4 px-6 py-2 bg-teal-500 hover:bg-teal-600 text-white font-bold rounded-full shadow transition"
                    onClick={() => setShowLoginPopup(false)}
                  >
                    Close
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>
        </div>
      </>
    );
};

export default Home;

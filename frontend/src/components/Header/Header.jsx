import React from "react";
import { useLocation, Link } from "react-router-dom";
import { FaHeart } from "react-icons/fa";
import { useState } from "react";

const navLinks = [
  { name: "Home", path: "/" },
  { name: "About", path: "#about" },
  { name: "Services", path: "#services" },
  { name: "Our Doctors", path: "#doctors" },
  { name: "Contact Us", path: "#contact" },
  { name: "Blog", path: "/blog" },
];

const Header = ({ activeSection }) => {
  const location = useLocation();
  const [showProfile, setShowProfile] = useState(false);
  // Get user from localStorage
  const user = (() => {
    try {
      return JSON.parse(localStorage.getItem("user"));
    } catch {
      return null;
    }
  })();
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/login";
  };

  // Smooth scroll to section
  const handleScroll = (e, path) => {
    if (path.startsWith("#")) {
      e.preventDefault();
      const section = document.querySelector(path);
      if (section) {
        section.scrollIntoView({ behavior: "smooth" });
      }
    }
  };

  // Home link handler: if already on /, scroll to #home
  const handleHomeClick = (e) => {
    if (location.pathname === "/") {
      e.preventDefault();
      const section = document.getElementById("home");
      if (section) {
        section.scrollIntoView({ behavior: "smooth" });
      }
    }
  };

  return (
    <nav className="w-full bg-[#181d23] px-0 py-0 border-b border-[#23282f] shadow z-50 font-sans sticky top-0">
      <div className="max-w-full flex items-center justify-between px-12 md:px-24 py-4">
        {/* Logo (left) */}
        <Link to="/" className="flex items-center gap-2 select-none z-10">
          <FaHeart className="text-3xl text-teal-400" />
          <span className="text-2xl font-extrabold text-[#2de1c2] tracking-wide font-sans">MediMeet</span>
        </Link>
        {/* Nav Links + Profile/Login (right) */}
        <div className="flex items-center gap-8 md:gap-10">
          <div className="flex items-center gap-6 md:gap-8">
            {navLinks.map((link) => (
              link.name === "Home" ? (
                <Link
                  key={link.name}
                  to="/"
                  onClick={handleHomeClick}
                  className={`relative font-bold text-base uppercase tracking-wide font-sans transition ${activeSection === 'home'
                    ? 'text-teal-500'
                    : 'text-white hover:text-[#2de1c2] hover:underline'} `}
                >
                  {link.name}
                </Link>
              ) : link.path.startsWith("#") ? (
                <a
                  key={link.name}
                  href={link.path}
                  onClick={e => handleScroll(e, link.path)}
                  className={`relative font-bold text-base uppercase tracking-wide font-sans transition ${activeSection === link.path.substring(1)
                    ? 'text-teal-500'
                    : 'text-white hover:text-[#2de1c2] hover:underline'} `}
                >
                  {link.name}
                </a>
              ) : (
                <Link
                  key={link.name}
                  to={link.path}
                  className={`relative font-bold text-base uppercase tracking-wide font-sans transition ${location.pathname === link.path
                    ? 'text-teal-500'
                    : 'text-white hover:text-[#2de1c2] hover:underline'} `}
                >
                  {link.name}
                </Link>
              )
            ))}
          </div>
          {/* Profile or Login */}
          {user ? (
            <div className="relative z-10">
              <button
                className="ml-4 w-11 h-11 flex items-center justify-center rounded-full bg-[#23282f] border-2 border-teal-400 text-teal-400 font-bold text-xl shadow transition focus:outline-none focus:ring-2 focus:ring-teal-400 select-none"
                onClick={() => setShowProfile((v) => !v)}
                title={user.name}
              >
                {user.photo ? (
                  <img src={user.photo} alt="avatar" className="w-10 h-10 rounded-full object-cover" />
                ) : (
                  <span className="uppercase text-lg font-bold">
                    {user.name && user.name[0]}
                  </span>
                )}
              </button>
              {/* Profile Dropdown/Modal */}
              {showProfile && (
                <div className="absolute right-0 mt-3 w-72 bg-[#181d23] border-2 border-teal-400 rounded-2xl shadow-2xl p-6 z-50 animate-fadeIn">
                  <div className="flex flex-col items-center mb-4">
                    {user.photo ? (
                      <img src={user.photo} alt="avatar" className="w-16 h-16 rounded-full object-cover mb-2 border-2 border-teal-400" />
                    ) : (
                      <div className="w-16 h-16 rounded-full bg-teal-500 flex items-center justify-center text-white text-3xl font-extrabold mb-2">
                        {user.name && user.name[0]}
                      </div>
                    )}
                    <div className="text-teal-400 font-bold text-lg mb-1">{user.name}</div>
                    <div className="text-gray-300 text-sm mb-1">{user.email}</div>
                    <div className="text-gray-400 text-xs mb-1">Gender: {user.gender || "-"}</div>
                    <div className="text-gray-400 text-xs mb-1">Phone: {user.phone || "-"}</div>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="w-full bg-teal-500 hover:bg-teal-600 text-white font-bold py-2 rounded-full shadow transition mt-2"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link to="/login" className="z-10">
              <button className="ml-4 px-6 py-2 bg-teal-500 hover:bg-teal-600 text-white font-bold rounded-full shadow transition font-sans">
                Log In
              </button>
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Header;
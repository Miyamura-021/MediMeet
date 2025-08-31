import React from "react";
import { Link } from "react-router-dom";

const Footer = () => (
  <footer className="bg-[#181d23] border-t-2 border-teal-400 pt-12 pb-6 text-gray-300 font-sans">
    <div className="max-w-6xl mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-10 text-sm">
      {/* Brand & Social */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <span className="text-teal-400 text-2xl font-extrabold tracking-wide">MediMeet</span>
        </div>
        <p className="mb-4 text-gray-400">Empowering your health journey with modern care and compassion.</p>
        <div className="flex gap-3 mt-2">
          <a href="#" className="hover:text-teal-400 transition"><i className="fab fa-github text-xl"></i></a>
          <a href="#" className="hover:text-teal-400 transition"><i className="fab fa-facebook text-xl"></i></a>
          <a href="#" className="hover:text-teal-400 transition"><i className="fab fa-instagram text-xl"></i></a>
          <a href="#" className="hover:text-teal-400 transition"><i className="fab fa-linkedin text-xl"></i></a>
        </div>
      </div>
      {/* Quick Links */}
      <div>
        <h4 className="font-semibold mb-3 text-teal-400 uppercase tracking-wider">Quick Links</h4>
        <ul className="space-y-2">
          <li><Link to="/home" className="hover:text-teal-400 transition">Home</Link></li>
          <li><a href="#about" className="hover:text-teal-400 transition">About Us</a></li>
          <li><a href="#services" className="hover:text-teal-400 transition">Services</a></li>
          <li><Link to="/blog" className="hover:text-teal-400 transition">Blog</Link></li>
        </ul>
      </div>
      {/* Actions */}
      <div>
        <h4 className="font-semibold mb-3 text-teal-400 uppercase tracking-wider">I want to</h4>
        <ul className="space-y-2">
          <li><Link to="/doctors" className="hover:text-teal-400 transition">Find a Doctor</Link></li>
          <li><a href="#contact" className="hover:text-teal-400 transition">Request an Appointment</a></li>
          <li><a href="#" className="hover:text-teal-400 transition">Find a Location</a></li>
          <li><a href="#" className="hover:text-teal-400 transition">Get an Opinion</a></li>
        </ul>
      </div>
      {/* Support */}
      <div>
        <h4 className="font-semibold mb-3 text-teal-400 uppercase tracking-wider">Support</h4>
        <ul className="space-y-2">
          <li><a href="#" className="hover:text-teal-400 transition">Donate</a></li>
          <li><a href="#contact" className="hover:text-teal-400 transition">Contact Us</a></li>
        </ul>
      </div>
    </div>
    <div className="mt-10 border-t border-[#23282f] pt-6 text-center text-xs text-gray-500">
      &copy; {new Date().getFullYear()} MediMeet. All rights reserved.
    </div>
  </footer>
);

export default Footer;

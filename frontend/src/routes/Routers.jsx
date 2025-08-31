import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Home from '../pages/Home';

import Login from '../pages/Login';
import Signup from '../pages/Signup';
import DoctorSignup from '../pages/DoctorSignup';
import Doctors from '../pages/Doctors/Doctors';
import DoctorsDetails from '../pages/Doctors/DoctorsDetails';
import Profile from '../pages/Profile';
import Blog from '../pages/Blog';
import BlogDetail from '../pages/BlogDetail';


const Routers = () => {
    return (
        <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/home" element={<Home />} />
            
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/doctor-signup" element={<DoctorSignup />} />
           
            <Route path="/doctors" element={<Doctors />} />
            <Route path="/doctors/:id" element={<DoctorsDetails />} />
            <Route path="/profile" element={<Profile />} />
            
            <Route path="/blog" element={<Blog />} />
            <Route path="/blog/:slug" element={<BlogDetail />} />
        </Routes>
    );
};

export default Routers;

import React, { useState } from "react";
import signupGif from "../assets/images/signup.gif";
import { useNavigate } from "react-router-dom";

const Signup = () => {
  const [role, setRole] = useState("Patient");
  const [gender, setGender] = useState("Male");
  const [avatar, setAvatar] = useState(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();
  const [showSuccess, setShowSuccess] = useState(false);

  const handleSignup = async (e) => {
    e.preventDefault();
    setMessage("");
    try {
      const res = await fetch("http://localhost:5000/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          password,
          phone,
          gender: gender.toLowerCase(),
          role: role.toLowerCase(),
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setShowSuccess(true);
        setMessage("");
        setTimeout(() => {
          setShowSuccess(false);
          navigate("/home");
        }, 2000);
      } else {
        setMessage(data.error || "Signup failed");
      }
    } catch (err) {
      setMessage("Signup failed. Please try again.");
    }
  };

    return (
    <div className="min-h-[80vh] flex items-center justify-center bg-gradient-to-tr from-blue-50 via-white to-orange-50 py-8">
      <div className="flex flex-col md:flex-row bg-white rounded-3xl shadow-lg overflow-hidden max-w-4xl w-full">
        {/* Illustration */}
        <div className="flex-1 flex items-center justify-center bg-blue-600 p-8">
          <img
            src={signupGif}
            alt="Sign up illustration"
            className="w-72 h-72 object-contain"
          />
        </div>
        {/* Signup Form */}
        <div className="flex-1 p-8 flex flex-col justify-center">
          {/* Success Modal */}
          {showSuccess && (
            <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-60 z-50 transition-opacity animate-fadeIn">
              <div className="bg-[#181d23] rounded-2xl shadow-2xl p-10 text-center border-2 border-teal-400 flex flex-col items-center max-w-xs w-full">
                <div className="flex items-center justify-center w-16 h-16 rounded-full bg-teal-500 mb-4 animate-pop">
                  <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                </div>
                <h3 className="text-2xl font-extrabold mb-2 text-teal-400">Signup Successful!</h3>
                <p className="text-gray-200 mb-2">Redirecting to home page...</p>
              </div>
            </div>
          )}
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Create an <span className="text-blue-600">Account</span></h2>
          <form className="space-y-4" onSubmit={handleSignup}>
            <input
              type="text"
              placeholder="Full Name"
              className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={name}
              onChange={e => setName(e.target.value)}
              required
            />
            <input
              type="email"
              placeholder="Email"
              className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
            <input
              type="password"
              placeholder="Password"
              className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
            <input
              type="text"
              placeholder="Phone"
              className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={phone}
              onChange={e => setPhone(e.target.value)}
            />
            <div className="flex gap-4">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">Are you a:</label>
                <select
                  className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={role}
                  onChange={e => setRole(e.target.value)}
                >
                  <option>Patient</option>
                  <option>Doctor</option>
                </select>
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">Gender:</label>
                <select
                  className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={gender}
                  onChange={e => setGender(e.target.value)}
                >
                  <option>Male</option>
                  <option>Female</option>
                </select>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <label className="block text-sm font-medium text-gray-700">Avatar:</label>
              <input
                type="file"
                accept="image/*"
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                onChange={e => setAvatar(e.target.files[0])}
              />
              {avatar && (
                <img
                  src={URL.createObjectURL(avatar)}
                  alt="Avatar Preview"
                  className="w-10 h-10 rounded-full object-cover border border-blue-200"
                />
              )}
            </div>
            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-full flex items-center justify-center gap-2 transition"
            >
              Create Account
            </button>
          </form>
          {message && <div className="text-center text-sm text-red-500 mt-2">{message}</div>}
          <p className="text-gray-500 text-center mt-4">
            Already have an account?{' '}
            <a href="/login" className="text-blue-600 hover:underline">Login</a>
          </p>
        </div>
      </div>
    </div>
    );
};

export default Signup;
import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setMessage("");
    try {
      const res = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (res.ok && data.token) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));
        navigate("/home");
      } else {
        setMessage(data.error || "Login failed");
      }
    } catch (err) {
      setMessage("Login failed. Please try again.");
    }
  };

    return (
    <div className="min-h-[80vh] flex flex-col justify-between">
      <div className="flex flex-col items-center justify-center flex-1 py-16">
        <form
          onSubmit={handleLogin}
          className="bg-white shadow-xl rounded-2xl px-8 py-10 w-full max-w-md flex flex-col items-center"
        >
          <h2 className="text-xl font-bold text-gray-900 mb-6 text-center">
            Hello! <span className="text-blue-600">Welcome Back</span> <span role="img" aria-label="wave">👋</span>
          </h2>
          <input
            type="email"
            placeholder="admin@gmail.com"
            className="w-full mb-4 px-4 py-3 rounded-lg border border-gray-200 bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="********"
            className="w-full mb-6 px-4 py-3 rounded-lg border border-gray-200 bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
          />
          {message && <div className="text-center text-sm text-red-500 mt-2">{message}</div>}
          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition mb-2"
          >
            Login
          </button>
          <p className="text-gray-500 text-center mt-2">
            Don't have an account?{' '}
            <Link to="/signup" className="text-blue-600 hover:underline">Register</Link>
          </p>
        </form>
      </div>
    </div>
    );
};

export default Login;
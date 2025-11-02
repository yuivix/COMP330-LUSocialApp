import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const RegisterForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState('student');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const validateEmail = (email) => {
    return email.toLowerCase().endsWith('.edu');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validate email domain
    if (!validateEmail(email)) {
      setError('Please use a valid .edu email address');
      return;
    }

    // Validate password match
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    try {
      setLoading(true);
      await register(email, password, role);
      setSuccess('Registration successful! Please check your email to verify your account.');
      setTimeout(() => navigate('/login'), 3000);
    } catch (error) {
      if (error.message === 'Not implemented') {
        setError('Registration is currently unavailable while the backend is being set up. Please try again later.');
      } else {
        setError(error.message || 'Failed to register. Please try again.');
      }
      console.log('Registration error:', error); // For debugging
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-8">
      {/* LUTutor Banner */}
      <div className="bg-[#8B2332] text-white py-4 px-8 rounded-t-lg text-center">
        <h1 className="text-4xl font-bold tracking-wide">LUTutor</h1>
        <p className="text-sm mt-1 text-gray-200">Connecting Students with Expert Tutors</p>
      </div>
      
      <div className="p-8 bg-white rounded-b-lg shadow-xl border-l-4 border-r-4 border-b-4 border-[#8B2332]">
        <h2 className="text-3xl font-bold mb-2 text-center text-[#8B2332]">Create Account</h2>
        <p className="text-center text-gray-600 text-sm mb-6">Join as a student or tutor</p>
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 text-red-800 px-4 py-3 rounded mb-6" role="alert">
            <p className="font-medium">Error</p>
            <p className="text-sm">{error}</p>
          </div>
        )}
        {success && (
          <div className="bg-green-50 border-l-4 border-green-500 text-green-800 px-4 py-3 rounded mb-6" role="alert">
            <p className="font-medium">Success!</p>
            <p className="text-sm">{success}</p>
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
              Email Address <span className="text-[#8B2332]">(.edu required)</span>
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-md border border-gray-300 shadow-sm focus:border-[#8B2332] focus:ring-2 focus:ring-[#8B2332] focus:ring-opacity-50 transition duration-200"
              placeholder="you@university.edu"
              required
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2">
              Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-md border border-gray-300 shadow-sm focus:border-[#8B2332] focus:ring-2 focus:ring-[#8B2332] focus:ring-opacity-50 transition duration-200"
              placeholder="Create a strong password"
              required
            />
            <p className="mt-2 text-xs text-gray-600">
              Password must be at least 8 characters and include uppercase, lowercase, and a number
            </p>
          </div>
          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-semibold text-gray-700 mb-2">
              Confirm Password
            </label>
            <input
              type="password"
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-md border border-gray-300 shadow-sm focus:border-[#8B2332] focus:ring-2 focus:ring-[#8B2332] focus:ring-opacity-50 transition duration-200"
              placeholder="Re-enter your password"
              required
            />
          </div>
          <div>
            <label htmlFor="role" className="block text-sm font-semibold text-gray-700 mb-2">
              I am a...
            </label>
            <select
              id="role"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full px-4 py-3 rounded-md border border-gray-300 shadow-sm focus:border-[#8B2332] focus:ring-2 focus:ring-[#8B2332] focus:ring-opacity-50 transition duration-200 bg-white"
            >
              <option value="student">Student</option>
              <option value="tutor">Tutor</option>
            </select>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-base font-semibold text-white bg-[#8B2332] hover:bg-[#6D1A28] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#8B2332] disabled:opacity-50 disabled:cursor-not-allowed transition duration-200"
          >
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default RegisterForm;
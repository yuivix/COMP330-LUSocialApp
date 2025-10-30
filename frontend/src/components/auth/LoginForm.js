import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const LoginForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      setLoading(true);
      const response = await login(email, password);
      if (response && response.token) {
        navigate('/dashboard');
      } else {
        setError('Invalid login response from server');
      }
    } catch (error) {
      setError(error.message || 'Failed to login');
      console.error('Login error:', error);
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
        <h2 className="text-3xl font-bold mb-6 text-center text-[#8B2332]">Sign In</h2>
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 text-red-800 px-4 py-3 rounded mb-6" role="alert">
            <p className="font-medium">Error</p>
            <p className="text-sm">{error}</p>
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
              Email Address
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
              placeholder="Enter your password"
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-base font-semibold text-white bg-[#8B2332] hover:bg-[#6D1A28] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#8B2332] disabled:opacity-50 disabled:cursor-not-allowed transition duration-200"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginForm;
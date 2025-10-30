import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const VerifyEmail = () => {
  const [status, setStatus] = useState('verifying');
  const [searchParams] = useSearchParams();
  const { verify } = useAuth();
  const navigate = useNavigate();
  const token = searchParams.get('token');

  useEffect(() => {
    const verifyEmail = async () => {
      if (!token) {
        setStatus('error');
        return;
      }

      try {
        await verify(token);
        setStatus('success');
        setTimeout(() => navigate('/login'), 3000);
      } catch (error) {
        setStatus('error');
      }
    };

    verifyEmail();
  }, [token, verify, navigate]);

  const renderContent = () => {
    switch (status) {
      case 'verifying':
        return (
          <div className="flex items-center justify-center space-x-2">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#8B2332]"></div>
            <span className="text-gray-700">Verifying your email...</span>
          </div>
        );
      case 'success':
        return (
          <div className="text-green-700 space-y-2">
            <svg className="w-16 h-16 mx-auto text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="font-semibold text-lg">Email verified successfully!</p>
            <p className="text-sm text-gray-600">Redirecting to login page...</p>
          </div>
        );
      case 'error':
        return (
          <div className="text-red-700 space-y-2">
            <svg className="w-16 h-16 mx-auto text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="font-semibold text-lg">Failed to verify email</p>
            <p className="text-sm text-gray-600">The verification link may be invalid or expired.</p>
            <button
              onClick={() => navigate('/login')}
              className="mt-4 px-4 py-2 bg-[#8B2332] text-white rounded-md hover:bg-[#6D1A28] transition duration-200"
            >
              Return to Login
            </button>
          </div>
        );
      default:
        return null;
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
        <h2 className="text-3xl font-bold mb-8 text-center text-[#8B2332]">Email Verification</h2>
        <div className="text-center py-6">{renderContent()}</div>
      </div>
    </div>
  );
};

export default VerifyEmail;
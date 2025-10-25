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
          <div className="flex items-center space-x-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-indigo-600"></div>
            <span>Verifying your email...</span>
          </div>
        );
      case 'success':
        return (
          <div className="text-green-600">
            <p>Email verified successfully!</p>
            <p className="text-sm">Redirecting to login page...</p>
          </div>
        );
      case 'error':
        return (
          <div className="text-red-600">
            <p>Failed to verify email.</p>
            <p className="text-sm">The verification link may be invalid or expired.</p>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="max-w-md mx-auto mt-8 p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-center">Email Verification</h2>
      <div className="text-center">{renderContent()}</div>
    </div>
  );
};

export default VerifyEmail;
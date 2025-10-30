import React from 'react';
import { Link } from 'react-router-dom';
import RegisterForm from '../../components/auth/RegisterForm';

const RegisterPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h1 className="text-center text-4xl font-extrabold text-[#8B2332] mb-2">
          Join Our Community
        </h1>
        <p className="text-center text-gray-600 mb-8">
          Create your account to get started
        </p>
      </div>
      <RegisterForm />
      <div className="mt-6 text-center">
        <p className="text-sm text-gray-600">
          Already have an account?{' '}
          <Link to="/login" className="font-semibold text-[#8B2332] hover:text-[#6D1A28] transition duration-200">
            Sign in here
          </Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;
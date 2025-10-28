import React from "react";
import { useNavigate } from "react-router-dom";

const Navbar = () => {
  const navigate = useNavigate();

  const handleProfileClick = () => {
    navigate("/profile");
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <nav className="bg-gray-200 p-4 flex justify-between items-center">
      <div className="font-bold text-xl">LUSocialApp</div>
      <div className="space-x-4">
        <button
          onClick={handleProfileClick}
          className="px-3 py-1 bg-gray-500 hover:bg-gray-600 text-white rounded"
        >
          Profile
        </button>
        <button
          onClick={handleLogout}
          className="px-3 py-1 bg-red-500 hover:bg-red-600 text-white rounded"
        >
          Logout
        </button>
      </div>
    </nav>
  );
};

export default Navbar;


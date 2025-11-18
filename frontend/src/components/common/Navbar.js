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
    <nav className="bg-[#8B2332] p-4 flex justify-between items-center">
      <div className="font-bold text-xl text-white">LUTutor</div>
      <div className="space-x-4">
        <button
          onClick={handleProfileClick}
          className="px-3 py-1 bg-white hover:bg-gray-100 text-[#8B2332] rounded"
        >
          Profile
        </button>
        <button
          onClick={handleLogout}
          className="px-3 py-1 border border-white hover:bg-[#6D1A28] text-white rounded"
        >
          Logout
        </button>
      </div>
    </nav>
  );
};

export default Navbar;


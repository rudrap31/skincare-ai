import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { PiSignOut } from "react-icons/pi";
import toast from "react-hot-toast";


const Navbar = () => {
  const { user, signOut } = useAuth();

  const handleSignOut = async () => {
    try {
      const { error } = await signOut();
      if (error) throw error;
      toast.success('Signed out successfully');
    } catch (error) {
      toast.error(error.message);
    }
  };

  return (
    <div className="navbar px-10">
      <div className="navbar-start">
        <div className="dropdown">
          <div tabIndex={0} role="button" className="btn btn-ghost lg:hidden">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              {" "}
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M4 6h16M4 12h8m-8 6h16"
              />{" "}
            </svg>
          </div>
          <ul
            tabIndex={0}
            className="menu menu-sm dropdown-content bg-base-100 rounded-box z-1 mt-3 w-52 p-2 shadow"
          >
            <li>
              <a>Routine Rating</a>
            </li>
            <li>
              <a>Face Analyzer</a>
            </li>
            <li>
              <a>Product Rating</a>
            </li>
          </ul>
        </div>
        <Link to="/" className="flex items-center">
          <div className="relative inline-block group">
            <span className="block text-3xl font-bold transition-opacity duration-300 group-hover:opacity-0">
              Skin.AI
            </span>

            <span className="absolute inset-0 text-3xl font-bold bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 bg-clip-text text-transparent transition-opacity duration-300 opacity-0 group-hover:opacity-100">
              Skin.AI
            </span>
          </div>
        </Link>
      </div>
      <div className="navbar-center hidden lg:flex">
        <ul className="menu menu-horizontal px-1 gap-10 text-lg">
          <li>
            <div className="group relative z-10">
              <button className="text-base-content transition-colors">
                Routine Rater
              </button>
              {!user && (
                <div className="absolute text-sm hidden group-hover:block bg-base-200 p-2 rounded-md shadow-lg -bottom-12 left-1/2 transform -translate-x-1/2 whitespace-nowrap">
                  Sign in to use this feature
                </div>
              )}
            </div>
          </li>
          <li>
            <div className="group relative z-10">
              <button className="text-base-content transition-colors">
                Face Analyzer
              </button>
              {!user && (
                <div className="absolute text-sm hidden group-hover:block bg-base-200 p-2 rounded-md shadow-lg -bottom-12 left-1/2 transform -translate-x-1/2 whitespace-nowrap">
                  Sign in to use this feature
                </div>
              )}
            </div>
          </li>
          <li>
            <div className="group relative z-10">
              <button className="text-base-content transition-colors">
                Product Scanner
              </button>
              {!user && (
                <div className="absolute text-sm hidden group-hover:block bg-base-200 p-2 rounded-md shadow-lg -bottom-12 left-1/2 transform -translate-x-1/2 whitespace-nowrap">
                  Sign in to use this feature
                </div>
              )}
            </div>
          </li>
        </ul>
      </div>
      <div className="navbar-end">
        {user ? (
          <div className="dropdown dropdown-center dropdown-hover">
            <Link to="/profile" className="btn m-1 bg-primary" >
              {user.name?.charAt(0).toUpperCase()}
            </Link>
            <ul
              tabIndex={0}
              className="dropdown-content menu bg-base-300 w-30 rounded-box z-1 shadow-sm"
            >
              <li>
                <button className="hover:text-red-500"
                onClick={handleSignOut}> 
                    Sign Out 
                    <PiSignOut />
                </button>
              </li>
            </ul>
          </div>
        ) : (
          <Link to="/login" className="btn btn-primary">
            Login
          </Link>
        )}
      </div>
    </div>
  );
};

export default Navbar;

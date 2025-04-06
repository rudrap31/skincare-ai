import React from "react";
import { useAuth } from "../context/AuthContext";
import toast from 'react-hot-toast';

const Home = () => {
  const { signOut, user } = useAuth();

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
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <div className="card bg-base-100 p-6 w-full max-w-md">
        <h1 className="text-3xl font-semibold text-center mb-6">Welcome to Skincare AI</h1>
        <p className="text-center mb-6">You are signed in as: {user?.email}</p>
        <button 
          onClick={handleSignOut}
          className="btn btn-block btn-primary"
        >
          Sign Out
        </button>
      </div>
    </div>
  );
};

export default Home;

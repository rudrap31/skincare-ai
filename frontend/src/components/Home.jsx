import React from "react";
import { Link } from "react-router-dom";
import Navbar from "./Navbar";
import { useAuth } from "../context/AuthContext";
import GradientBackground from "./GradientBackground";

const Home = () => {
  const { signOut, user } = useAuth();

  return (
    <div className="relative min-h-screen flex flex-col z-0">
      {/* Background stays behind */}
      <GradientBackground />

      {/* Main content */}
      <div className="relative z-10 mt-5">
        <Navbar />

        <main className="flex-1">
          {/* Hero Section */}
          <div className="relative">
            {/* Content */}
            <div className="container mx-auto px-4 py-36 md:py-40 text-white">
              <div className="max-w-3xl mx-auto text-center">
                <h1 className="text-4xl md:text-5xl font-bold mb-6">
                  Your Personal Skincare AI Assistant
                </h1>
                <p className="text-lg md:text-xl mb-8 text-gray-200">
                  Discover personalized skincare recommendations powered by AI.
                  Analyze products, optimize your routine, and track your skin's
                  progress with our advanced tools.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link to="/signup" className="btn btn-primary btn-lg">
                    Get Started
                  </Link>
                  <Link to="/login" className="btn btn-outline btn-lg">
                    Sign In
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Home;

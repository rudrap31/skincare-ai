import React, { useState } from "react";
import { supabase } from "../../supabase/supabase.js";
import toast from 'react-hot-toast';
import { useAuth } from "../../context/AuthContext.jsx";
import { Link } from "react-router-dom";
import { RxHome } from "react-icons/rx";
import GradientBackground from "../GradientBackground.jsx";

const SignUp = () => {
  const { signUp } = useAuth();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const { email, password, confirmPassword } = formData;

    // Validate fields
    if (!email || !password || !confirmPassword) {
      toast.error("All fields are required!");
      return;
    }
    if (password !== confirmPassword) {
      toast.error("Passwords do not match!");
      return;
    }
    if (password.length < 6) {
      toast.error("Password must be at least 6 characters!");
      return;
    }

    try {
      // Sign up the user
      const { data, error } = await signUp({ email, password });
      if (error) throw error;

    //   // Create a profile with default values
    //   const { error: profileError } = await supabase
    //     .from('profiles')
    //     .insert([
    //       {
    //         user_id: data.user.id,
    //         name: "NULL",
    //         skin_type: "NULL",
    //         skin_concerns: []
    //       }
    //     ]);

    //   if (profileError) throw profileError;

      toast.success("Sign-up successful! Check your email for confirmation.");
    } catch (error) {
      toast.error(error.message);
    }
  };

  return (
    <div className="relative z-0 p-4 h-screen flex items-center justify-center">
        <GradientBackground />
        <Link to="/" className="absolute top-0 right-0 p-12 text-3xl hover:text-purple-400 transition colours duration-400"><RxHome />
        </Link>
    <div className="card flex flex-col items-center justify-center min-w-96 mx-auto bg-base-100">
      <div className="w-full p-6 rounded-lg">
        <h1 className="text-3xl font-semibold text-center text-base-content">
          Sign Up
        </h1>

        <form onSubmit={handleSubmit}>
          <div>
            <label className="label p-2 mt-3">
              <span className="text-base text-base-content">Email</span>
            </label>
            <input
              type="email"
              name="email"
              placeholder="Enter Email"
              className="w-full input input-bordered h-10"
              onChange={handleChange}
              value={formData.email}
            />
          </div>

          <div>
            <label className="label p-2 mt-3">
              <span className="text-base text-base-content">Password</span>
            </label>
            <input
              type="password"
              name="password"
              placeholder="Enter Password"
              className="w-full input input-bordered h-10"
              onChange={handleChange}
              value={formData.password}
            />
          </div>

          <div>
            <label className="label p-2 mt-3">
              <span className="text-base text-base-content">Confirm Password</span>
            </label>
            <input
              type="password"
              name="confirmPassword"
              placeholder="Confirm Password"
              className="w-full input input-bordered h-10"
              onChange={handleChange}
              value={formData.confirmPassword}
            />
          </div>

          <Link
            to="/login"
            className="text-sm hover:underline hover:text-blue-600 mt-5 inline-block">
            Already have an account?
          </Link>

          <div>
            <button type="submit" className="btn btn-block btn-sm mt-2 bg-primary">
              <span>Sign Up</span>
            </button>
          </div>
        </form>
      </div>
    </div>
    </div>
  );
};

export default SignUp;

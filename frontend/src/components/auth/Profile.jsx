import React, { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { supabase } from "../../supabase/supabase";
import Navbar from "../Navbar";
import GradientBackground from "../GradientBackground";
import toast from "react-hot-toast";


const SKIN_TYPES = ["Normal", "Dry", "Oily", "Combination", "Sensitive"];
const SKIN_CONCERNS = ["Acne", "Wrinkles", "Redness", "Dark Spots", "Sensitivity"];

const Profile = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState({
    name: "",
    skin_type: "",
    skin_concerns: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) fetchProfile();
  }, [user]);

  const fetchProfile = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("user_id", user.id)
      .single();

    if (error) {
      console.error("Error loading profile:", error.message);
    } else {
      setProfile({
        name: data.name || "",
        skin_type: data.skin_type || "",
        skin_concerns: data.skin_concerns || [],
      });
    }

    setLoading(false);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile((prev) => ({ ...prev, [name]: value }));
  };

  const handleSkinTypeSelect = (type) => {
    setProfile((prev) => ({ ...prev, skin_type: type }));
  };

  const handleSkinConcernToggle = (concern) => {
    setProfile((prev) => {
      const isSelected = prev.skin_concerns.includes(concern);
      return {
        ...prev,
        skin_concerns: isSelected
          ? prev.skin_concerns.filter((c) => c !== concern)
          : [...prev.skin_concerns, concern],
      };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const { error } = await supabase
      .from("profiles")
      .update(profile)
      .eq("user_id", user.id);

    if (error) {
      toast.error("Error updating profile.");
      console.error(error);
    } else {
      toast.success("Profile updated successfully!");
    }
  };


  return (
    <div className="min-h-screen relative z-0">
      <GradientBackground />
      <div className="relative pt-5">
      <Navbar />
      <div className="max-w-3xl mx-auto p-6 mt-12 rounded-2xl">
       

        {loading? (
            <div className="pt-40 flex flex-col items-center">
                <h2 className="text-3xl font-semibold mb-6 text-center">Loading Profile...</h2>

                 <span className="loading loading-spinner loading-md"></span>
            </div>
        ) : (
            <div>
                 <h2 className="text-3xl font-bold mb-6 text-center">Your Profile</h2>
            <form onSubmit={handleSubmit} className="flex flex-col gap-8 items-center">
          {/* Name & Email */}
          <div className="w-full flex flex-col md:flex-row justify-between gap-4 items-center">
            <div className="w-full md:w-1/2 text-center">
              <label className="form-control w-full">
                <span className="label-text font-medium text-center">Name</span>
                <input
                  type="text"
                  name="name"
                  value={profile.name}
                  onChange={handleChange}
                  className="input input-bordered w-full"
                  required
                />
              </label>
            </div>
            <div className="w-full md:w-1/2 text-center">
              <label className="form-control w-full">
                <span className="label-text font-medium text-center">Email</span>
                <input
                  type="text"
                  value={user?.email}
                  disabled
                  className="input input-bordered w-full bg-gray-100"
                />
              </label>
            </div>
          </div>

          {/* Skin Type */}
          <div className="w-full text-center">
            <p className="mb-2 font-medium text-lg">Skin Type</p>
            <div className="flex flex-wrap justify-center gap-3">
              {SKIN_TYPES.map((type) => (
                <button
                  type="button"
                  key={type}
                  onClick={() => handleSkinTypeSelect(type)}
                  className={`btn ${
                    profile.skin_type === type ? "btn-secondary" : "btn-outline"
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          {/* Skin Concerns */}
          <div className="w-full text-center">
            <p className="mb-2 font-medium text-lg">Skin Concerns</p>
            <div className="flex flex-wrap justify-center gap-3">
              {SKIN_CONCERNS.map((concern) => (
                <button
                  type="button"
                  key={concern}
                  onClick={() => handleSkinConcernToggle(concern)}
                  className={`btn ${
                    profile.skin_concerns.includes(concern)
                      ? "btn-secondary"
                      : "btn-outline"
                  }`}
                >
                  {concern}
                </button>
              ))}
            </div>
          </div>

          {/* Submit */}
          <button type="submit" className="btn btn-primary mt-6">
            Save Changes
          </button>
        </form>
        </div>
        ) }
        
      </div>
      </div>
    </div>
  );
};

export default Profile;

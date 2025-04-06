import { useState } from "react";
import { supabase } from "../supabase/supabase";
import { useAuth } from "../context/AuthContext";
import toast from 'react-hot-toast';

const Onboarding = () => {
  const { user, refreshOnboardingStatus } = useAuth();
  const [step, setStep] = useState(1);

  const updateProfile = async (updates) => {
    try {
      const { error } = await supabase
        .from("profiles")
        .update(updates)
        .eq("user_id", user.id);
    
      if (error) {
        console.error("Error updating profile:", error.message);
        toast.error("Failed to update profile");
        return;
      }
      
      // If this is the last step, refresh the onboarding status
      if (step === 3) {
        await refreshOnboardingStatus();
      } else {
        setStep(step + 1);
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("An unexpected error occurred");
    }
  };

  if (!user) return <p>Loading...</p>;
  if (step > 3) return null;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      {step === 1 && <OnboardingName updateProfile={updateProfile} />}
      {step === 2 && <OnboardingSkinType updateProfile={updateProfile} />}
      {step === 3 && <OnboardingSkinConcerns updateProfile={updateProfile} />}
    </div>
  );
};

const OnboardingName = ({ updateProfile }) => {
  const [name, setName] = useState("");
  return (
    <div className="card bg-base-100 p-6">
      <h2 className="text-4xl font-semibold mb-3 text-center text-base-content">
        What is your name?
      </h2>
      <input
        className="w-full input input-bordered h-10"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <button
        className="btn btn-block btn-sm text-lg mt-4 bg-primary hover:bg-purple-600"
        onClick={() => updateProfile({ name })}
      >
        Next
      </button>
    </div>
  );
};

const OnboardingSkinType = ({ updateProfile }) => {
  const skinTypes = ["Oily", "Dry", "Combination", "Normal", "Sensitive"];
  return (
    <div className="card bg-base-100 p-6">
      <h2 className="text-4xl mb-3 text-center text-base-content">
        What is your skin type?
      </h2>
      {skinTypes.map((type) => (
        <button
          className="btn btn-block btn-sm text-lg mt-4 bg-primary hover:bg-purple-600"
          key={type}
          onClick={() => updateProfile({ skin_type: type })}
        >
          {type}
        </button>
      ))}
    </div>
  );
};

const OnboardingSkinConcerns = ({ updateProfile }) => {
  const concerns = ["Acne", "Wrinkles", "Redness", "Dark Spots", "Sensitivity"];
  const [selected, setSelected] = useState([]);
  const toggleConcern = (concern) => {
    setSelected((prev) =>
      prev.includes(concern)
        ? prev.filter((c) => c !== concern)
        : [...prev, concern]
    );
  };
  return (
    <div className="card bg-base-100 p-6">
      <h2 className="text-4xl mb-3 text-center text-base-content">
        What are your skin concerns?
      </h2>
      {concerns.map((concern) => (
        <button
          className={`btn btn-block btn-sm text-[14px] mt-4 border-l-gray-600 hover:bg-purple-600 
            ${selected.includes(concern) ? "bg-purple-600" : ""}`}
          key={concern}
          onClick={() => toggleConcern(concern)}
        >
          {concern}
        </button>
      ))}
      <button
        className="btn btn-block btn-sm text-lg mt-4 bg-primary hover:bg-purple-600"
        onClick={() => updateProfile({ skin_concerns: selected })}
      >
        Finish
      </button>
    </div>
  );
};

export default Onboarding;

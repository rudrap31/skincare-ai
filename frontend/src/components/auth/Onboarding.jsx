import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../supabase/supabase";
import { useAuth } from "../../context/AuthContext";
import toast from "react-hot-toast";
import GradientBackground from "../GradientBackground";
import { RxInfoCircled } from "react-icons/rx";

const Onboarding = () => {
  const {
    onboardingStep,
    hasCompletedOnboarding,
    refreshOnboardingStatus,
    user,
  } = useAuth();
  const [step, setStep] = useState(onboardingStep);
  const navigate = useNavigate();

  useEffect(() => {
    setStep(onboardingStep);
  }, [onboardingStep]);

  useEffect(() => {
    if (hasCompletedOnboarding) {
      navigate("/home");
    }
  }, [hasCompletedOnboarding, navigate]);

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

      if (step === 3) {
        await refreshOnboardingStatus(); // Will trigger redirect if onboarding is complete
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
    <div className="relative z-0">
      <GradientBackground />
      <div className="flex flex-col items-center justify-center min-h-screen">
        {step === 1 && <OnboardingName updateProfile={updateProfile} />}
        {step === 2 && <OnboardingSkinType updateProfile={updateProfile} />}
        {step === 3 && <OnboardingSkinConcerns updateProfile={updateProfile} />}
      </div>
    </div>
  );
};

const OnboardingName = ({ updateProfile }) => {
  const [name, setName] = useState("");

  return (
    <div className="card bg-base-100 p-6">
      <h2 className="text-4xl font-medium mb-3 text-center text-base-content">
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
  const skinTypes = ["Oily", "Dry", "Combination", "Normal", "Sensitive", "Skip"];

  return (
    <div className="card bg-base-100 p-6">
      <div className="flex items-center">
        <h2 className="text-4xl font-medium mb-3 text-center text-base-content">
          What is your skin type?
        </h2>
        <div className="dropdown dropdown-right dropdown-center dropdown-hover pl-4">
          <div tabIndex={0} role="button" className="hover:cursor-pointer">
            <RxInfoCircled />
          </div>
          <div
            tabIndex={0}
            className="dropdown-content card card-sm bg-base-200 z-1 w-72 shadow-md"
          >
            <div className="card-body text-sm leading-relaxed">
              <p>
                Not sure? Try this:<br />
                1. Wash face, wait 30-60 mins (no products).<br />
                2. Observe:<br />
                • Shiny all over → Oily<br />
                • Tight or flaky → Dry<br />
                • T-zone oily + dry cheeks → Combo<br />
                • No issues → Normal<br />
                • Redness or irritation easily → Sensitive<br />
                <br />
                You can skip this, but it helps improve results!
              </p>
            </div>
          </div>
        </div>
      </div>
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
            ${selected.includes(concern) ? "bg-primary" : "btn-outline"}`}
          key={concern}
          onClick={() => toggleConcern(concern)}
        >
          {concern}
        </button>
      ))}
      <div className="flex gap-5">
        <button
        className="btn w-10/21 btn-sm text-lg mt-4 bg-primary hover:bg-purple-600"
        onClick={() => updateProfile({ skin_concerns: selected })}
      >
        Finish
      </button>

      <button
        className="btn w-10/21 btn-sm text-lg mt-4 bg-secondary hover:bg-rose-600"
        onClick={() => updateProfile({ skin_concerns: ["Skip"] })}
      >
        Skip
      </button>
      </div>
    </div>
  );
};

export default Onboarding;

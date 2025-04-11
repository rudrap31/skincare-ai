import React, { useState } from "react";
import toast from 'react-hot-toast';
import { useAuth } from "../../context/AuthContext";
import { Link } from "react-router-dom";
import { RxHome } from "react-icons/rx";
import GradientBackground from "../GradientBackground";


const Login = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const { signIn } = useAuth();

    const handleLogin = async (e) => {
        e.preventDefault();

        try {
            const { error } = await signIn({ email, password });
            if (error) throw error;
        } catch (error) {
            toast.error(error.message);
        }
    };

    return (
        <div className="relative z-0 p-4 h-screen flex items-center  justify-center">
            <GradientBackground/>

            <Link to="/" className="absolute top-0 right-0 p-12 text-3xl hover:text-purple-400 transition colours duration-400"><RxHome />
            </Link>
        <div className="card p-4 flex-col items-center justify-center max-w-96 mx-auto bg-base-100">
            <div className="w-full p-6 rounded-lg">
                <h1 className="text-3xl font-semibold text-center text-base-content">Login</h1>
                <form onSubmit={handleLogin}>
                    <div>
                        <label className="label p-2 mt-3">
                            <span className="text-base text-base-content">Email</span>
                        </label>
                        <input 
                            type="text" 
                            placeholder="Enter Email" 
                            className="w-full input input-bordered h-10" 
                            value={email} 
                            onChange={(e) => setEmail(e.target.value)} 
                        />
                    </div>

                    <div>
                        <label className="label p-2 mt-3">
                            <span className="text-base text-base-content">Password</span>
                        </label>
                        <input 
                            type="password" 
                            placeholder="Enter Password" 
                            className="w-full input input-bordered h-10" 
                            value={password} 
                            onChange={(e) => setPassword(e.target.value)} 
                        />
                    </div>

                    <Link to="/signup" className='text-sm hover:underline hover:text-blue-600 mt-5 inline-block'>
                        Don't have an account?
                    </Link>

                    <div>
                        <button type="submit" className="btn btn-block btn-sm mt-2 bg-primary">
                            <span>Login</span>
                        </button>
                    </div>
                </form>
            </div>
        </div>
    </div>
    );
};

export default Login;

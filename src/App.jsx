import React, { useEffect } from 'react'
import './App.css'
import { Navigate, Route, Routes, useNavigate } from 'react-router-dom'
import Home from './components/Home'
import Login from './components/Login'
import SignUp from './components/SignUp'
import Onboarding from './components/Onboarding'
import { useAuth } from './context/AuthContext'

function App() {
    const { user, hasCompletedOnboarding, loading } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (!loading) {
            if (user) {
                if (hasCompletedOnboarding) {
                    navigate('/');
                } else {
                    navigate('/onboarding');
                }
            } else {
                navigate('/login');
            }
        }
    }, [user, hasCompletedOnboarding, loading, navigate]);

    if (loading) {
        return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
    }

    return (
        <div data-theme="corporate" className='p-4 h-screen flex items-center justify-center bg-base-200'>
            <Routes>
                <Route path='/' element={
                    user ? (
                        hasCompletedOnboarding ? <Home /> : <Navigate to="/onboarding" />
                    ) : (
                        <Navigate to="/login" />
                    )
                } />
                <Route path='/login' element={
                    user ? (
                        hasCompletedOnboarding ? <Navigate to="/" /> : <Navigate to="/onboarding" />
                    ) : (
                        <Login />
                    )
                } />
                <Route path='/signup' element={
                    user ? (
                        hasCompletedOnboarding ? <Navigate to="/" /> : <Navigate to="/onboarding" />
                    ) : (
                        <SignUp />
                    )
                } />
                <Route path='/onboarding' element={
                    user ? <Onboarding /> : <Navigate to="/login" />
                } />
            </Routes>
        </div>
    )
}

export default App

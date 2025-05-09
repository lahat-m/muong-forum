// src/pages/AuthPage.jsx

import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import Loader from '../components/Loader';
import api from '../api';
import Notify from '../components/Notify';

const AuthPage = () => {
    const [isSignUp, setIsSignUp] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();
    const [loader, setLoader] = useState(false);
    const [loginEmail, setLoginEmail] = useState('');
    const [loginPassword, setLoginPassword] = useState('');
    const [signUpFirstName, setSignUpFirstName] = useState('');
    const [signUpLastName, setSignUpLastName] = useState('');
    const [signUpEmail, setSignUpEmail] = useState('');
    const [signUpPassword, setSignUpPassword] = useState('');
    const [signUpUsername, setSignUpUsername] = useState('');
    const [isDevelopment] = useState(
        window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    );

    // Check URL parameters for verification or reset status
    useEffect(() => {
        const params = new URLSearchParams(location.search);
        if (params.get('verified') === 'true') {
            Notify.success('Email verified successfully. You can now log in.');
        }
        if (params.get('reset') === 'success') {
            Notify.success('Password reset successful. Please log in with your new password.');
        }
    }, [location]);

    // Handle user sign-up
    async function handleSignUp(e) {
        e.preventDefault();
        setLoader(true);
        try {
            // Fix the endpoint to match your backend
            const response = await api.post('/create/user', {
                firstName: signUpFirstName,
                lastName: signUpLastName,
                email: signUpEmail,
                password: signUpPassword,
                username: signUpUsername,
            });

            // Show success messages
            Notify.success('Account Created Successfully');
            Notify.info('Please check your email to verify your account');

            // In development mode, show the verification token if available
            if (isDevelopment && response.data?.verificationToken) {
                Notify.info(`Dev mode: Your verification token is ${response.data.verificationToken}`);
            }

            // Reset the signup form and switch to login form
            setIsSignUp(false);
            setSignUpFirstName('');
            setSignUpLastName('');
            setSignUpEmail('');
            setSignUpPassword('');
            setSignUpUsername('');
            
            // Pre-fill login email for convenience
            setLoginEmail(signUpEmail);
        } catch (error) {
            // Handle error responses
            const errorMessage = error.response?.data?.message || 'An error occurred';
            Notify.error(errorMessage);
            
            // Don't switch to login page on error
            // Stay on signup form so user can fix issues
        } finally {
            setLoader(false);
        }
    }

    // Handle user login
    async function handleSignIn(e) {
        e.preventDefault();
        setLoader(true);
        try {
            const res = await api.post('/auth/login', {
                email: loginEmail,
                password: loginPassword,
            });

            // Store authentication data
            localStorage.setItem('ACCESS_TOKEN', res.data.accessToken);
            localStorage.setItem('REFRESH_TOKEN', res.data.refreshToken);
            localStorage.setItem('USER', JSON.stringify(res.data.user));

            // Get user info for personalized greeting
            const user = res.data.user;
            Notify.success(`Login Successful! Welcome ${user.firstName || user.username || ''}`);

            // Redirect based on user role
            setTimeout(() => {
                if (user.role === 'ADMIN') {
                    navigate('/dashboard');
                } else {
                    // Ensure this route exists in your application
                    navigate('/users/dashboard');
                }
            }, 1000);
        } catch (error) {
            // Handle login errors with specific messages
            const message = error.response?.data?.message || 'Invalid Credentials';
            
            if (message.includes('not verified')) {
                Notify.error('Email not verified. Please check your inbox for the verification link.');
                
                if (isDevelopment) {
                    Notify.info('Dev mode: Use the verification endpoints to verify your email');
                }
            } else {
                Notify.error(message);
            }
            
            // Clear password field on error but keep email for convenience
            setLoginPassword('');
        } finally {
            setLoader(false);
        }
    }

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
            {/* Background GIF */}
            <div
                className="fixed top-0 left-0 w-full h-full bg-cover bg-center z-[-2] animate-fade"
                style={{ backgroundImage: "url('/bg.gif')" }}
            ></div>

            {loader && <Loader />}
            <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-md">
                <div className="flex justify-center mb-6">
                    <h2 className="text-3xl font-bold text-gray-700">
                        {isSignUp ? 'Sign Up' : 'Sign In'}
                    </h2>
                </div>

                <div className="flex justify-center space-x-4 mb-6">
                    <button
                        onClick={() => setIsSignUp(false)}
                        className={`px-4 py-2 w-1/2 rounded-lg ${!isSignUp ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'}`}
                        type="button"
                    >
                        Sign In
                    </button>
                    <button
                        onClick={() => setIsSignUp(true)}
                        className={`px-4 py-2 w-1/2 rounded-lg ${isSignUp ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'}`}
                        type="button"
                    >
                        Sign Up
                    </button>
                </div>

                {isSignUp ? (
                    <form onSubmit={handleSignUp}>
                        <div className="mb-4">
                            <label className="block mb-1 font-medium text-gray-600">
                                First Name
                            </label>
                            <input
                                type="text"
                                placeholder="Enter your first name"
                                className="w-full px-4 py-2 border rounded-lg text-sm"
                                required
                                value={signUpFirstName}
                                onChange={(e) => setSignUpFirstName(e.target.value)}
                            />
                        </div>
                        <div className="mb-4">
                            <label className="block mb-1 font-medium text-gray-600">
                                Last Name
                            </label>
                            <input
                                type="text"
                                placeholder="Enter your last name"
                                className="w-full px-4 py-2 border rounded-lg text-sm"
                                required
                                value={signUpLastName}
                                onChange={(e) => setSignUpLastName(e.target.value)}
                            />
                        </div>
                        <div className="mb-4">
                            <label className="block mb-1 font-medium text-gray-600">
                                Email
                            </label>
                            <input
                                type="email"
                                placeholder="Enter your email"
                                className="w-full px-4 py-2 border rounded-lg text-sm"
                                required
                                value={signUpEmail}
                                onChange={(e) => setSignUpEmail(e.target.value)}
                            />
                        </div>
                        <div className="mb-4">
                            <label className="block mb-1 font-medium text-gray-600">
                                Username
                            </label>
                            <input
                                type="text"
                                placeholder="Enter your Username"
                                className="w-full px-4 py-2 border rounded-lg text-sm"
                                required
                                value={signUpUsername}
                                onChange={(e) => setSignUpUsername(e.target.value)}
                            />
                        </div>
                        <div className="mb-4">
                            <label className="block mb-1 font-medium text-gray-600">
                                Password
                            </label>
                            <input
                                type="password"
                                placeholder="Create a password"
                                className="w-full px-4 py-2 border rounded-lg text-sm"
                                required
                                minLength={8}
                                value={signUpPassword}
                                onChange={(e) => setSignUpPassword(e.target.value)}
                            />
                            <p className="mt-1 text-xs text-gray-500">
                                Password must be at least 8 characters long
                            </p>
                        </div>
                        <button
                            className="w-full py-2 mt-2 text-white bg-blue-500 rounded-lg hover:bg-blue-600"
                            type="submit"
                        >
                            Create Account
                        </button>
                        <p className="mt-4 text-sm text-center text-gray-500">
                            By signing up, you agree to our{' '}
                            <a href="#" className="text-blue-500">
                                Terms and Privacy Policy
                            </a>
                        </p>
                    </form>
                ) : (
                    <form onSubmit={handleSignIn}>
                        <div className="mb-4">
                            <label className="block mb-1 font-medium text-gray-600">
                                Email
                            </label>
                            <input
                                type="email"
                                placeholder="Enter your email"
                                className="w-full px-4 py-2 border rounded-lg text-sm"
                                required
                                value={loginEmail}
                                onChange={(e) => setLoginEmail(e.target.value)}
                            />
                        </div>
                        <div className="mb-4">
                            <label className="block mb-1 font-medium text-gray-600">
                                Password
                            </label>
                            <input
                                type="password"
                                placeholder="Enter your password"
                                className="w-full px-4 py-2 border rounded-lg text-sm"
                                required
                                value={loginPassword}
                                onChange={(e) => setLoginPassword(e.target.value)}
                            />
                        </div>
                        <div className="flex items-center justify-between mb-4">
                            <label className="flex items-center text-sm text-gray-600">
                                <input type="checkbox" className="mr-2" />
                                Remember me
                            </label>
                            <Link to="/forgot-password" className="text-sm text-blue-500 hover:underline">
                                Forgot password?
                            </Link>
                        </div>
                        <button
                            className="w-full py-2 mt-2 text-white bg-blue-500 rounded-lg hover:bg-blue-600"
                            type="submit"
                        >
                            Sign In
                        </button>
                    </form>
                )}

                {/* Development Mode Helper */}
                {isDevelopment && (
                    <div className="mt-6 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                        <h3 className="text-sm font-medium text-yellow-800">Development Mode</h3>
                        <p className="text-xs text-yellow-700 mt-1">
                            Email verification is enabled. For development purposes:
                        </p>
                        <ul className="list-disc list-inside text-xs text-yellow-700 mt-1">
                            <li>Check server logs for verification tokens</li>
                            <li>Use <code>/auth/dev-verify</code> API endpoint with the token</li>
                            <li>Admin users can bypass email verification</li>
                        </ul>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AuthPage;
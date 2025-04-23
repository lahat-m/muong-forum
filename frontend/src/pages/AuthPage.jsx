// src/pages/AuthPage.jsx

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Loader from '../components/Loader';
import api from '../api';
import Notify from '../components/Notify';

const AuthPage = () => {
    const [isSignUp, setIsSignUp] = useState(false);
    const navigate = useNavigate();
    const [loader, setLoader] = useState(false);
    const [loginEmail, setLoginEmail] = useState('');
    const [loginPassword, setLoginPassword] = useState('');
    const [signUpFirstName, setSignUpFirstName] = useState('');
    const [signUpLastName, setSignUpLastName] = useState('');
    const [signUpEmail, setSignUpEmail] = useState('');
    const [signUpPassword, setSignUpPassword] = useState('');
    const [signUpUsername, setSignUpUsername] = useState('');

    // Handle user sign-up.
    async function handleSignUp(e) {
        e.preventDefault();
        setLoader(true);
        try {
            await api.post('/user/create-user', {
                firstName: signUpFirstName,
                lastName: signUpLastName,
                email: signUpEmail,
                password: signUpPassword,
                username: signUpUsername,
            });
            Notify.success('Account Created Successfully');
            Notify.info('Please log in to continue');
            setIsSignUp(false);
            setSignUpFirstName('');
            setSignUpLastName('');
            setSignUpEmail('');
            setSignUpPassword('');
            setSignUpUsername('');
        } catch (error) {
            Notify.error(error.response?.data?.message || 'An error occurred');
        } finally {
            setLoader(false);
        }
    }

    // Handle login and redirect based on role.
    async function handleSignIn(e) {
        e.preventDefault();
        setLoader(true);
        try {
            const res = await api.post('/auth/login', {
                email: loginEmail,
                password: loginPassword,
            });
            Notify.success('Login Successful');
            localStorage.setItem('ACCESS_TOKEN', res.data.accessToken);
            localStorage.setItem('REFRESH_TOKEN', res.data.refreshToken);
            localStorage.setItem('USER', JSON.stringify(res.data.user));
            // Role-based redirection:
            const user = res.data.user;
            setTimeout(() => {
                if (user.role === 'ADMIN') {
                    navigate('/dashboard');
                } else {
                    navigate('/users/dashboard');
                }
            }, 1000);
        } catch (error) {
            Notify.error('Invalid Credentials');
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
                        className={`px-4 py-2 w-1/2 rounded-lg ${!isSignUp ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'
                            }`}
                    >
                        Sign In
                    </button>
                    <button
                        onClick={() => setIsSignUp(true)}
                        className={`px-4 py-2 w-1/2 rounded-lg ${isSignUp ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'
                            }`}
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
                                onChange={(e) => setSignUpPassword(e.target.value)}
                            />
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
                                onChange={(e) => setLoginPassword(e.target.value)}
                            />
                        </div>
                        <div className="flex items-center justify-between mb-4">
                            <label className="flex items-center text-sm text-gray-600">
                                <input type="checkbox" className="mr-2" />
                                Remember me
                            </label>
                            <a href="#" className="text-sm text-blue-500 hover:underline">
                                Forgot password?
                            </a>
                        </div>
                        <button
                            className="w-full py-2 mt-2 text-white bg-blue-500 rounded-lg hover:bg-blue-600"
                            type="submit"
                        >
                            Sign In
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
};

export default AuthPage;

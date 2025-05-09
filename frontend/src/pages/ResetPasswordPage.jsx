// src/pages/ResetPasswordPage.jsx

import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import Loader from '../components/Loader';
import api from '../api';
import Notify from '../components/Notify';

const ResetPasswordPage = () => {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [token, setToken] = useState('');
    const [loading, setLoading] = useState(false);
    const [resetSuccess, setResetSuccess] = useState(false);
    const [tokenValid, setTokenValid] = useState(true);
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        // Extract token from URL query params
        const queryParams = new URLSearchParams(location.search);
        const tokenParam = queryParams.get('token');
        
        if (!tokenParam) {
            Notify.error('Invalid or missing reset token');
            setTokenValid(false);
            return;
        }
        
        setToken(tokenParam);
    }, [location]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (password !== confirmPassword) {
            Notify.error('Passwords do not match');
            return;
        }
        
        if (password.length < 8) {
            Notify.error('Password must be at least 8 characters long');
            return;
        }
        
        setLoading(true);
        
        try {
            await api.post('/auth/reset-password', {
                token,
                password
            });
            
            setResetSuccess(true);
            Notify.success('Password has been reset successfully');
            
            // Redirect to login after 3 seconds
            setTimeout(() => {
                navigate('/auth');
            }, 3000);
        } catch (error) {
            Notify.error(error.response?.data?.message || 'Failed to reset password');
            setTokenValid(false);
        } finally {
            setLoading(false);
        }
    };

    if (!tokenValid) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-100">
                <div
                    className="fixed top-0 left-0 w-full h-full bg-cover bg-center z-[-2] animate-fade"
                    style={{ backgroundImage: "url('/bg.gif')" }}
                ></div>
                
                <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-md text-center">
                    <div className="text-red-500 text-xl mb-4">Invalid Reset Link</div>
                    <p className="text-gray-600 mb-6">
                        The password reset link is invalid or has expired. Please request a new one.
                    </p>
                    <Link
                        to="/forgot-password"
                        className="w-full inline-block py-2 text-center text-white bg-blue-500 rounded-lg hover:bg-blue-600"
                    >
                        Request New Reset Link
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <div
                className="fixed top-0 left-0 w-full h-full bg-cover bg-center z-[-2] animate-fade"
                style={{ backgroundImage: "url('/bg.gif')" }}
            ></div>
            
            {loading && <Loader />}
            
            <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-md">
                <div className="flex justify-center mb-6">
                    <h2 className="text-3xl font-bold text-gray-700">Reset Your Password</h2>
                </div>
                
                {resetSuccess ? (
                    <div className="text-center">
                        <div className="mb-6 text-green-500 text-xl">
                            Password Reset Successful!
                        </div>
                        <p className="mb-4 text-gray-600">
                            Your password has been successfully updated. You can now log in with your new password.
                        </p>
                        <p className="text-gray-600">
                            Redirecting to login page...
                        </p>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit}>
                        <div className="mb-4">
                            <label className="block mb-1 font-medium text-gray-600">
                                New Password
                            </label>
                            <input
                                type="password"
                                placeholder="Enter new password"
                                className="w-full px-4 py-2 border rounded-lg text-sm"
                                required
                                minLength={8}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>
                        <div className="mb-6">
                            <label className="block mb-1 font-medium text-gray-600">
                                Confirm Password
                            </label>
                            <input
                                type="password"
                                placeholder="Confirm new password"
                                className="w-full px-4 py-2 border rounded-lg text-sm"
                                required
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                            />
                        </div>
                        <button
                            className="w-full py-2 mt-2 text-white bg-blue-500 rounded-lg hover:bg-blue-600"
                            type="submit"
                        >
                            Reset Password
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
};

export default ResetPasswordPage;
// src/pages/PasswordReset.jsx

import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import Loader from '../components/Loader';
import api from '../api';
import Notify from '../components/Notify';

const PasswordReset = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [step, setStep] = useState(1); // 1: Request reset, 2: Reset password
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [token, setToken] = useState('');
    const [loader, setLoader] = useState(false);
    const [passwordStrength, setPasswordStrength] = useState('');
    const [passwordError, setPasswordError] = useState('');
    
    useEffect(() => {
        // Check if we have a token in the URL (for password reset)
        const searchParams = new URLSearchParams(location.search);
        const tokenFromUrl = searchParams.get('token');
        
        if (tokenFromUrl) {
            setToken(tokenFromUrl);
            setStep(2);
        }
    }, [location]);
    
    // Check password strength
    const checkPasswordStrength = (password) => {
        const strongRegex = new RegExp(
            '^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])(?=.{8,})'
        );
        const mediumRegex = new RegExp(
            '^(?=.*[a-zA-Z])(?=.*[0-9])(?=.{6,})'
        );

        if (strongRegex.test(password)) {
            setPasswordStrength('strong');
            setPasswordError('');
            return true;
        } else if (mediumRegex.test(password)) {
            setPasswordStrength('medium');
            setPasswordError('Consider adding special characters for a stronger password');
            return true;
        } else {
            setPasswordStrength('weak');
            setPasswordError('Password must be at least 6 characters with letters and numbers');
            return password.length >= 6;
        }
    };
    
    // Handle password change
    const handlePasswordChange = (e) => {
        const password = e.target.value;
        setPassword(password);
        checkPasswordStrength(password);
    };
    
    // Request password reset
    const handleRequestReset = async (e) => {
        e.preventDefault();
        setLoader(true);
        
        try {
            await api.post('/auth/forgot-password', { email });
            Notify.success('Password reset instructions sent');
            Notify.info('Please check your email');
        } catch (error) {
            // Don't expose whether the email exists for security
            Notify.success('If your email is registered, you will receive reset instructions');
        } finally {
            setLoader(false);
            // Clear the form
            setEmail('');
        }
    };
    
    // Reset password
    const handleResetPassword = async (e) => {
        e.preventDefault();
        
        // Validate password
        if (!checkPasswordStrength(password)) {
            Notify.error('Please create a stronger password');
            return;
        }
        
        // Check passwords match
        if (password !== confirmPassword) {
            Notify.error('Passwords do not match');
            return;
        }
        
        setLoader(true);
        
        try {
            await api.post('/auth/reset-password', {
                token,
                password
            });
            
            Notify.success('Password reset successful');
            
            // Redirect to login after 2 seconds
            setTimeout(() => {
                navigate('/login');
            }, 2000);
        } catch (error) {
            const errorMsg = error.response?.data?.message || 'Failed to reset password';
            Notify.error(errorMsg);
            
            if (errorMsg.includes('expired') || errorMsg.includes('invalid')) {
                // If token is invalid or expired, go back to step 1
                setStep(1);
            }
        } finally {
            setLoader(false);
        }
    };
    
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
                    // src/pages/PasswordReset.jsx (continued)
                        {step === 1 ? 'Reset Password' : 'Create New Password'}
                    </h2>
                </div>
                
                {step === 1 ? (
                    <div>
                        <p className="mb-6 text-gray-600 text-center">
                            Enter your email address and we'll send you instructions to reset your password.
                        </p>
                        <form onSubmit={handleRequestReset}>
                            <div className="mb-4">
                                <label className="block mb-1 font-medium text-gray-600">
                                    Email
                                </label>
                                <input
                                    type="email"
                                    placeholder="Enter your email"
                                    className="w-full px-4 py-2 border rounded-lg text-sm"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </div>
                            <button
                                className="w-full py-2 mt-2 text-white bg-blue-500 rounded-lg hover:bg-blue-600"
                                type="submit"
                            >
                                Send Reset Instructions
                            </button>
                        </form>
                        <div className="mt-6 text-center">
                            <Link to="/login" className="text-blue-500 hover:underline">
                                Back to Sign In
                            </Link>
                        </div>
                    </div>
                ) : (
                    <div>
                        <p className="mb-6 text-gray-600 text-center">
                            Enter your new password below.
                        </p>
                        <form onSubmit={handleResetPassword}>
                            <div className="mb-4">
                                <label className="block mb-1 font-medium text-gray-600">
                                    New Password
                                </label>
                                <input
                                    type="password"
                                    placeholder="Enter new password"
                                    className="w-full px-4 py-2 border rounded-lg text-sm"
                                    required
                                    value={password}
                                    onChange={handlePasswordChange}
                                />
                                
                                {password && (
                                    <div className="mt-2">
                                        <div className="flex items-center space-x-2">
                                            <div className="text-sm font-medium">Strength:</div>
                                            <div className="flex space-x-1 h-2 w-24">
                                                <div 
                                                    className={`h-full w-1/3 rounded-sm ${
                                                        passwordStrength === 'weak' 
                                                            ? 'bg-red-500' 
                                                            : passwordStrength === 'medium' 
                                                                ? 'bg-yellow-500' 
                                                                : 'bg-green-500'
                                                    }`}
                                                ></div>
                                                <div 
                                                    className={`h-full w-1/3 rounded-sm ${
                                                        passwordStrength === 'medium' || passwordStrength === 'strong' 
                                                            ? passwordStrength === 'medium' 
                                                                ? 'bg-yellow-500' 
                                                                : 'bg-green-500' 
                                                            : 'bg-gray-200'
                                                    }`}
                                                ></div>
                                                <div 
                                                    className={`h-full w-1/3 rounded-sm ${
                                                        passwordStrength === 'strong' 
                                                            ? 'bg-green-500' 
                                                            : 'bg-gray-200'
                                                    }`}
                                                ></div>
                                            </div>
                                            <div className={`text-xs ${
                                                passwordStrength === 'weak' 
                                                    ? 'text-red-500' 
                                                    : passwordStrength === 'medium' 
                                                        ? 'text-yellow-500' 
                                                        : 'text-green-500'
                                            }`}>
                                                {passwordStrength.charAt(0).toUpperCase() + passwordStrength.slice(1)}
                                            </div>
                                        </div>
                                        {passwordError && (
                                            <p className="text-xs text-red-500 mt-1">{passwordError}</p>
                                        )}
                                    </div>
                                )}
                            </div>
                            <div className="mb-4">
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
                                {password && confirmPassword && password !== confirmPassword && (
                                    <p className="text-xs text-red-500 mt-1">Passwords do not match</p>
                                )}
                            </div>
                            <button
                                className="w-full py-2 mt-2 text-white bg-blue-500 rounded-lg hover:bg-blue-600"
                                type="submit"
                                disabled={password !== confirmPassword}
                            >
                                Reset Password
                            </button>
                        </form>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PasswordReset;
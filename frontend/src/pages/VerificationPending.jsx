// src/pages/VerificationPending.jsx

import React, { useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import Loader from '../components/Loader';
import api from '../api';
import Notify from '../components/Notify';

const VerificationPending = () => {
    const location = useLocation();
    const [loader, setLoader] = useState(false);
    
    // Get email from location state or use a default message
    const email = location.state?.email || 'your email';
    
    // Function to request a new verification email
    const resendVerification = async () => {
        setLoader(true);
        try {
            // You need to implement this endpoint in your backend
            await api.post('/auth/resend-verification', { email });
            Notify.success('New verification email sent!');
        } catch (error) {
            const errorMsg = error.response?.data?.message || 'Failed to resend verification email';
            Notify.error(errorMsg);
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
            
            <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-md text-center">
                <div className="flex justify-center">
                    <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center">
                        <svg className="w-8 h-8 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                        </svg>
                    </div>
                </div>
                
                <h2 className="text-2xl font-bold text-gray-700">Verify Your Email</h2>
                
                <div className="space-y-4">
                    <p className="text-gray-600">
                        We've sent a verification link to <span className="font-medium">{email}</span>.
                    </p>
                    <p className="text-gray-600">
                        Please check your inbox and click the verification link to activate your account.
                    </p>
                    <p className="text-gray-500 text-sm">
                        If you don't see the email, check your spam folder.
                    </p>
                </div>
                
                <div className="pt-4 border-t border-gray-200 mt-6">
                    <p className="text-gray-600 mb-4">
                        Didn't receive the email?
                    </p>
                    <button
                        onClick={resendVerification}
                        className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                    >
                        Resend Verification Email
                    </button>
                </div>
                
                <div className="mt-6">
                    <Link to="/login" className="text-blue-500 hover:underline">
                        Back to Sign In
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default VerificationPending;
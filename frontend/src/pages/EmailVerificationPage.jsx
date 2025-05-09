// src/pages/EmailVerificationPage.jsx

import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import Loader from '../components/Loader';
import api from '../api';
import Notify from '../components/Notify';

const EmailVerificationPage = () => {
    const [loading, setLoading] = useState(true);
    const [verificationStatus, setVerificationStatus] = useState({
        success: false,
        message: ''
    });
    const location = useLocation();

    useEffect(() => {
        const verifyEmail = async () => {
            try {
                const queryParams = new URLSearchParams(location.search);
                const token = queryParams.get('token');
                
                if (!token) {
                    setVerificationStatus({
                        success: false,
                        message: 'Invalid verification link. The token is missing.'
                    });
                    return;
                }
                
                await api.get(`/auth/verify-email?token=${token}`);
                
                setVerificationStatus({
                    success: true,
                    message: 'Your email has been successfully verified!'
                });
            } catch (error) {
                const errorMessage = error.response?.data?.message || 'Email verification failed';
                setVerificationStatus({
                    success: false,
                    message: errorMessage
                });
            } finally {
                setLoading(false);
            }
        };
        
        verifyEmail();
    }, [location]);

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <div
                className="fixed top-0 left-0 w-full h-full bg-cover bg-center z-[-2] animate-fade"
                style={{ backgroundImage: "url('/bg.gif')" }}
            ></div>
            
            {loading ? (
                <Loader />
            ) : (
                <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-md text-center">
                    <div className="flex justify-center mb-6">
                        <h2 className="text-3xl font-bold text-gray-700">Email Verification</h2>
                    </div>
                    
                    <div className={`text-xl mb-6 ${verificationStatus.success ? 'text-green-500' : 'text-red-500'}`}>
                        {verificationStatus.success ? (
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto mb-2 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto mb-2 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        )}
                        {verificationStatus.message}
                    </div>
                    
                    <p className="text-gray-600 mb-6">
                        {verificationStatus.success
                            ? 'You can now log in to your account with your email and password.'
                            : 'Please try again or contact support if the problem persists.'}
                    </p>
                    
                    <Link
                        to="/auth"
                        className="w-full inline-block py-2 text-center text-white bg-blue-500 rounded-lg hover:bg-blue-600"
                    >
                        {verificationStatus.success ? 'Proceed to Login' : 'Back to Login'}
                    </Link>
                </div>
            )}
        </div>
    );
};

export default EmailVerificationPage;
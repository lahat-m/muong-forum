// src/pages/AuthPage.jsx

import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Mail, Key, User, EyeOff, Eye, LockKeyhole, UserPlus, LogIn, CheckCircle, X, ArrowRight, AlertCircle } from 'lucide-react';
import Loader from '../components/Loader';
import api from '../api';
import Notify from '../components/Notify';

const AuthPage = () => {
    const [isSignUp, setIsSignUp] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [formStep, setFormStep] = useState(0);
    const [passwordStrength, setPasswordStrength] = useState(0);
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
    const [inputFocus, setInputFocus] = useState('');
    const [registrationSuccess, setRegistrationSuccess] = useState(false);
    const formRef = useRef(null);
    const [isDevelopment] = useState(
        window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    );

    // Check if already logged in
    useEffect(() => {
        const checkAuthAndRedirect = async () => {
            const token = localStorage.getItem('ACCESS_TOKEN');
            const user = JSON.parse(localStorage.getItem('USER') || '{}');
            
            if (token) {
                try {
                    // Validate token by making a simple API call
                    await api.get('/profile');
                    
                    // If successful, redirect based on role
                    if (user.role === 'ADMIN') {
                        navigate('/dashboard', { replace: true });
                    } else {
                        navigate('/users/dashboard', { replace: true });
                    }
                } catch (error) {
                    // Token is invalid, remove it
                    localStorage.removeItem('ACCESS_TOKEN');
                    localStorage.removeItem('REFRESH_TOKEN');
                    localStorage.removeItem('USER');
                }
            }
        };
        
        checkAuthAndRedirect();
    }, [navigate]);

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

    // Function to calculate password strength
    useEffect(() => {
        if (!signUpPassword) {
            setPasswordStrength(0);
            return;
        }
        
        let strength = 0;
        
        // Length check
        if (signUpPassword.length >= 8) strength += 25;
        
        // Contains number
        if (/\d/.test(signUpPassword)) strength += 25;
        
        // Contains lowercase letter
        if (/[a-z]/.test(signUpPassword)) strength += 25;
        
        // Contains uppercase letter or special character
        if (/[A-Z]/.test(signUpPassword) || /[^A-Za-z0-9]/.test(signUpPassword)) strength += 25;
        
        setPasswordStrength(strength);
    }, [signUpPassword]);

    // Function to get strength text and color
    const getStrengthInfo = () => {
        if (passwordStrength === 0) return { text: 'None', color: 'bg-gray-200' };
        if (passwordStrength <= 25) return { text: 'Weak', color: 'bg-red-500' };
        if (passwordStrength <= 50) return { text: 'Fair', color: 'bg-orange-500' };
        if (passwordStrength <= 75) return { text: 'Good', color: 'bg-yellow-500' };
        return { text: 'Strong', color: 'bg-green-500' };
    };

    // Handle user sign-up
    async function handleSignUp(e) {
        e.preventDefault();
        
        if (formStep === 0) {
            // Validate first step (name and username)
            if (!signUpFirstName || !signUpLastName || !signUpUsername) {
                Notify.error('Please fill in all required fields');
                return;
            }
            
            // Move to next step
            setFormStep(1);
            return;
        }
        
        setLoader(true);
        try {
            // Create user
            const response = await api.post('/user/create-user', {
                firstName: signUpFirstName,
                lastName: signUpLastName,
                email: signUpEmail,
                password: signUpPassword,
                username: signUpUsername,
            });

            // Show success messages
            setRegistrationSuccess(true);
            Notify.success('Account Created Successfully');
            Notify.info('Please check your email to verify your account');

            // In development mode, show the verification token if available
            if (isDevelopment && response.data?.verificationToken) {
                Notify.info(`Dev mode: Your verification token is ${response.data.verificationToken}`);
            }

            // Reset the signup form after delay
            setTimeout(() => {
                setRegistrationSuccess(false);
                setIsSignUp(false);
                setFormStep(0);
                setSignUpFirstName('');
                setSignUpLastName('');
                setSignUpEmail('');
                setSignUpPassword('');
                setSignUpUsername('');
                
                // Pre-fill login email for convenience
                setLoginEmail(signUpEmail);
            }, 3000);
            
        } catch (error) {
            // Handle error responses
            const errorMessage = error.response?.data?.message || 'An error occurred';
            Notify.error(errorMessage);
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
            if (user.role === 'ADMIN') {
                navigate('/dashboard', { replace: true });
            } else {
                navigate('/users/dashboard', { replace: true });
            }
        } catch (error) {
            console.error("Login error:", error);
            
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

    // Reset form when switching between login and signup
    const switchMode = (mode) => {
        if ((mode === 'signin' && !isSignUp) || (mode === 'signup' && isSignUp)) {
            return; // Already in this mode
        }
        
        // Reset the form
        setFormStep(0);
        setIsSignUp(mode === 'signup');
        
        // Add animation class to form
        if (formRef.current) {
            formRef.current.classList.add('animate-form-switch');
            setTimeout(() => {
                formRef.current.classList.remove('animate-form-switch');
            }, 500);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-900 to-blue-900 py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
            {/* Animated Background Elements */}
            <div className="absolute inset-0 overflow-hidden">
                {/* Background Gradient */}
                <div className="absolute inset-0 bg-gradient-to-br from-green-900/90 via-black/80 to-blue-900/90 backdrop-blur-sm z-0"></div>
                
                {/* Animated Circles */}
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-green-500/20 rounded-full mix-blend-multiply filter blur-[80px] animate-pulse-slow"></div>
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/20 rounded-full mix-blend-multiply filter blur-[80px] animate-pulse-slow" style={{ animationDelay: '1s' }}></div>
                
                {/* Floating particles */}
                {[...Array(15)].map((_, i) => (
                    <div 
                        key={i}
                        className="absolute rounded-full bg-white/5 animate-float-slow"
                        style={{
                            width: `${5 + Math.random() * 15}px`,
                            height: `${5 + Math.random() * 15}px`,
                            top: `${Math.random() * 100}%`,
                            left: `${Math.random() * 100}%`,
                            animationDuration: `${5 + Math.random() * 10}s`,
                            animationDelay: `${Math.random() * 5}s`,
                        }}
                    />
                ))}
            </div>

            {/* Main Content */}
            <div className="relative z-10 max-w-md w-full">
                {/* Logo/Brand */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white/10 backdrop-blur-md mb-4">
                        <span className="text-2xl font-black text-white">M</span>
                    </div>
                    <h1 className="text-3xl font-bold text-white">Muong Forum</h1>
                    <p className="mt-2 text-green-300">Connect with the community</p>
                </div>
                
                {/* Auth Card */}
                <div className="bg-white/10 backdrop-blur-md rounded-2xl shadow-2xl overflow-hidden relative">
                    {/* Mode Switcher Tabs */}
                    <div className="flex border-b border-white/20">
                        <button
                            type="button"
                            onClick={() => switchMode('signin')}
                            className={`flex-1 py-4 text-center font-medium text-sm transition-all relative ${
                                !isSignUp ? 'text-white' : 'text-white/60 hover:text-white/80'
                            }`}
                        >
                            <span className="flex items-center justify-center">
                                <LogIn className="h-4 w-4 mr-2" />
                                Sign In
                            </span>
                            {!isSignUp && (
                                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-green-400 to-blue-500"></span>
                            )}
                        </button>
                        <button
                            type="button"
                            onClick={() => switchMode('signup')}
                            className={`flex-1 py-4 text-center font-medium text-sm transition-all relative ${
                                isSignUp ? 'text-white' : 'text-white/60 hover:text-white/80'
                            }`}
                        >
                            <span className="flex items-center justify-center">
                                <UserPlus className="h-4 w-4 mr-2" />
                                Create Account
                            </span>
                            {isSignUp && (
                                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-green-400 to-blue-500"></span>
                            )}
                        </button>
                    </div>
                    
                    <div className="p-8" ref={formRef}>
                        {/* Loader */}
                        {loader && (
                            <div className="absolute inset-0 flex items-center justify-center bg-black/30 backdrop-blur-sm z-50">
                                <Loader />
                            </div>
                        )}
                        
                        {/* Registration Success Message */}
                        {registrationSuccess ? (
                            <div className="py-8 flex flex-col items-center justify-center animate-fade-in">
                                <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mb-4 animate-bounce-slow">
                                    <CheckCircle className="h-8 w-8 text-green-600" />
                                </div>
                                <h2 className="text-xl font-bold text-white mb-2">Registration Successful!</h2>
                                <p className="text-center text-white/80 mb-4">
                                    Please check your email to verify your account.
                                </p>
                            </div>
                        ) : isSignUp ? (
                            /* Sign Up Form */
                            <form onSubmit={handleSignUp} className="space-y-6">
                                {/* Form Step Indicator */}
                                <div className="flex mb-6">
                                    <div className={`h-1 flex-1 rounded-l-full ${formStep >= 0 ? 'bg-green-500' : 'bg-white/20'}`}></div>
                                    <div className={`h-1 flex-1 rounded-r-full ${formStep >= 1 ? 'bg-green-500' : 'bg-white/20'}`}></div>
                                </div>
                                
                                {formStep === 0 ? (
                                    /* Step 1: Personal Information */
                                    <>
                                        <h3 className="text-xl font-bold text-white mb-4">Personal Information</h3>
                                        
                                        <div className="space-y-4">
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-white/80 text-sm mb-1">
                                                        First Name
                                                    </label>
                                                    <div className={`relative border border-white/20 rounded-lg overflow-hidden transition-all ${
                                                        inputFocus === 'firstName' ? 'border-green-400 ring-1 ring-green-400' : 'hover:border-white/40'
                                                    }`}>
                                                        <input
                                                            type="text"
                                                            placeholder="First Name"
                                                            className="w-full px-4 py-3 bg-white/5 text-white placeholder-white/40 outline-none"
                                                            required
                                                            value={signUpFirstName}
                                                            onChange={(e) => setSignUpFirstName(e.target.value)}
                                                            onFocus={() => setInputFocus('firstName')}
                                                            onBlur={() => setInputFocus('')}
                                                        />
                                                    </div>
                                                </div>
                                                <div>
                                                    <label className="block text-white/80 text-sm mb-1">
                                                        Last Name
                                                    </label>
                                                    <div className={`relative border border-white/20 rounded-lg overflow-hidden transition-all ${
                                                        inputFocus === 'lastName' ? 'border-green-400 ring-1 ring-green-400' : 'hover:border-white/40'
                                                    }`}>
                                                        <input
                                                            type="text"
                                                            placeholder="Last Name"
                                                            className="w-full px-4 py-3 bg-white/5 text-white placeholder-white/40 outline-none"
                                                            required
                                                            value={signUpLastName}
                                                            onChange={(e) => setSignUpLastName(e.target.value)}
                                                            onFocus={() => setInputFocus('lastName')}
                                                            onBlur={() => setInputFocus('')}
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                            
                                            <div>
                                                <label className="block text-white/80 text-sm mb-1">
                                                    Username
                                                </label>
                                                <div className={`relative border border-white/20 rounded-lg overflow-hidden transition-all ${
                                                    inputFocus === 'username' ? 'border-green-400 ring-1 ring-green-400' : 'hover:border-white/40'
                                                }`}>
                                                    <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white/40">
                                                        <User className="h-5 w-5" />
                                                    </div>
                                                    <input
                                                        type="text"
                                                        placeholder="Choose a username"
                                                        className="w-full pl-12 pr-4 py-3 bg-white/5 text-white placeholder-white/40 outline-none"
                                                        required
                                                        value={signUpUsername}
                                                        onChange={(e) => setSignUpUsername(e.target.value)}
                                                        onFocus={() => setInputFocus('username')}
                                                        onBlur={() => setInputFocus('')}
                                                    />
                                                </div>
                                            </div>
                                            
                                            <div className="pt-4">
                                                <button
                                                    type="button"
                                                    onClick={(e) => handleSignUp(e)}
                                                    className="group w-full flex items-center justify-center py-3 px-4 bg-gradient-to-r from-green-400 to-blue-500 hover:from-green-500 hover:to-blue-600 text-white rounded-lg font-medium transition-all"
                                                >
                                                    <span>Continue</span>
                                                    <ArrowRight className="ml-2 h-5 w-5 transform group-hover:translate-x-1 transition-transform" />
                                                </button>
                                            </div>
                                        </div>
                                    </>
                                ) : (
                                    /* Step 2: Account Information */
                                    <>
                                        <h3 className="text-xl font-bold text-white mb-4">Account Information</h3>
                                        
                                        <div className="space-y-4">
                                            <div>
                                                <label className="block text-white/80 text-sm mb-1">
                                                    Email Address
                                                </label>
                                                <div className={`relative border border-white/20 rounded-lg overflow-hidden transition-all ${
                                                    inputFocus === 'email' ? 'border-green-400 ring-1 ring-green-400' : 'hover:border-white/40'
                                                }`}>
                                                    <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white/40">
                                                        <Mail className="h-5 w-5" />
                                                    </div>
                                                    <input
                                                        type="email"
                                                        placeholder="your.email@example.com"
                                                        className="w-full pl-12 pr-4 py-3 bg-white/5 text-white placeholder-white/40 outline-none"
                                                        required
                                                        value={signUpEmail}
                                                        onChange={(e) => setSignUpEmail(e.target.value)}
                                                        onFocus={() => setInputFocus('email')}
                                                        onBlur={() => setInputFocus('')}
                                                    />
                                                </div>
                                                <p className="mt-1 text-white/60 text-xs">
                                                    We'll send a verification link to this email
                                                </p>
                                            </div>
                                            
                                            <div>
                                                <label className="block text-white/80 text-sm mb-1">
                                                    Password
                                                </label>
                                                <div className={`relative border border-white/20 rounded-lg overflow-hidden transition-all ${
                                                    inputFocus === 'password' ? 'border-green-400 ring-1 ring-green-400' : 'hover:border-white/40'
                                                }`}>
                                                    <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white/40">
                                                        <LockKeyhole className="h-5 w-5" />
                                                    </div>
                                                    <input
                                                        type={showPassword ? "text" : "password"}
                                                        placeholder="Create a strong password"
                                                        className="w-full pl-12 pr-12 py-3 bg-white/5 text-white placeholder-white/40 outline-none"
                                                        required
                                                        minLength={8}
                                                        value={signUpPassword}
                                                        onChange={(e) => setSignUpPassword(e.target.value)}
                                                        onFocus={() => setInputFocus('password')}
                                                        onBlur={() => setInputFocus('')}
                                                    />
                                                    <button
                                                        type="button"
                                                        className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white/40 hover:text-white/60"
                                                        onClick={() => setShowPassword(!showPassword)}
                                                    >
                                                        {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                                    </button>
                                                </div>
                                                
                                                {/* Password Strength Meter */}
                                                {signUpPassword && (
                                                    <div className="mt-2">
                                                        <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
                                                            <div 
                                                                className={`h-full ${getStrengthInfo().color} transition-all duration-300`}
                                                                style={{ width: `${passwordStrength}%` }}
                                                            ></div>
                                                        </div>
                                                        <p className="mt-1 text-white/60 text-xs flex items-center">
                                                            Password strength: 
                                                            <span className="ml-1 font-medium">{getStrengthInfo().text}</span>
                                                        </p>
                                                    </div>
                                                )}
                                            </div>
                                            
                                            <div className="flex items-start mt-4">
                                                <div className="flex items-center h-5">
                                                    <input
                                                        id="terms"
                                                        name="terms"
                                                        type="checkbox"
                                                        required
                                                        className="h-4 w-4 text-green-500 rounded border-white/20 bg-white/5 focus:ring-green-400"
                                                    />
                                                </div>
                                                <div className="ml-3 text-sm">
                                                    <label htmlFor="terms" className="text-white/80">
                                                        I agree to the <a href="#" className="text-green-400 hover:text-green-300">Terms of Service</a> and <a href="#" className="text-green-400 hover:text-green-300">Privacy Policy</a>
                                                    </label>
                                                </div>
                                            </div>
                                            
                                            <div className="pt-4 flex space-x-4">
                                                <button
                                                    type="button"
                                                    onClick={() => setFormStep(0)}
                                                    className="flex-1 py-3 px-4 border border-white/20 text-white rounded-lg font-medium hover:bg-white/5 transition-all"
                                                >
                                                    Back
                                                </button>
                                                <button
                                                    type="submit"
                                                    className="flex-1 py-3 px-4 bg-gradient-to-r from-green-400 to-blue-500 hover:from-green-500 hover:to-blue-600 text-white rounded-lg font-medium transition-all"
                                                >
                                                    Create Account
                                                </button>
                                            </div>
                                        </div>
                                    </>
                                )}
                            </form>
                        ) : (
                            /* Sign In Form */
                            <form onSubmit={handleSignIn} className="space-y-6">
                                <h3 className="text-xl font-bold text-white mb-4">Welcome Back</h3>
                                
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-white/80 text-sm mb-1">
                                            Email Address
                                        </label>
                                        <div className={`relative border border-white/20 rounded-lg overflow-hidden transition-all ${
                                            inputFocus === 'loginEmail' ? 'border-green-400 ring-1 ring-green-400' : 'hover:border-white/40'
                                        }`}>
                                            <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white/40">
                                                <Mail className="h-5 w-5" />
                                            </div>
                                            <input
                                                type="email"
                                                placeholder="Your email address"
                                                className="w-full pl-12 pr-4 py-3 bg-white/5 text-white placeholder-white/40 outline-none"
                                                required
                                                value={loginEmail}
                                                onChange={(e) => setLoginEmail(e.target.value)}
                                                onFocus={() => setInputFocus('loginEmail')}
                                                onBlur={() => setInputFocus('')}
                                            />
                                        </div>
                                    </div>
                                    
                                    <div>
                                        <label className="block text-white/80 text-sm mb-1">
                                            Password
                                        </label>
                                        <div className={`relative border border-white/20 rounded-lg overflow-hidden transition-all ${
                                            inputFocus === 'loginPassword' ? 'border-green-400 ring-1 ring-green-400' : 'hover:border-white/40'
                                        }`}>
                                            <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white/40">
                                                <Key className="h-5 w-5" />
                                            </div>
                                            <input
                                                type={showPassword ? "text" : "password"}
                                                placeholder="Your password"
                                                className="w-full pl-12 pr-12 py-3 bg-white/5 text-white placeholder-white/40 outline-none"
                                                required
                                                value={loginPassword}
                                                onChange={(e) => setLoginPassword(e.target.value)}
                                                onFocus={() => setInputFocus('loginPassword')}
                                                onBlur={() => setInputFocus('')}
                                            />
                                            <button
                                                type="button"
                                                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white/40 hover:text-white/60"
                                                onClick={() => setShowPassword(!showPassword)}
                                            >
                                                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                            </button>
                                        </div>
                                    </div>
                                    
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center">
                                            <input
                                                id="remember-me"
                                                name="remember-me"
                                                type="checkbox"
                                                className="h-4 w-4 text-green-500 rounded border-white/20 bg-white/5 focus:ring-green-400"
                                            />
                                            <label htmlFor="remember-me" className="ml-2 block text-sm text-white/80">
                                                Remember me
                                            </label>
                                        </div>
                                        
                                        <Link to="/forgot-password" className="text-sm text-green-400 hover:text-green-300">
                                            Forgot password?
                                        </Link>
                                    </div>
                                    
                                    <div className="pt-2">
                                        <button
                                            type="submit"
                                            className="group w-full flex items-center justify-center py-3 px-4 bg-gradient-to-r from-green-400 to-blue-500 hover:from-green-500 hover:to-blue-600 text-white rounded-lg font-medium transition-all"
                                        >
                                            Sign In
                                            <ArrowRight className="ml-2 h-5 w-5 transform group-hover:translate-x-1 transition-transform" />
                                        </button>
                                    </div>
                                </div>
                            </form>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};


export default AuthPage;
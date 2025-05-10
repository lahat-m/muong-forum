// frontend/components/BookSpot.jsx
import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { X, Calendar, Clock, MapPin, CheckCircle, User, Mail, Phone, Users } from "lucide-react";
import api from "../api";
import Notify from "../components/Notify";
import Loader from "../components/Loader";

const BookSpot = ({ visible, event, onCancel, onSuccess }) => {
    const { register, handleSubmit, reset, formState: { errors } } = useForm({ mode: 'onBlur' });
    const [submitting, setSubmitting] = useState(false);
    const [formStep, setFormStep] = useState(0);
    const [formProgress, setFormProgress] = useState(0);
    const [showConfetti, setShowConfetti] = useState(false);
    
    // Calculate form progress based on filled fields
    useEffect(() => {
        if (!visible) return;
        
        const checkProgress = () => {
            const fields = ['name', 'email', 'phone', 'sex'];
            let filledCount = 0;
            
            // Check if each field has a value
            fields.forEach(field => {
                const input = document.querySelector(`[name="${field}"]`);
                if (input && input.value) filledCount++;
            });
            
            // Calculate percentage
            setFormProgress((filledCount / fields.length) * 100);
        };
        
        // Add listeners to all form fields
        const inputs = document.querySelectorAll('input, select');
        inputs.forEach(input => input.addEventListener('change', checkProgress));
        
        return () => {
            inputs.forEach(input => input.removeEventListener('change', checkProgress));
        };
    }, [visible]);

    // Reset state when modal becomes visible
    useEffect(() => {
        if (visible) {
            setFormStep(0);
            setFormProgress(0);
            setShowConfetti(false);
        }
    }, [visible]);

    // Only render if visible and an event is provided.
    if (!visible || !event) return null;

    // Get gradient based on event focus
    const getEventGradient = (event) => {
        // Map event focus to color scheme
        const focusColors = {
            'Education': 'from-blue-500 to-indigo-600',
            'Culture': 'from-amber-500 to-red-600',
            'History': 'from-emerald-500 to-teal-600',
            'Technology': 'from-purple-500 to-pink-600',
            'Arts': 'from-rose-400 to-pink-600',
            'Community': 'from-cyan-500 to-blue-600',
            'Leadership': 'from-yellow-400 to-orange-600',
        };
        
        // Default gradient if no match
        return focusColors[event.eventFocus] || 'from-green-500 to-teal-600';
    };

    // Format date for display
    const formatEventDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            weekday: 'long',
            month: 'long',
            day: 'numeric',
            year: 'numeric'
        });
    };

    // Format time for display
    const formatEventTime = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleTimeString('en-US', {
            hour: '2-digit', 
            minute: '2-digit'
        });
    };

    const checkTokenAndProceed = async (apiCall) => {
        try {
            return await apiCall();
        } catch (error) {
            console.error("API call error:", error);
            
            if (error.response && error.response.status === 401) {
                // Try to get a fresh token using the refresh token
                try {
                    const refreshToken = localStorage.getItem("REFRESH_TOKEN");
                    if (!refreshToken) {
                        throw new Error("No refresh token available");
                    }
                    
                    const refreshResponse = await api.post("/auth/refresh-token", {
                        refreshToken: refreshToken
                    });
                    
                    if (refreshResponse.data && refreshResponse.data.accessToken) {
                        localStorage.setItem("ACCESS_TOKEN", refreshResponse.data.accessToken);
                        
                        // Retry the original API call with the new token
                        return await apiCall();
                    } else {
                        throw new Error("Invalid refresh response");
                    }
                } catch (refreshError) {
                    console.error("Token refresh failed:", refreshError);
                    Notify.error("Your session has expired. Please log in again.");
                    throw refreshError;
                }
            }
            
            throw error;
        }
    };

    const onSubmit = async (data) => {
        console.log("Submitting participant data:", data);
        setSubmitting(true);
        
        try {
            // Get user info from localStorage
            const userInfo = JSON.parse(localStorage.getItem("USER") || "{}");
            
            // Prepare payload with participant details and event ID.
            // Using the exact structure that your API expects
            const payload = { 
                eventId: event.id,
                name: data.name,
                email: data.email,
                phone: data.phone,
                sex: data.sex,
                // Optional: Add userId if you want to track which user registered
                userId: userInfo.id
            };

            console.log("Sending payload to register-participant:", payload);

            // Post participant data to API using the exact endpoint from your backend
            const response = await checkTokenAndProceed(() => 
                api.post("/participant/register-participant", payload)
            );

            console.log("Registration response:", response.data);

            // Show success notification and confetti effect
            setShowConfetti(true);
            Notify.success("You have successfully registered for this event!");
            
            // Move to success step
            setFormStep(1);
            
            // Reset form after delay
            setTimeout(() => {
                reset();
                setFormStep(0);
                setFormProgress(0);
                setShowConfetti(false);
                
                // Notify parent component of success
                if (onSuccess) onSuccess();
            }, 3000);
            
        } catch (error) {
            console.error("Error registering participant:", error);
            
            // Show appropriate error message
            if (error.response && error.response.data && error.response.data.message) {
                Notify.error(error.response.data.message);
            } else {
                Notify.error("Failed to register. Please try again later.");
            }
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Animated backdrop */}
            <div 
                className="absolute inset-0 backdrop-blur-md bg-black bg-opacity-70"
                onClick={onCancel} // Close on backdrop click
            >
                {/* Create particle effect for confetti */}
                {showConfetti && (
                    <div className="absolute inset-0 overflow-hidden">
                        {[...Array(30)].map((_, i) => (
                            <div 
                                key={i}
                                className="absolute w-2 h-2 rounded-full"
                                style={{
                                    backgroundColor: `hsl(${Math.random() * 360}, 100%, 50%)`,
                                    top: `${Math.random() * 100}%`,
                                    left: `${Math.random() * 100}%`,
                                    animation: `fall ${1 + Math.random() * 3}s linear forwards`,
                                    animationDelay: `${Math.random() * 0.5}s`,
                                }}
                            />
                        ))}
                    </div>
                )}
            </div>

            {/* Modal Card with Glassmorphism */}
            <div 
                className="relative max-w-3xl w-full mx-6 rounded-2xl overflow-hidden shadow-2xl transform transition-all duration-500"
                onClick={e => e.stopPropagation()} // Prevent closing on card click
            >
                {/* Close Button */}
                <button
                    type="button"
                    onClick={onCancel}
                    className="absolute top-4 right-4 z-10 p-2 rounded-full bg-white/10 backdrop-blur-sm text-white hover:bg-white/20 transition-all"
                    disabled={submitting}
                >
                    <X size={20} />
                </button>

                {/* Card Content */}
                <div className="grid md:grid-cols-5">
                    {/* Left Side - Event Details */}
                    <div className={`relative md:col-span-2 p-0 ${formStep === 1 ? 'hidden md:block' : ''}`}>
                        {/* Event Image or Gradient Background */}
                        <div className="absolute inset-0 -z-10">
                            {event.eventPoster ? (
                                <>
                                    <img 
                                        src={event.eventPoster} 
                                        alt={event.title} 
                                        className="w-full h-full object-cover"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/70 to-black/50"></div>
                                </>
                            ) : (
                                <div className={`w-full h-full bg-gradient-to-r ${getEventGradient(event)}`}>
                                    <div className="absolute inset-0 bg-black/40"></div>
                                </div>
                            )}
                        </div>

                        {/* Event Details */}
                        <div className="relative z-10 p-8 h-full flex flex-col">
                            <div className="flex-1">
                                {/* Event Badge */}
                                <div className="inline-block px-3 py-1 mb-6 rounded-full text-xs font-semibold bg-white/20 backdrop-blur-sm text-white">
                                    {event.eventFocus}
                                </div>
                                
                                <h3 className="text-2xl font-bold text-white mb-3">{event.title}</h3>
                                
                                <div className="space-y-4 mb-6">
                                    <div className="flex items-center text-white/80">
                                        <Calendar className="h-4 w-4 mr-2 text-green-400" />
                                        <span>{formatEventDate(event.date)}</span>
                                    </div>
                                    
                                    <div className="flex items-center text-white/80">
                                        <Clock className="h-4 w-4 mr-2 text-green-400" />
                                        <span>{formatEventTime(event.date)}</span>
                                    </div>
                                    
                                    <div className="flex items-center text-white/80">
                                        <MapPin className="h-4 w-4 mr-2 text-green-400" />
                                        <span>
                                            {event.location}
                                            <span className={`ml-2 px-2 py-0.5 text-xs rounded-full ${
                                                event.locationType === 'ONLINE' 
                                                    ? 'bg-blue-500/60 text-white' 
                                                    : 'bg-amber-500/60 text-white'
                                            }`}>
                                                {event.locationType}
                                            </span>
                                        </span>
                                    </div>
                                    
                                    <div className="flex items-center text-white/80">
                                        <Users className="h-4 w-4 mr-2 text-green-400" />
                                        <span>
                                            {event.registrations?.length || 0} participants registered
                                        </span>
                                    </div>
                                </div>
                            </div>
                            
                            {/* Progress Bar (mobile only) */}
                            <div className="block md:hidden w-full h-1 bg-white/20 rounded-full overflow-hidden mb-4">
                                <div 
                                    className="h-full bg-gradient-to-r from-green-400 to-blue-500 transition-all duration-500"
                                    style={{ width: `${formProgress}%` }}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Right Side - Form or Success */}
                    <div className={`md:col-span-3 bg-white p-8 ${formStep === 1 ? 'col-span-full' : ''}`}>
                        {formStep === 0 ? (
                            <form onSubmit={handleSubmit(onSubmit)}>
                                <h2 className="text-2xl font-bold mb-1 text-gray-800">
                                    Book Your Spot
                                </h2>
                                <p className="text-gray-600 mb-6">Fill in your details to register for this event</p>
                                
                                {/* Progress Bar (desktop only) */}
                                <div className="hidden md:block w-full h-1 bg-gray-200 rounded-full overflow-hidden mb-8">
                                    <div 
                                        className="h-full bg-gradient-to-r from-green-400 to-blue-500 transition-all duration-500"
                                        style={{ width: `${formProgress}%` }}
                                    />
                                </div>
                                
                                <div className="space-y-5">
                                    <div>
                                        <label className="flex items-center text-gray-700 mb-2 font-medium">
                                            <User className="h-4 w-4 mr-2 text-green-500" />
                                            Your Name
                                        </label>
                                        <input
                                            type="text"
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all"
                                            placeholder="Enter your full name"
                                            {...register("name", { 
                                                required: "Name is required" 
                                            })}
                                        />
                                        {errors.name && (
                                            <p className="text-red-500 text-sm mt-1 flex items-center">
                                                <X className="h-3 w-3 mr-1" />
                                                {errors.name.message}
                                            </p>
                                        )}
                                    </div>
                                    
                                    <div>
                                        <label className="flex items-center text-gray-700 mb-2 font-medium">
                                            <Mail className="h-4 w-4 mr-2 text-green-500" />
                                            Email Address
                                        </label>
                                        <input
                                            type="email"
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all"
                                            placeholder="you@example.com"
                                            {...register("email", { 
                                                required: "Email is required",
                                                pattern: {
                                                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                                    message: "Invalid email address"
                                                }
                                            })}
                                        />
                                        {errors.email && (
                                            <p className="text-red-500 text-sm mt-1 flex items-center">
                                                <X className="h-3 w-3 mr-1" />
                                                {errors.email.message}
                                            </p>
                                        )}
                                    </div>
                                    
                                    <div>
                                        <label className="flex items-center text-gray-700 mb-2 font-medium">
                                            <Phone className="h-4 w-4 mr-2 text-green-500" />
                                            Phone Number
                                        </label>
                                        <input
                                            type="text"
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all"
                                            placeholder="+1 (234) 567-8901"
                                            {...register("phone", { 
                                                required: "Phone number is required",
                                                pattern: {
                                                    value: /^[0-9+\s-]{10,15}$/,
                                                    message: "Please enter a valid phone number"
                                                }
                                            })}
                                        />
                                        {errors.phone && (
                                            <p className="text-red-500 text-sm mt-1 flex items-center">
                                                <X className="h-3 w-3 mr-1" />
                                                {errors.phone.message}
                                            </p>
                                        )}
                                    </div>
                                    
                                    <div>
                                        <label className="flex items-center text-gray-700 mb-2 font-medium">
                                            <Users className="h-4 w-4 mr-2 text-green-500" />
                                            Gender
                                        </label>
                                        <select
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all"
                                            {...register("sex", { 
                                                required: "Please select your gender" 
                                            })}
                                        >
                                            <option value="">Select your gender...</option>
                                            <option value="M">Male</option>
                                            <option value="F">Female</option>
                                        </select>
                                        {errors.sex && (
                                            <p className="text-red-500 text-sm mt-1 flex items-center">
                                                <X className="h-3 w-3 mr-1" />
                                                {errors.sex.message}
                                            </p>
                                        )}
                                    </div>
                                </div>
                                
                                <div className="mt-8 flex justify-end space-x-4">
                                    <button
                                        type="button"
                                        className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-all font-medium"
                                        onClick={onCancel}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={submitting}
                                        className={`px-8 py-3 rounded-lg text-white font-medium flex items-center justify-center transition-all ${
                                            submitting 
                                                ? 'bg-gray-400 cursor-not-allowed' 
                                                : 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 transform hover:translate-y-[-2px]'
                                        }`}
                                    >
                                        {submitting ? (
                                            <>
                                                <Loader size="sm" className="mr-2" />
                                                Registering...
                                            </>
                                        ) : (
                                            "Register Now"
                                        )}
                                    </button>
                                </div>
                            </form>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-8 text-center">
                                <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mb-6 animate-bounce-slow">
                                    <CheckCircle className="h-10 w-10 text-green-600" />
                                </div>
                                
                                <h2 className="text-3xl font-bold mb-2 text-gray-800">
                                    Registration Complete!
                                </h2>
                                
                                <p className="text-gray-600 max-w-md mx-auto mb-8">
                                    You've successfully registered for <strong>{event.title}</strong>. 
                                    Check your email for confirmation and event details.
                                </p>
                                
                                <div className="bg-blue-50 rounded-xl p-4 mb-6 border border-blue-200 max-w-md">
                                    <h3 className="font-medium text-blue-800 mb-2">Next Steps</h3>
                                    <ul className="text-blue-700 text-sm text-left space-y-2">
                                        <li className="flex items-start">
                                            <CheckCircle className="h-4 w-4 mr-2 text-blue-600 mt-0.5" />
                                           Thanks for signing up for this wonderful event. See you there!
                                        </li>
                                    </ul>
                                </div>
                                
                                <button
                                    type="button"
                                    onClick={onCancel}
                                    className="px-8 py-3 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-lg font-medium transition-all transform hover:translate-y-[-2px]"
                                >
                                    Done
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BookSpot;
// src/pages/LandingPage.jsx

import React, { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { 
  UserCheck, Mail, Key, Info, Calendar, MapPin, Clock, Users, 
  ChevronRight, Filter, Star, Sparkles, Globe, Coffee, Video,
  ArrowUpRight, TrendingUp, CalendarDays, Flame, X, ChevronLeft, ChevronDown
} from "lucide-react";
import api from "../api";
import Loader from "../components/Loader";
import NavBar from "../components/NavBar";
import EventComponent from "../components/EventComponent";
import BookSpot from "../components/BookSpot";

const LandingPage = () => {
    const [events, setEvents] = useState([]);
    const [filteredEvents, setFilteredEvents] = useState([]);
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [showBookSpot, setShowBookSpot] = useState(false);
    const [showAuthInfo, setShowAuthInfo] = useState(false);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState("all"); // Options: "all", "upcoming", "popular"
    const [expandedEventId, setExpandedEventId] = useState(null);
    const [showFullDescription, setShowFullDescription] = useState(false);
    const [spotlightEvent, setSpotlightEvent] = useState(null);
    const [viewMode, setViewMode] = useState("grid"); // "grid", "carousel", "spotlight"
    const [carouselIndex, setCarouselIndex] = useState(0);
    const spotlightRef = useRef(null);
    const navigate = useNavigate();
    const location = useLocation();

    // Check for verification success message in URL params
    useEffect(() => {
        const queryParams = new URLSearchParams(location.search);
        const verificationSuccess = queryParams.get('verified');
        
        if (verificationSuccess === 'true') {
            console.log('Email verification successful');
        }
    }, [location]);

    // Fetch events and update state
    const fetchEvents = useCallback(async () => {
        setLoading(true);
        try {
            const response = await api.get("/event");
            setEvents(response.data);
            setFilteredEvents(response.data);
            
            // Set spotlight event (featured event)
            if (response.data.length > 0) {
                // Find event with most participants or most recent
                const mostPopular = [...response.data].sort((a, b) => 
                    (b.registrations?.length || 0) - (a.registrations?.length || 0)
                )[0];
                setSpotlightEvent(mostPopular);
            }
        } catch (error) {
            console.error("Error fetching events", error);
        } finally {
            setLoading(false);
        }
    }, []);

    // Fetch events on component mount
    useEffect(() => {
        fetchEvents();
    }, [fetchEvents]);

    // Filter events when filter changes
    useEffect(() => {
        if (events.length === 0) return;
        
        let filtered = [...events];
        const now = new Date();
        
        if (filter === "upcoming") {
            filtered = events.filter(event => new Date(event.date) > now)
                            .sort((a, b) => new Date(a.date) - new Date(b.date));
        } else if (filter === "popular") {
            filtered = events.sort((a, b) => 
                (b.registrations?.length || 0) - (a.registrations?.length || 0)
            );
        }
        
        setFilteredEvents(filtered);
        // Reset carousel index when filter changes
        setCarouselIndex(0);
    }, [filter, events]);

    // Auto-scroll carousel
    useEffect(() => {
        if (viewMode !== "carousel" || filteredEvents.length <= 1) return;
        
        const interval = setInterval(() => {
            setCarouselIndex(prevIndex => (prevIndex + 1) % filteredEvents.length);
        }, 5000);
        
        return () => clearInterval(interval);
    }, [viewMode, filteredEvents.length]);

    // Scroll to spotlight event when selected
    useEffect(() => {
        if (spotlightRef.current && expandedEventId) {
            spotlightRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [expandedEventId]);

    // Open the BookSpot modal when the user selects an event
    const handleOpenBookSpot = (event) => {
        setSelectedEvent(event);
        setShowBookSpot(true);
    };

    // Toggle event expand state
    const toggleEventExpand = (eventId) => {
        setExpandedEventId(expandedEventId === eventId ? null : eventId);
        setShowFullDescription(expandedEventId !== eventId);
    };

    // Toggle auth info modal
    const toggleAuthInfo = () => {
        setShowAuthInfo(!showAuthInfo);
    };

    // Format date for display
    const formatEventDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            month: 'short',
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

    // Calculate days until event
    const getDaysUntilEvent = (dateString) => {
        const eventDate = new Date(dateString);
        const today = new Date();
        const diffTime = eventDate - today;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays;
    };

    // Get carousel events (visible events in carousel mode)
    const getCarouselEvents = () => {
        if (filteredEvents.length <= 1) return filteredEvents;
        
        const visibleEvents = [];
        const total = filteredEvents.length;
        
        // Previous, current, and next events
        visibleEvents.push(filteredEvents[(carouselIndex - 1 + total) % total]);
        visibleEvents.push(filteredEvents[carouselIndex]);
        visibleEvents.push(filteredEvents[(carouselIndex + 1) % total]);
        
        return visibleEvents;
    };

    // Generate dynamic background gradient based on event focus
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

    return (
        <div className="relative min-h-screen overflow-hidden">
            {/* Image Background Layer */}
            <img
                className="fixed top-0 left-0 w-full h-full object-cover animate-fade z-[-2]"
                src="/bg.gif"
                alt="Background Animation"
            />

            {/* Navigation Bar */}
            <NavBar />

            {/* Hero Section */}
            <section className="relative z-10 flex flex-col items-center justify-center text-center py-12 px-6">
                <h1 className="text-5xl mt-22 md:text-7xl font-extrabold text-white drop-shadow-lg">
                    Muong Forum
                </h1>
                <p className="mt-6 text-red-500 font-bold md:text-2xl text-green-300 max-w-2xl">
                    People . History . Culture . Future
                </p>
                <div className="mt-8 flex flex-col sm:flex-row gap-4">
                    <button
                        className="bg-green-500 hover:bg-green-400 text-white px-8 py-3 rounded-full text-lg transition transform hover:scale-105 shadow-lg"
                        onClick={() => navigate("/auth")}
                    >
                        Start Now
                    </button>
                    <button
                        className="bg-blue-500 hover:bg-blue-400 text-white px-8 py-3 rounded-full text-lg transition transform hover:scale-105 shadow-lg flex items-center justify-center"
                        onClick={toggleAuthInfo}
                    >
                        <Info className="mr-2 h-5 w-5" />
                        Account Information
                    </button>
                </div>
            </section>

            {/* Auth Information Modal */}
            {showAuthInfo && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-lg max-w-md w-full p-6 shadow-xl">
                        <h3 className="text-xl font-bold mb-4 text-gray-800">Account Information</h3>
                        
                        <div className="mb-4">
                            <div className="flex items-start mb-2">
                                <Mail className="text-blue-500 mt-1 mr-2 h-5 w-5 flex-shrink-0" />
                                <div>
                                    <h4 className="font-medium text-gray-800">Email Verification</h4>
                                    <p className="text-sm text-gray-600">
                                        After registration, you'll receive a verification email. Please check your inbox and click the verification link to activate your account.
                                    </p>
                                </div>
                            </div>
                        </div>
                        
                        <div className="mb-4">
                            <div className="flex items-start mb-2">
                                <Key className="text-blue-500 mt-1 mr-2 h-5 w-5 flex-shrink-0" />
                                <div>
                                    <h4 className="font-medium text-gray-800">Password Reset</h4>
                                    <p className="text-sm text-gray-600">
                                        Forgot your password? You can reset it by clicking the "Forgot password?" link on the login page and following the instructions sent to your email.
                                    </p>
                                </div>
                            </div>
                        </div>
                        
                        <div className="flex justify-end mt-4">
                            <button
                                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
                                onClick={toggleAuthInfo}
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ★★★ ULTRA-CREATIVE EVENTS SECTION ★★★ */}
            <section className="relative z-10 py-16 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto">
                    {/* 3D Floating Header */}
                    <div className="text-center mb-12 relative perspective-1000">
                        <div className="inline-block relative transform-gpu animate-float">
                            <h2 className="text-5xl font-black text-white mb-4 relative z-10">
                                <span className="relative inline-block before:content-[''] before:absolute before:inset-0 before:bg-gradient-to-r before:from-green-500 before:to-blue-500 before:blur-lg before:opacity-70 before:-z-10">
                                    Discover Events
                                </span>
                            </h2>
                            <div className="absolute -inset-1 bg-gradient-to-r from-green-400 to-blue-500 rounded-lg blur opacity-30 -z-10 animate-pulse"></div>
                        </div>
                        
                        <p className="text-gray-300 max-w-2xl mx-auto relative z-10 text-lg">
                            Join our exciting events to learn, connect, and celebrate Muong culture
                        </p>
                        
                        {/* Floating animation Sparkles */}
                        <div className="absolute -top-10 right-1/4 animate-float-slow text-yellow-400 opacity-70">
                            <Sparkles size={24} />
                        </div>
                        <div className="absolute -bottom-6 left-1/3 animate-float-delay text-yellow-400 opacity-70">
                            <Sparkles size={16} />
                        </div>
                    </div>
                    
                    {/* Interactive View Mode Toggle & Filters */}
                    <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
                        {/* View Mode Selector */}
                        <div className="inline-flex bg-white bg-opacity-10 backdrop-blur-sm rounded-xl p-1 shadow-lg">
                            <button 
                                onClick={() => setViewMode("grid")}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center ${
                                    viewMode === "grid" 
                                        ? "bg-gradient-to-r from-green-500 to-green-600 text-white shadow-inner" 
                                        : "text-gray-200 hover:text-white"
                                }`}
                            >
                                <div className="grid grid-cols-2 gap-1 mr-2">
                                    <div className="w-2 h-2 bg-current rounded-sm"></div>
                                    <div className="w-2 h-2 bg-current rounded-sm"></div>
                                    <div className="w-2 h-2 bg-current rounded-sm"></div>
                                    <div className="w-2 h-2 bg-current rounded-sm"></div>
                                </div>
                                Grid View
                            </button>
                            <button 
                                onClick={() => setViewMode("carousel")}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center ${
                                    viewMode === "carousel" 
                                        ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-inner" 
                                        : "text-gray-200 hover:text-white"
                                }`}
                            >
                                <div className="flex items-center space-x-1 mr-2">
                                    <div className="w-2 h-4 bg-current rounded-sm"></div>
                                    <div className="w-4 h-6 bg-current rounded-sm"></div>
                                    <div className="w-2 h-4 bg-current rounded-sm"></div>
                                </div>
                                Carousel
                            </button>
                            <button 
                                onClick={() => setViewMode("spotlight")}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center ${
                                    viewMode === "spotlight" 
                                        ? "bg-gradient-to-r from-yellow-500 to-amber-600 text-white shadow-inner" 
                                        : "text-gray-200 hover:text-white"
                                }`}
                            >
                                <Star className="mr-2 h-4 w-4" />
                                Spotlight
                            </button>
                        </div>
                        
                        {/* Event Filters */}
                        <div className="inline-flex bg-white bg-opacity-10 backdrop-blur-sm rounded-xl p-1 shadow-lg">
                            <button 
                                onClick={() => setFilter("all")}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center ${
                                    filter === "all" 
                                        ? "bg-white text-green-700 shadow-inner" 
                                        : "text-gray-200 hover:text-white"
                                }`}
                            >
                                <Globe className="mr-2 h-4 w-4" />
                                All Events
                            </button>
                            <button 
                                onClick={() => setFilter("upcoming")}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center ${
                                    filter === "upcoming" 
                                        ? "bg-white text-blue-700 shadow-inner" 
                                        : "text-gray-200 hover:text-white"
                                }`}
                            >
                                <CalendarDays className="mr-2 h-4 w-4" />
                                Upcoming
                            </button>
                            <button 
                                onClick={() => setFilter("popular")}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center ${
                                    filter === "popular" 
                                        ? "bg-white text-amber-700 shadow-inner" 
                                        : "text-gray-200 hover:text-white"
                                }`}
                            >
                                <Flame className="mr-2 h-4 w-4" />
                                Popular
                            </button>
                        </div>
                    </div>
                    
                    {/* Events Display - Dynamic Based on View Mode */}
                    {loading ? (
                        <div className="flex justify-center items-center py-16">
                            <div className="relative">
                                <div className="w-16 h-16 border-t-4 border-b-4 border-green-500 rounded-full animate-spin"></div>
                                <div className="w-16 h-16 border-l-4 border-r-4 border-transparent border-b-4 border-blue-500 rounded-full animate-spin absolute top-0 left-0" style={{ animationDirection: "reverse", animationDuration: "1s" }}></div>
                                <div className="absolute inset-0 flex items-center justify-center text-white font-bold">
                                    <Sparkles size={14} />
                                </div>
                            </div>
                        </div>
                    ) : filteredEvents.length === 0 ? (
                        <div className="relative overflow-hidden py-16 bg-white bg-opacity-5 backdrop-blur-md rounded-3xl">
                            <div className="absolute inset-0 bg-gradient-to-r from-green-500/10 to-blue-500/10 animate-gradient-x"></div>
                            
                            <div className="relative z-10 flex flex-col items-center justify-center text-center p-8">
                                <div className="relative mb-8">
                                    <Calendar className="h-24 w-24 text-gray-400" />
                                    <div className="absolute -right-2 -bottom-2 p-2 bg-gray-800 rounded-full animate-bounce">
                                        <X className="h-4 w-4 text-gray-400" />
                                    </div>
                                </div>
                                
                                <h3 className="text-2xl font-bold text-white mb-4">No Events Available</h3>
                                <p className="text-gray-300 max-w-md mx-auto mb-8">
                                    We're planning exciting new events for the Muong Forum community. 
                                    Check back soon or subscribe to be notified when new events are announced.
                                </p>
                                
                                <button className="px-6 py-3 bg-gradient-to-r from-green-500 to-blue-500 text-white rounded-full font-medium hover:from-green-600 hover:to-blue-600 transform hover:scale-105 transition-all duration-300 shadow-lg flex items-center">
                                    <Mail className="mr-2 h-5 w-5" />
                                    Get Notified About New Events
                                </button>
                            </div>
                            
                            {/* Decorative elements */}
                            <div className="absolute top-6 left-10 w-20 h-20 bg-green-500 rounded-full filter blur-3xl opacity-20 animate-pulse-slow"></div>
                            <div className="absolute bottom-10 right-10 w-32 h-32 bg-blue-500 rounded-full filter blur-3xl opacity-20 animate-pulse-slow" style={{ animationDelay: "1s" }}></div>
                        </div>
                    ) : (
                        <>
                            {/* GRID VIEW MODE */}
                            {viewMode === "grid" && (
                                <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 relative z-10">
                                    {filteredEvents.map((event) => (
                                        <div 
                                            key={event.id} 
                                            className={`group relative rounded-2xl overflow-hidden transform transition-all duration-500 hover:scale-[1.02] ${
                                                expandedEventId === event.id 
                                                    ? "col-span-full row-span-2 md:col-span-2 md:row-span-2 z-20" 
                                                    : ""
                                            }`}
                                        >
                                            {/* Card Background with Gradient Overlay */}
                                            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/60 to-black/90 z-10"></div>
                                            
                                            {/* Expanding Button */}
                                            <button 
                                                onClick={() => toggleEventExpand(event.id)}
                                                className="absolute top-4 right-4 z-30 p-2 bg-white/20 backdrop-blur-sm rounded-full transition-all duration-300 hover:bg-white/40 group-hover:opacity-100 opacity-0"
                                            >
                                                {expandedEventId === event.id ? (
                                                    <X className="h-4 w-4 text-white" />
                                                ) : (
                                                    <ArrowUpRight className="h-4 w-4 text-white" />
                                                )}
                                            </button>
                                            
                                            {/* Event Image with Dynamic Styles */}
                                            <div className="h-full w-full aspect-[4/3]">
                                                {event.eventPoster ? (
                                                    <img 
                                                        src={event.eventPoster} 
                                                        alt={event.title} 
                                                        className={`w-full h-full object-cover transition-all duration-700 ${
                                                            expandedEventId === event.id 
                                                                ? "scale-100 filter brightness-50" 
                                                                : "group-hover:scale-110 group-hover:filter group-hover:brightness-75"
                                                        }`}
                                                    />
                                                ) : (
                                                    <div className={`w-full h-full flex items-center justify-center transition-all duration-700 bg-gradient-to-r ${getEventGradient(event)}`}>
                                                        <Calendar className="h-24 w-24 text-white/80" />
                                                    </div>
                                                )}
                                            </div>
                                            
                                            {/* Event Content Overlay */}
                                            <div className={`absolute inset-0 z-20 flex flex-col justify-end p-6 transition-all duration-500 ${
                                                expandedEventId === event.id 
                                                    ? "bg-black/60 backdrop-blur-sm" 
                                                    : "bg-gradient-to-t from-black/80 via-black/40 to-transparent"
                                            }`}>
                                                {/* Event Tags & Info */}
                                                <div className="flex flex-wrap gap-2 mb-3">
                                                    <span className="px-3 py-1 bg-green-500/80 backdrop-blur-sm rounded-full text-white text-xs font-semibold">
                                                        {event.eventFocus}
                                                    </span>
                                                    <span className={`px-3 py-1 rounded-full text-white text-xs font-semibold ${
                                                        event.locationType === 'ONLINE' 
                                                            ? 'bg-blue-500/80 backdrop-blur-sm' 
                                                            : 'bg-amber-500/80 backdrop-blur-sm'
                                                    }`}>
                                                        {event.locationType === 'ONLINE' ? (
                                                            <div className="flex items-center">
                                                                <Video className="h-3 w-3 mr-1" />
                                                                Online
                                                            </div>
                                                        ) : (
                                                            <div className="flex items-center">
                                                                <Coffee className="h-3 w-3 mr-1" />
                                                                In Person
                                                            </div>
                                                        )}
                                                    </span>
                                                    
                                                    {/* Days Until Event */}
                                                    {getDaysUntilEvent(event.date) > 0 && (
                                                        <span className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-white text-xs font-semibold">
                                                            In {getDaysUntilEvent(event.date)} days
                                                        </span>
                                                    )}
                                                </div>
                                                
                                                {/* Title & Description */}
                                                <h3 className="text-xl font-bold text-white mb-2">
                                                    {event.title}
                                                </h3>
                                                
                                                <p className={`text-gray-300 mb-4 transition-all duration-300 ${
                                                    expandedEventId === event.id || showFullDescription 
                                                        ? "" 
                                                        : "line-clamp-2"
                                                }`}>
                                                    {event.description}
                                                </p>
                                                
                                                {/* Event Details */}
                                                <div className={`space-y-2 mb-4 transition-all duration-300 ${
                                                    expandedEventId === event.id 
                                                        ? "opacity-100" 
                                                        : "opacity-0 group-hover:opacity-100"
                                                }`}>
                                                    <div className="flex items-center text-sm">
                                                        <Clock className="h-4 w-4 text-green-400 mr-2" />
                                                        <span className="text-gray-300">
                                                            {formatEventDate(event.date)} at {formatEventTime(event.date)}
                                                        </span>
                                                    </div>
                                                    
                                                    <div className="flex items-center text-sm">
                                                        <MapPin className="h-4 w-4 text-green-400 mr-2" />
                                                        <span className="text-gray-300">
                                                            {event.location}
                                                        </span>
                                                    </div>
                                                    
                                                    <div className="flex items-center text-sm">
                                                        <Users className="h-4 w-4 text-green-400 mr-2" />
                                                        <span className="text-gray-300">
                                                            {event.registrations?.length || 0} participants registered
                                                        </span>
                                                    </div>
                                                    
                                                    {expandedEventId === event.id && (
                                                        <div className="flex items-center text-sm mt-2">
                                                            <UserCheck className="h-4 w-4 text-green-400 mr-2" />
                                                            <span className="text-gray-300">
                                                                Speaker: {event.guestName} - {event.guestDesc}
                                                            </span>
                                                        </div>
                                                    )}
                                                </div>
                                                
                                                {/* Register Button */}
                                                <button
                                                    onClick={() => handleOpenBookSpot(event)}
                                                    className={`w-full py-3 rounded-lg flex items-center justify-center font-medium transition-all duration-300 ${
                                                        expandedEventId === event.id 
                                                            ? "bg-gradient-to-r from-green-500 to-green-600 text-white" 
                                                            : "bg-white/10 backdrop-blur-md text-white hover:bg-white/20"
                                                    }`}
                                                >
                                                    <span className="mr-2">Register Now</span>
                                                    <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                                                </button>
                                                
                                                {/* Participants Badge */}
                                                <div className="absolute top-4 left-4 bg-black/40 backdrop-blur-md rounded-full px-3 py-1 flex items-center">
                                                    <Users className="h-3 w-3 text-white mr-1" />
                                                    <span className="text-white text-xs font-bold">
                                                        {event.registrations?.length || 0}
                                                    </span>
                                                </div>
                                            </div>
                                            
                                            {/* Interactive Gradient Border for Expanded Card */}
                                            {expandedEventId === event.id && (
                                                <div className="absolute -inset-[2px] bg-gradient-to-r from-green-500 via-blue-500 to-green-500 rounded-2xl -z-10 animate-gradient-x"></div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                            
                            {/* CAROUSEL VIEW MODE */}
                            {viewMode === "carousel" && (
                                <div className="mt-8 relative">
                                    {/* Dynamic Carousel Track */}
                                    <div className="relative h-[500px] overflow-hidden rounded-2xl shadow-2xl">
                                        {/* Carousel Navigation */}
                                        {/* Carousel Navigation */}
                                        <div className="absolute inset-y-0 left-0 z-30 flex items-center">
                                            <button 
                                                onClick={() => setCarouselIndex((carouselIndex - 1 + filteredEvents.length) % filteredEvents.length)}
                                                className="bg-black/30 backdrop-blur-md text-white p-2 rounded-r-lg hover:bg-black/50 transition-all"
                                            >
                                                <ChevronLeft className="h-8 w-8" />
                                            </button>
                                        </div>
                                        
                                        <div className="absolute inset-y-0 right-0 z-30 flex items-center">
                                            <button 
                                                onClick={() => setCarouselIndex((carouselIndex + 1) % filteredEvents.length)}
                                                className="bg-black/30 backdrop-blur-md text-white p-2 rounded-l-lg hover:bg-black/50 transition-all"
                                            >
                                                <ChevronRight className="h-8 w-8" />
                                            </button>
                                        </div>
                                        
                                        {/* Carousel Slides */}
                                        <div className="flex h-full transition-transform duration-700 ease-out" 
                                            style={{ transform: `translateX(-${carouselIndex * 100}%)` }}>
                                            {filteredEvents.map((event, index) => (
                                                <div key={event.id} className="w-full h-full flex-shrink-0 relative">
                                                    {/* Slide Background */}
                                                    {event.eventPoster ? (
                                                        <img 
                                                            src={event.eventPoster} 
                                                            alt={event.title} 
                                                            className="w-full h-full object-cover"
                                                        />
                                                    ) : (
                                                        <div className={`w-full h-full flex items-center justify-center bg-gradient-to-r ${getEventGradient(event)}`}>
                                                            <Calendar className="h-32 w-32 text-white/80" />
                                                        </div>
                                                    )}
                                                    
                                                    {/* Content Overlay with Glassmorphism */}
                                                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent flex flex-col justify-end p-10">
                                                        {/* Event Info Tags */}
                                                        <div className="flex flex-wrap gap-3 mb-4">
                                                            <span className="px-4 py-1 bg-white/10 backdrop-blur-md rounded-full text-white text-sm">
                                                                {formatEventDate(event.date)}
                                                            </span>
                                                            <span className={`px-4 py-1 rounded-full text-white text-sm ${
                                                                event.locationType === 'ONLINE' 
                                                                    ? 'bg-blue-500/60 backdrop-blur-md' 
                                                                    : 'bg-amber-500/60 backdrop-blur-md'
                                                            }`}>
                                                                {event.locationType}
                                                            </span>
                                                            <span className="px-4 py-1 bg-green-500/60 backdrop-blur-md rounded-full text-white text-sm">
                                                                {event.eventFocus}
                                                            </span>
                                                        </div>
                                                        
                                                        {/* Title with Animated Underline */}
                                                        <h3 className="text-4xl font-bold text-white mb-4 relative inline-block">
                                                            {event.title}
                                                            <span className="absolute left-0 bottom-0 w-full h-1 bg-gradient-to-r from-green-400 to-blue-500 transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-500"></span>
                                                        </h3>
                                                        
                                                        {/* Description */}
                                                        <p className="text-gray-300 mb-6 max-w-2xl text-lg">
                                                            {event.description.length > 180 
                                                                ? `${event.description.substring(0, 180)}...` 
                                                                : event.description
                                                            }
                                                        </p>
                                                        
                                                        {/* Speaker Info */}
                                                        <div className="flex items-center mb-6">
                                                            <div className="w-12 h-12 rounded-full bg-gradient-to-r from-green-400 to-blue-500 flex items-center justify-center">
                                                                <UserCheck className="h-6 w-6 text-white" />
                                                            </div>
                                                            <div className="ml-4">
                                                                <h4 className="text-white font-bold">
                                                                    {event.guestName}
                                                                </h4>
                                                                <p className="text-gray-300 text-sm">
                                                                    {event.guestDesc}
                                                                </p>
                                                            </div>
                                                        </div>
                                                        
                                                        {/* Action Buttons */}
                                                        <div className="flex space-x-4">
                                                            <button
                                                                onClick={() => handleOpenBookSpot(event)}
                                                                className="px-8 py-3 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-lg flex items-center transition-all duration-300 transform hover:translate-y-[-2px] shadow-lg"
                                                            >
                                                                <span className="mr-2">Register Now</span>
                                                                <ChevronRight className="h-5 w-5" />
                                                            </button>
                                                            <button
                                                                onClick={() => toggleEventExpand(event.id)}
                                                                className="px-6 py-3 bg-white/10 backdrop-blur-md hover:bg-white/20 text-white rounded-lg transition-all duration-300"
                                                            >
                                                                Learn More
                                                            </button>
                                                        </div>
                                                    </div>
                                                    
                                                    {/* Slide Indicator */}
                                                    <div className="absolute top-6 right-6 bg-black/50 backdrop-blur-md rounded-full px-3 py-1 text-white text-sm">
                                                        {index + 1} / {filteredEvents.length}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                    
                                    {/* Carousel Progress Indicator */}
                                    <div className="flex justify-center mt-6 space-x-2">
                                        {filteredEvents.map((_, index) => (
                                            <button 
                                                key={index}
                                                onClick={() => setCarouselIndex(index)}
                                                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                                                    carouselIndex === index
                                                        ? 'bg-green-500 w-10'
                                                        : 'bg-gray-400 bg-opacity-30 hover:bg-opacity-50'
                                                }`}
                                                aria-label={`Go to slide ${index + 1}`}
                                            />
                                        ))}
                                    </div>
                                </div>
                            )}
                            
                            {/* SPOTLIGHT VIEW MODE */}
                            {viewMode === "spotlight" && (
                                <div className="space-y-12">
                                    {/* Featured Event Card */}
                                    {spotlightEvent && (
                                        <div 
                                            ref={spotlightRef}
                                            className="relative overflow-hidden rounded-3xl shadow-2xl"
                                        >
                                            {/* Dynamic Background */}
                                            <div className="absolute inset-0 -z-10">
                                                {spotlightEvent.eventPoster ? (
                                                    <>
                                                        <img 
                                                            src={spotlightEvent.eventPoster} 
                                                            alt={spotlightEvent.title} 
                                                            className="w-full h-full object-cover" 
                                                        />
                                                        <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/70 to-black/90"></div>
                                                    </>
                                                ) : (
                                                    <div className={`w-full h-full bg-gradient-to-r ${getEventGradient(spotlightEvent)}`}>
                                                        <div className="absolute inset-0 backdrop-blur-sm bg-black/40"></div>
                                                    </div>
                                                )}
                                            </div>
                                            
                                            {/* Animated Spotlight Effect */}
                                            <div className="absolute inset-0 -z-10 overflow-hidden">
                                                <div className="absolute -inset-[100%] bg-gradient-to-r from-transparent via-white/10 to-transparent skew-x-[-20deg] animate-spotlight"></div>
                                            </div>
                                            
                                            {/* Content */}
                                            <div className="grid grid-cols-1 md:grid-cols-2 min-h-[500px]">
                                                {/* Left Column: Event Details */}
                                                <div className="p-12 flex flex-col justify-center z-10">
                                                    {/* Featured Badge */}
                                                    <div className="flex items-center space-x-2 mb-6">
                                                        <span className="px-4 py-1 bg-yellow-500/80 backdrop-blur-md rounded-full text-white text-sm font-bold flex items-center">
                                                            <Star className="h-4 w-4 mr-1" fill="currentColor" />
                                                            Featured Event
                                                        </span>
                                                    </div>
                                                    
                                                    {/* Event Title */}
                                                    <h3 className="text-4xl font-extrabold text-white mb-4 leading-tight">
                                                        {spotlightEvent.title}
                                                    </h3>
                                                    
                                                    {/* Event Description */}
                                                    <p className="text-gray-300 mb-6 text-lg">
                                                        {spotlightEvent.description}
                                                    </p>
                                                    
                                                    {/* Event Details */}
                                                    <div className="space-y-4 mb-8">
                                                        <div className="flex items-center">
                                                            <div className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center">
                                                                <Calendar className="h-5 w-5 text-green-400" />
                                                            </div>
                                                            <div className="ml-4">
                                                                <p className="text-gray-400 text-sm">Date & Time</p>
                                                                <p className="text-white font-medium">
                                                                    {formatEventDate(spotlightEvent.date)} at {formatEventTime(spotlightEvent.date)}
                                                                </p>
                                                            </div>
                                                        </div>
                                                        
                                                        <div className="flex items-center">
                                                            <div className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center">
                                                                <MapPin className="h-5 w-5 text-green-400" />
                                                            </div>
                                                            <div className="ml-4">
                                                                <p className="text-gray-400 text-sm">Location</p>
                                                                <p className="text-white font-medium">
                                                                    {spotlightEvent.location} 
                                                                    <span className={`ml-2 px-2 py-0.5 rounded-full text-xs uppercase ${
                                                                        spotlightEvent.locationType === 'ONLINE' 
                                                                            ? 'bg-blue-500/60 text-white' 
                                                                            : 'bg-amber-500/60 text-white'
                                                                    }`}>
                                                                        {spotlightEvent.locationType}
                                                                    </span>
                                                                </p>
                                                            </div>
                                                        </div>
                                                        
                                                        <div className="flex items-center">
                                                            <div className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center">
                                                                <UserCheck className="h-5 w-5 text-green-400" />
                                                            </div>
                                                            <div className="ml-4">
                                                                <p className="text-gray-400 text-sm">Speaker</p>
                                                                <p className="text-white font-medium">
                                                                    {spotlightEvent.guestName} - <span className="text-gray-300">{spotlightEvent.guestDesc}</span>
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    
                                                    {/* Action Button */}
                                                    <button
                                                        onClick={() => handleOpenBookSpot(spotlightEvent)}
                                                        className="w-full sm:w-auto py-4 px-8 bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white rounded-xl flex items-center justify-center transition-all duration-300 transform hover:scale-105 shadow-xl text-lg font-bold"
                                                    >
                                                        <span className="mr-2">Register for This Event</span>
                                                        <ArrowUpRight className="h-5 w-5" />
                                                    </button>
                                                </div>
                                                
                                                {/* Right Column: Visual */}
                                                <div className="hidden md:flex items-center justify-center relative p-12">
                                                    {/* Decorative Elements */}
                                                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-r from-green-500/20 to-blue-500/20 rounded-full blur-xl animate-pulse-slow"></div>
                                                    
                                                    {/* Circular Stats */}
                                                    <div className="relative w-80 h-80">
                                                        {/* Ring */}
                                                        <div className="absolute inset-0 rounded-full border-4 border-white/10 backdrop-blur-sm"></div>
                                                        
                                                        {/* Statistics */}
                                                        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
                                                            <div className="text-5xl font-extrabold text-white">
                                                                {getDaysUntilEvent(spotlightEvent.date)}
                                                            </div>
                                                            <div className="text-gray-300 uppercase tracking-wider text-sm font-medium">
                                                                Days Remaining
                                                            </div>
                                                        </div>
                                                        
                                                        <div className="absolute top-3/4 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
                                                            <div className="text-5xl font-extrabold bg-gradient-to-r from-green-400 to-blue-500 text-transparent bg-clip-text">
                                                                {spotlightEvent.registrations?.length || 0}
                                                            </div>
                                                            <div className="text-gray-300 uppercase tracking-wider text-sm font-medium">
                                                                Participants
                                                            </div>
                                                        </div>
                                                        
                                                        <div className="absolute left-0 top-1/2 -translate-y-1/2 text-center">
                                                            <div className="flex items-center justify-center w-16 h-16 rounded-full bg-white/10 backdrop-blur-sm mx-auto mb-2">
                                                                {spotlightEvent.locationType === 'ONLINE' ? (
                                                                    <Video className="h-8 w-8 text-blue-400" />
                                                                ) : (
                                                                    <Coffee className="h-8 w-8 text-amber-400" />
                                                                )}
                                                            </div>
                                                            <div className="text-gray-300 uppercase tracking-wider text-sm font-medium">
                                                                {spotlightEvent.locationType}
                                                            </div>
                                                        </div>
                                                        
                                                        <div className="absolute right-0 top-1/2 -translate-y-1/2 text-center">
                                                            <div className="flex items-center justify-center w-16 h-16 rounded-full bg-white/10 backdrop-blur-sm mx-auto mb-2">
                                                                <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center animate-pulse">
                                                                    <Sparkles className="h-4 w-4 text-white" />
                                                                </div>
                                                            </div>
                                                            <div className="text-gray-300 uppercase tracking-wider text-sm font-medium">
                                                                Featured
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                    
                                    {/* Other Events - Horizontal Scroll */}
                                    <div>
                                        <h3 className="text-2xl font-bold text-white mb-6">Other Events</h3>
                                        
                                        <div className="flex space-x-6 pb-6 overflow-x-auto snap-x scrollbar-hide">
                                            {filteredEvents
                                                .filter(event => event.id !== spotlightEvent?.id)
                                                .map((event) => (
                                                    <div 
                                                        key={event.id}
                                                        className="flex-shrink-0 w-80 snap-center"
                                                    >
                                                        <div className="bg-white/5 backdrop-blur-md rounded-xl overflow-hidden shadow-lg group hover:bg-white/10 transition-all duration-300">
                                                            {/* Event Image */}
                                                            <div className="h-40 overflow-hidden">
                                                                {event.eventPoster ? (
                                                                    <img 
                                                                        src={event.eventPoster} 
                                                                        alt={event.title} 
                                                                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                                                    />
                                                                ) : (
                                                                    <div className={`w-full h-full flex items-center justify-center bg-gradient-to-r ${getEventGradient(event)}`}>
                                                                        <Calendar className="h-10 w-10 text-white/80" />
                                                                    </div>
                                                                )}
                                                            </div>
                                                            
                                                            {/* Event Content */}
                                                            <div className="p-4">
                                                                <h4 className="text-lg font-bold text-white mb-2 line-clamp-1">{event.title}</h4>
                                                                <p className="text-gray-400 text-sm mb-3 line-clamp-2">{event.description}</p>
                                                                
                                                                <div className="flex justify-between items-center text-sm mb-3">
                                                                    <div className="text-gray-300">
                                                                        <Calendar className="h-3 w-3 inline mr-1" />
                                                                        {formatEventDate(event.date)}
                                                                    </div>
                                                                    <div className="text-gray-300">
                                                                        <Users className="h-3 w-3 inline mr-1" />
                                                                        {event.registrations?.length || 0}
                                                                    </div>
                                                                </div>
                                                                
                                                                <button
                                                                    onClick={() => handleOpenBookSpot(event)}
                                                                    className="w-full py-2 bg-white/10 rounded-lg text-white text-sm hover:bg-white/20 transition-all duration-300"
                                                                >
                                                                    Register
                                                                </button>
                                                            </div>
                                                            
                                                            {/* Event Focus Badge */}
                                                            <div className="absolute top-2 right-2 px-2 py-1 bg-black/40 backdrop-blur-sm rounded-lg text-xs text-white">
                                                                {event.eventFocus}
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                    
                    {/* View All Events Link */}
                    {filteredEvents.length > 6 && (
                        <div className="mt-12 text-center">
                            <button
                                onClick={() => navigate("/events")}
                                className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white rounded-full font-medium transition-all duration-300 transform hover:translate-y-[-2px] shadow-lg"
                            >
                                View All Events
                                <ChevronRight className="ml-2 h-5 w-5" />
                            </button>
                        </div>
                    )}
                </div>
            </section>

            {/* Book Spot Modal */}
            <BookSpot
                visible={showBookSpot}
                event={selectedEvent}
                onCancel={() => setShowBookSpot(false)}
                onSuccess={() => {
                    setShowBookSpot(false);
                    fetchEvents();
                }}
            />

            {/* Authentication Links Section */}
            <section className="relative z-10 py-10 bg-green-800 bg-opacity-80 text-white">
                <div className="max-w-6xl mx-auto px-6 text-center">
                    <h2 className="text-3xl font-bold mb-6">Join Our Community</h2>
                    
                    <div className="grid md:grid-cols-3 gap-8">
                        <div className="p-6 rounded-lg bg-green-700 bg-opacity-50 transform transition hover:scale-105">
                            <Mail className="h-12 w-12 mx-auto mb-4" />
                            <h3 className="text-xl font-semibold mb-2">Create Account</h3>
                            <p className="mb-4">Register to join our community and get access to exclusive events and content.</p>
                            <button 
                                onClick={() => navigate("/auth")}
                                className="px-4 py-2 bg-white text-green-700 rounded-full font-medium hover:bg-gray-100 transition"
                            >
                                Sign Up
                            </button>
                        </div>
                        
                        <div className="p-6 rounded-lg bg-green-700 bg-opacity-50 transform transition hover:scale-105">
                            <UserCheck className="h-12 w-12 mx-auto mb-4" />
                            <h3 className="text-xl font-semibold mb-2">Verify Email</h3>
                            <p className="mb-4">Already registered but haven't verified your email? Check your inbox for the verification link.</p>
                            <button 
                                onClick={() => navigate("/auth")}
                                className="px-4 py-2 bg-white text-green-700 rounded-full font-medium hover:bg-gray-100 transition"
                            >
                                Sign In
                            </button>
                        </div>
                        
                        <div className="p-6 rounded-lg bg-green-700 bg-opacity-50 transform transition hover:scale-105">
                            <Key className="h-12 w-12 mx-auto mb-4" />
                            <h3 className="text-xl font-semibold mb-2">Reset Password</h3>
                            <p className="mb-4">Forgot your password? No worries, you can easily reset it through our secure system.</p>
                            <button 
                                onClick={() => navigate("/forgot-password")}
                                className="px-4 py-2 bg-white text-green-700 rounded-full font-medium hover:bg-gray-100 transition"
                            >
                                Reset Password
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="relative z-10 text-center py-6 text-gray-200 bg-black bg-opacity-50">
                <p>
                    Contact us:{" "}
                    <a href="mailto:info@muongforum.com" className="underline hover:text-green-300">
                        info@muongforum.com
                    </a>{" "}
                    | Phone:{" "}
                    <a href="tel:+254743000000" className="underline hover:text-green-300">
                        +254 743 000 000
                    </a>
                </p>
                <p>&copy; 2025 Muong Forum. All Rights Reserved.</p>
            </footer>
        </div>
    );
};

export default LandingPage;
// NavBar.jsx
import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Menu, X, Home, Calendar, Users, Mail, LogIn, ArrowUpRight } from "lucide-react";

const NavBar = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [isOpen, setIsOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    
    // Check if user is authenticated
    useEffect(() => {
        const token = localStorage.getItem('ACCESS_TOKEN');
        const user = JSON.parse(localStorage.getItem('USER') || '{}');
        
        if (token && (user.id || user.role)) {
            setIsAuthenticated(true);
        }
    }, [location]);
    
    // Handle scroll effect
    useEffect(() => {
        const handleScroll = () => {
            if (window.scrollY > 30) {
                setScrolled(true);
            } else {
                setScrolled(false);
            }
        };
        
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);
    
    // Navigation items
    const navItems = [
        { name: 'Home', path: '/', icon: <Home className="h-4 w-4" /> },
        { name: 'Events', path: '/events', icon: <Calendar className="h-4 w-4" /> },
        { name: 'About', path: '/about', icon: <Users className="h-4 w-4" /> },
        { name: 'Contact', path: '/contact', icon: <Mail className="h-4 w-4" /> },
    ];
    
    // Check if path is active
    const isActivePath = (path) => {
        if (path === '/') {
            return location.pathname === path;
        }
        return location.pathname.startsWith(path);
    };
    
    // Handle navigation for auth
    const handleAuthNav = () => {
        const user = JSON.parse(localStorage.getItem('USER') || '{}');
        
        if (isAuthenticated) {
            if (user.role === 'ADMIN') {
                navigate('/dashboard');
            } else {
                navigate('/users/dashboard');
            }
        } else {
            navigate('/auth');
        }
        
        setIsOpen(false);
    };

    return (
        <nav
            className={`
                fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
                    scrolled 
                        ? 'bg-black/70 backdrop-blur-md py-2' 
                        : 'bg-transparent py-5'
                }`}
        >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
                {/* Logo */}
                <Link 
                    to="/"
                    className="flex items-center transition-transform hover:scale-105"
                >
                    <div className="relative">
                        <div className="h-10 w-10 rounded-full bg-gradient-to-r from-green-400 to-blue-500 flex items-center justify-center shadow-lg">
                            <span className="text-white font-bold text-xl">M</span>
                            <div className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-white"></div>
                        </div>
                    </div>
                    <div className="ml-2">
                        <span className={`font-bold text-lg ${scrolled ? 'text-white' : 'text-white'}`}>
                            Muong Forum
                        </span>
                    </div>
                </Link>

                {/* Desktop Navigation */}
                <div className="hidden md:flex items-center space-x-1">
                    <div className={`rounded-full transition-all duration-300 ${
                        scrolled
                            ? 'bg-white/10 backdrop-blur-md border border-white/20 p-1'
                            : 'p-1'
                    }`}>
                        {navItems.map((item) => (
                            <Link
                                key={item.name}
                                to={item.path}
                                className={`px-4 py-2 rounded-full font-medium transition-all duration-300 flex items-center mx-1 ${
                                    isActivePath(item.path)
                                        ? 'bg-gradient-to-r from-green-400 to-blue-500 text-white'
                                        : 'text-white hover:bg-white/10'
                                }`}
                            >
                                <span className="mr-1.5">{item.icon}</span>
                                {item.name}
                            </Link>
                        ))}
                    </div>
                    
                    <button
                        onClick={handleAuthNav}
                        className={`ml-4 px-4 py-2 font-medium rounded-full transition-all duration-300 flex items-center ${
                            isAuthenticated
                                ? 'bg-white/10 backdrop-blur-sm border border-white/20 text-white hover:bg-white/20'
                                : 'bg-gradient-to-r from-green-400 to-blue-500 text-white hover:from-green-500 hover:to-blue-600 shadow-md'
                        }`}
                    >
                        {isAuthenticated ? (
                            <>Dashboard</>
                        ) : (
                            <>
                                <LogIn className="h-4 w-4 mr-1.5" />
                                Sign In
                            </>
                        )}
                        <ArrowUpRight className="h-3.5 w-3.5 ml-1 opacity-70" />
                    </button>
                </div>

                {/* Mobile toggle */}
                <div className="md:hidden">
                    <button 
                        onClick={() => setIsOpen(!isOpen)} 
                        className={`p-2 rounded-full ${
                            isOpen 
                                ? 'bg-white/10 text-white' 
                                : 'text-white hover:bg-white/10'
                        }`}
                        aria-label="Toggle menu"
                    >
                        {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                    </button>
                </div>
            </div>

            {/* Mobile Menu */}
            <div 
                className={`fixed inset-0 z-40 bg-black/90 backdrop-blur-lg transition-all duration-300 md:hidden ${
                    isOpen 
                        ? 'opacity-100 pointer-events-auto translate-y-0' 
                        : 'opacity-0 pointer-events-none -translate-y-8'
                }`}
            >
                <div className="flex flex-col h-full pt-24 pb-8 px-8">
                    <div className="flex flex-col space-y-2">
                        {navItems.map((item) => (
                            <Link
                                key={item.name}
                                to={item.path}
                                onClick={() => setIsOpen(false)}
                                className={`px-5 py-4 rounded-xl font-medium text-lg transition-all duration-300 ${
                                    isActivePath(item.path)
                                        ? 'bg-gradient-to-r from-green-500 to-blue-600 text-white'
                                        : 'text-white bg-white/5 hover:bg-white/10'
                                }`}
                            >
                                <div className="flex items-center">
                                    <span className="p-2 rounded-lg bg-white/10 mr-4">{item.icon}</span>
                                    {item.name}
                                </div>
                            </Link>
                        ))}
                    </div>
                    
                    <div className="mt-auto pt-8 border-t border-white/10">
                        <button
                            onClick={handleAuthNav}
                            className={`w-full py-4 font-medium rounded-xl transition-all duration-300 flex items-center justify-center text-lg ${
                                isAuthenticated
                                    ? 'bg-white/10 text-white'
                                    : 'bg-gradient-to-r from-green-400 to-blue-500 text-white'
                            }`}
                        >
                            {isAuthenticated ? (
                                <>Go to Dashboard</>
                            ) : (
                                <>
                                    <LogIn className="h-5 w-5 mr-2" />
                                    Sign In
                                </>
                            )}
                        </button>
                        
                        <div className="mt-8 text-center text-white/40 text-sm">
                            <p>Muong Forum © 2025</p>
                        </div>
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default NavBar;
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
// ...existing code...
const NavBar = () => {
    const navigate = useNavigate();
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    return (
        <>
            {/* Sticky logo container */}
            <div className="w-full sticky top-0 flex justify-center items-center bg-gray-800 text-white z-50 py-4 shadow-md">
                <img src="/logo.png" alt="Logo" className="w-16 h-16" />
            </div>

            {/* Navigation header */}
            <nav className="w-full bg-gray-800 text-white relative">
                <div className="flex justify-center items-center px-4 py-2">
                    {/* Mobile menu toggle button aligned left */}
                    <button
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                        className="block md:hidden text-white focus:outline-none"
                    >
                        {isMenuOpen ? (
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                            </svg>
                        )}
                    </button>

                    {/* Inline navigation for medium+ screens */}
                    <div className="hidden md:flex space-x-4">
                        <Link to="/" className="text-lg hover:text-green-300 transition">
                            Home
                        </Link>
                        <Link to="/events" className="text-lg hover:text-green-300 transition">
                            Events
                        </Link>
                        <Link to="/about" className="text-lg hover:text-green-300 transition">
                            About
                        </Link>
                        <Link to="/contact" className="text-lg hover:text-green-300 transition">
                            Contact
                        </Link>
                        <button
                            onClick={() => navigate('/auth')}
                            className="text-lg hover:text-green-300 transition"
                        >
                            Login
                        </button>
                    </div>
                </div>

                {/* Mobile menu links visible on small screens */}
                {isMenuOpen && (
                    <div className="flex flex-col items-start space-y-2 px-4 pb-4 md:hidden">
                        <Link to="/" className="text-lg hover:text-green-300 transition">
                            Home
                        </Link>
                        <Link to="/events" className="text-lg hover:text-green-300 transition">
                            Events
                        </Link>
                        <Link to="/about" className="text-lg hover:text-green-300 transition">
                            About
                        </Link>
                        <Link to="/contact" className="text-lg hover:text-green-300 transition">
                            Contact
                        </Link>
                        <button
                            onClick={() => navigate('/auth')}
                            className="text-lg hover:text-green-300 transition text-left"
                        >
                            Login
                        </button>
                    </div>
                )}
            </nav>
        </>
        // ...existing JSX...
    );
};
// ...existing code...
export default NavBar;

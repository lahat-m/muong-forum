import React from "react";
import { Link, useNavigate } from "react-router-dom";

const NavBar: React.FC = () => {
    const navigate = useNavigate();
    return (
        <nav className="relative z-10 flex justify-between items-center px-6 py-4 bg-transparent">
            <div className="flex items-center space-x-4">
                <img src="/logo.png" alt="Logo" className="w-16 h-16" />
                <Link to="/" className="text-white text-lg hover:text-green-300 transition">
                    Home
                </Link>
                <Link to="/events" className="text-white text-lg hover:text-green-300 transition">
                    Events
                </Link>
                <Link to="/about" className="text-white text-lg hover:text-green-300 transition">
                    About
                </Link>
                <Link to="/contact" className="text-white text-lg hover:text-green-300 transition">
                    Contact
                </Link>
            </div>
            <div className="space-x-4">
                <button onClick={() => navigate('/auth')} className="text-white text-lg hover:text-green-300 transition">
                    Login
                </button>
            </div>
        </nav>
    );
};

export default NavBar;

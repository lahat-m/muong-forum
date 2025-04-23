// NavBar.jsx
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Menu, X } from "lucide-react";

const NavBar = () => {
    const navigate = useNavigate();
    const [isOpen, setIsOpen] = useState(false);

    return (
        <nav
            className="
        fixed top-0 left-0 right-0  
        h-20                /* fixed height */
        bg-white/70         /* semi‑opaque */
        backdrop-blur-md    
        border-b border-gray-200
        shadow-sm
        z-50
      "
        >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center justify-between">
                {/* Logo */}
                <Link to="/">
                    <img src="/logo.png" alt="Logo" className="h-16 w-16" />
                </Link>

                {/* Desktop */}
                <div className="hidden md:flex space-x-10">
                    {["Home", "Events", "About", "Contact"].map((label) => (
                        <Link
                            key={label}
                            to={label === "Home" ? "/" : `/${label.toLowerCase()}`}
                            className="text-green-500 font-bold hover:text-blue-300 transition"
                        >
                            {label}
                        </Link>
                    ))}
                    <button
                        onClick={() => navigate("/auth")}
                        className="text-green-500 font-bold hover:text-blue-300 transition"
                    >
                        Login
                    </button>
                </div>

                {/* Mobile toggle */}
                <div className="md:hidden">
                    <button onClick={() => setIsOpen(!isOpen)} className="text-green-500">
                        {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                    </button>
                </div>
            </div>

            {/* Mobile Menu */}
            {isOpen && (
                <div className="md:hidden bg-black/80 backdrop-blur-md px-6 pb-4 pt-2 text-center">
                    {["Home", "Events", "About", "Contact"].map((label) => (
                        <Link
                            key={label}
                            to={label === "Home" ? "/" : `/${label.toLowerCase()}`}
                            onClick={() => setIsOpen(false)}
                            className="block text-green-500 font-bold py-2 hover:text-blue-300"
                        >
                            {label}
                        </Link>
                    ))}
                    <button
                        onClick={() => {
                            navigate("/auth");
                            setIsOpen(false);
                        }}
                        className="w-full text-green-500 font-bold py-2 hover:text-blue-300"
                    >
                        Login
                    </button>
                </div>
            )}
        </nav>
    );
};

export default NavBar;
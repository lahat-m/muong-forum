import React from "react";
import { useNavigate } from "react-router-dom";

const LandingPage = () => {
    const navigate = useNavigate()
    return (
        <div className="min-h-screen bg-gradient-to-br from-green-600 to-red-700 text-white">
        {/* Navbar */}
        <nav className="flex justify-between items-center p-6 max-w-6xl mx-auto">
            <div className="flex items-center ">
                <h1 className="text-2xl font-bold">Landing Page</h1>
            </div>
            <div className="space-x-6">

            <button className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-400 transition" onClick={() => navigate('/auth')}>Sign Up</button>
            </div>
        </nav>

        {/* Hero Section */}
        <section className="flex flex-col items-center text-center py-24 px-6">
            <h2 className="text-4xl font-bold leading-tight max-w-3xl">
            Lorem, ipsum dolor sit amet consectetur adipisicing elit. Accusamus omnis molestias deserunt, 
            </h2>
            <p className="mt-4 text-lg max-w-xl">Adipisicing elit. Accusamus omnis molestias deserunt,</p>
            <button className="mt-6 bg-green-500 text-white px-6 py-3 rounded-md text-lg font-semibold hover:bg-green-400 transition" onClick={() => navigate('/auth')}>
            Start Now
            </button>
        </section>

        {/* Features Section */}
        <section className="max-w-5xl mx-auto py-16 px-6 grid md:grid-cols-3 gap-8 text-black">
            <div className="bg-white p-6 rounded-tl-4xl rounded-br-4xl shadow-lg text-center">
            <h3 className="text-xl font-bold">Learn & Improve</h3>
            <p className="mt-2">Lorem ipsum dolor, sit amet consectetur adipisicing elit. Deleniti fugiat </p>
            </div>
            <div className="bg-white p-6 rounded-tl-4xl rounded-br-4xl shadow-lg text-center">
            <h3 className="text-xl font-bold">Compete & Win</h3>
            <p className="mt-2">Lorem ipsum dolor, sit amet consectetur adipisicing elit. Deleniti fugiat </p>
            </div>
            <div className="bg-white p-6 rounded-tl-4xl rounded-br-4xl shadow-lg text-center">
            <h3 className="text-xl font-bold">🎯 Create & Share</h3>
            <p className="mt-2">Lorem ipsum dolor, sit amet consectetur adipisicing elit. Deleniti fugiat </p>
            </div>
        </section>

        {/* Footer */}
        <footer className="text-center py-6">
            <p>&copy; 2025 John Doe. All rights reserved.</p>
        </footer>
        </div>
    );
};

export default LandingPage;

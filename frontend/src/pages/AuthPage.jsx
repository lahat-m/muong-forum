import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Loader from "../components/Loader";
import api from "../api";
import Notify from "../components/Notify";

const AuthPage = () => {
    const [isSignUp, setIsSignUp] = useState(false);
    const navigate = useNavigate();
    const [loader, setLoader] = useState(false);
    const [loginEmail, setLoginEmail] = useState("");
    const [loginPassword, setLoginPassword] = useState("");
    const [signUpName, setSignUpName] = useState("");
    const [signUpEmail, setSignUpEmail] = useState("");
    const [signUpPassword, setSignUpPassword] = useState("");
    const [signUpUsername, setSignUpUsername] = useState("");

    function handleSignUp(e) {
        e.preventDefault();
        setLoader(true);
        const [firstName, lastName] = signUpName.split(" ");
        api.post("/user/create-user", { firstName, lastName, email: signUpEmail, password: signUpPassword, username: signUpUsername })
            .then((res) => {
                Notify.success("Account Created Successfully");
                Notify.info("Login your account to continue");
                setIsSignUp(false);
            })
            .catch((error) => {
                Notify.error(error.response.data.message || "An error occurred");
            })
            .finally(() => {
                setLoader(false);
            });
    }

    function handleSignIn(e) {
        e.preventDefault();
        setLoader(true);
        api.post("/auth/login", { email: loginEmail, password: loginPassword })
            .then((res) => {
                Notify.success("Login Successful");
                localStorage.setItem("ACCESS_TOKEN", res.data.accessToken);
                localStorage.setItem("REFRESH_TOKEN", res.data.refreshToken);
                localStorage.setItem("USER", JSON.stringify(res.data.user));
                setTimeout(() => {
                    navigate("/dashboard");
                }, 1000);
            })
            .catch(() => {
                Notify.error("Invalid Credentials");
            })
            .finally(() => {
                setLoader(false);
            });
    }

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
            {loader && <Loader />}
            <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-md">
                <div className="flex justify-center mb-6">
                    <h2 className="text-3xl font-bold text-gray-700">{isSignUp ? "Sign Up" : "Sign In"}</h2>
                </div>
                <div className="flex justify-center space-x-4 mb-6">
                    <button
                        onClick={() => setIsSignUp(false)}
                        className={`px-4 py-2 w-1/2 rounded-lg ${!isSignUp ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-700"}`}
                    >
                        Sign In
                    </button>
                    <button
                        onClick={() => setIsSignUp(true)}
                        className={`px-4 py-2 w-1/2 rounded-lg ${isSignUp ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-700"}`}
                    >
                        Sign Up
                    </button>
                </div>
                {isSignUp ? (
                    <form onSubmit={handleSignUp}>
                        <div className="mb-4">
                            <label className="block mb-1 font-medium text-gray-600">Full Name</label>
                            <input
                                type="text"
                                placeholder="Enter your name"
                                className="w-full px-4 py-2 border rounded-lg text-sm"
                                required
                                onChange={(e) => setSignUpName(e.target.value)}
                            />
                        </div>
                        <div className="mb-4">
                            <label className="block mb-1 font-medium text-gray-600">Email</label>
                            <input
                                type="email"
                                placeholder="Enter your email"
                                className="w-full px-4 py-2 border rounded-lg text-sm"
                                required
                                onChange={(e) => setSignUpEmail(e.target.value)}
                            />
                        </div>
                        <div className="mb-4">
                            <label className="block mb-1 font-medium text-gray-600">Username</label>
                            <input
                                type="text"
                                placeholder="Enter your Username"
                                className="w-full px-4 py-2 border rounded-lg text-sm"
                                required
                                onChange={(e) => setSignUpUsername(e.target.value)}
                            />
                        </div>
                        <div className="mb-4">
                            <label className="block mb-1 font-medium text-gray-600">Password</label>
                            <input
                                type="password"
                                placeholder="Create a password"
                                className="w-full px-4 py-2 border rounded-lg text-sm"
                                required
                                onChange={(e) => setSignUpPassword(e.target.value)}
                            />
                        </div>
                        <button className="w-full py-2 mt-2 text-white bg-blue-500 rounded-lg hover:bg-blue-600">
                            Create Account
                        </button>
                        <p className="mt-4 text-sm text-center text-gray-500">
                            By signing up, you agree to our{" "}
                            <a href="#" className="text-blue-500">
                                Terms and Privacy Policy
                            </a>
                        </p>
                    </form>
                ) : (
                    <form onSubmit={handleSignIn}>
                        <div className="mb-4">
                            <label className="block mb-1 font-medium text-gray-600">Email</label>
                            <input
                                type="email"
                                placeholder="Enter your email"
                                className="w-full px-4 py-2 border rounded-lg text-sm"
                                onChange={(e) => setLoginEmail(e.target.value)}
                                required
                            />
                        </div>
                        <div className="mb-4">
                            <label className="block mb-1 font-medium text-gray-600">Password</label>
                            <input
                                type="password"
                                placeholder="Enter your password"
                                className="w-full px-4 py-2 border rounded-lg text-sm"
                                onChange={(e) => setLoginPassword(e.target.value)}
                                required
                            />
                        </div>
                        <div className="flex items-center justify-between mb-4">
                            <label className="flex items-center text-sm text-gray-600">
                                <input type="checkbox" className="mr-2" />
                                Remember me
                            </label>
                            <a href="#" className="text-sm text-blue-500 hover:underline">
                                Forgot password?
                            </a>
                        </div>
                        <button className="w-full py-2 mt-2 text-white bg-blue-500 rounded-lg hover:bg-blue-600">
                            Sign In
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
};

export default AuthPage;

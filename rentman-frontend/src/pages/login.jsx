import axios from "axios";
import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "react-hot-toast";
import { Loader2 } from "lucide-react";

export default function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [isFocused, setIsFocused] = useState({ email: false, password: false });

    const navigate = useNavigate();

    async function handleSubmit(e) {
        e.preventDefault();
        setIsLoading(true);

        try {
            const response = await axios.post(
                import.meta.env.VITE_API_BASE_URL + "/api/users/login",
                { email, password }
            );

            toast.success("Login successful");
            localStorage.setItem("token", response.data.token);
            localStorage.setItem("userFirstName", response.data.firstName);
            localStorage.setItem("userRole", response.data.role);

            setIsLoading(false);
            navigate("/dashboard");
        } catch (error) {
            if (error.response) {
                if (error.response.status === 404) toast.error("Email not found");
                else if (error.response.status === 401) toast.error("Invalid password");
                else toast.error("Login failed");
            } else if (error.request) {
                toast.error("No response from server");
            } else {
                toast.error(`Error: ${error.message}`);
            }
            setIsLoading(false);
        }
    }

    return (
        <div className="flex min-h-screen w-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 justify-center items-center p-4">
            <div className="flex flex-col md:flex-row w-full max-w-4xl bg-white rounded-2xl shadow-2xl overflow-hidden">

                {/* Left image */}
                <div className="hidden md:flex flex-1">
                    <img
                        src="/suitmain.jpg"
                        alt="Suit Rental"
                        className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-500"
                    />
                </div>

                {/* Right side - login form */}
                <div className="flex-1 flex items-center justify-center p-8 md:p-12">
                    <div className="w-full max-w-md">
                        <h2 className="text-3xl font-extrabold text-gray-800 mb-6 text-center">
                            Welcome Back 👋
                        </h2>
                        <p className="text-gray-600 text-center mb-6">
                            Sign in to your Suit Rental Management System
                        </p>

                        <form onSubmit={handleSubmit} className="space-y-5">
                            {/* Email */}
                            <div
                                className={`space-y-1 transition-all duration-200 ${isFocused.email ? "scale-[1.02]" : ""
                                    }`}
                            >
                                <label
                                    htmlFor="email"
                                    className="block text-sm font-medium text-gray-700"
                                >
                                    Email
                                </label>
                                <input
                                    type="email"
                                    id="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    onFocus={() => setIsFocused({ ...isFocused, email: true })}
                                    onBlur={() => setIsFocused({ ...isFocused, email: false })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all"
                                    required
                                />
                            </div>

                            {/* Password */}
                            <div
                                className={`space-y-1 transition-all duration-200 ${isFocused.password ? "scale-[1.02]" : ""
                                    }`}
                            >
                                <label
                                    htmlFor="password"
                                    className="block text-sm font-medium text-gray-700"
                                >
                                    Password
                                </label>
                                <input
                                    type="password"
                                    id="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    onFocus={() => setIsFocused({ ...isFocused, password: true })}
                                    onBlur={() => setIsFocused({ ...isFocused, password: false })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all"
                                    required
                                />
                            </div>

                            {/* Submit */}
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full flex justify-center items-center gap-2 bg-purple-600 hover:bg-purple-700 px-5 py-2.5 text-white font-medium rounded-lg shadow-md transition duration-200"
                            >
                                {isLoading && <Loader2 className="animate-spin" />}
                                Log in
                            </button>
                        </form>

                        <p className="text-sm text-gray-600 mt-6 text-center">
                            Don’t have an account?{" "}
                            <Link to="#" className="text-purple-600 hover:underline">
                                Contact System Admin
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

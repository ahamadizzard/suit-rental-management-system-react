import axios from 'axios';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { Link } from 'react-router-dom';
import { Loader2 } from 'lucide-react';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isFocused, setIsFocused] = useState({
        email: false,
        password: false
    });

    const navigate = useNavigate();

    async function handleSubmit(e) {
        e.preventDefault(); // Prevent default form submission behavior
        setIsLoading(true);

        try {
            const response = await axios.post(import.meta.env.VITE_API_BASE_URL + "/api/users/login", {
                email: email,
                password: password
            })
            // console.log("Response:", response);
            toast.success("Login successful")
            localStorage.setItem("token", response.data.token);
            localStorage.setItem("userFirstName", response.data.firstName);
            localStorage.setItem("userRole", response.data.role);
            setIsLoading(false);
            navigate("/dashboard")
        } catch (error) {
            // console.error("Full error object:", error);
            // Improved error handling
            if (error.response) {
                // The request was made and the server responded with a status code
                // that falls out of the range of 2xx
                // const errorMessage = error.response.data.message || 'Login failed';
                if (error.response.status === 404) {
                    toast.error('Email not found');
                } else if (error.response.status === 401) {
                    toast.error('Invalid password');
                } else {
                    toast.error(errorMessage);
                }
            } else if (error.request) {
                // The request was made but no response was received
                toast.error('No response from server');
            } else {
                // Something happened in setting up the request that triggered an Error
                toast.error(`Error: ${error.message}`);
            }
            setIsLoading(false);
        }
    }

    return (
        <div
            className="min-h-screen flex overflow-hidden opacity-90"
            style={{
                backgroundImage: 'url(/mainbg.jpg)',
                backgroundSize: 'cover',
                width: '100%',
                height: '100vh',
            }}
        >
            {/* Left Section - Logo */}
            <div className="hidden md:flex flex-1 items-center justify-center p-8 animate-fade-in">
                <div className="text-center text-white">
                    <div className="text-4xl font-bold mb-8">
                        <img
                            src="/logo.png"
                            alt="Logo"
                            className="mx-auto"
                            width={900}
                            height={600}
                        />
                    </div>
                    <p className="text-xl opacity-90">Please login to access the Web Application</p>
                </div>
            </div>

            {/* Right Section - Form */}
            <div className="flex-1 flex items-center justify-center p-4 relative">
                <form
                    onSubmit={handleSubmit}
                    className="w-full max-w-md bg-white/20 backdrop-blur-lg rounded-xl shadow-xl overflow-hidden p-8 border border-white/30 space-y-6 z-10 animate-slide-in hover:scale-[1.01] transition-all duration-200"
                >
                    <h2 className="text-3xl font-bold text-gray-800 text-center">Login</h2>

                    {/* Email Input */}
                    <div className={`space-y-1 transition-all duration-200 ${isFocused.email ? 'scale-[1.02]' : ''}`}>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                            Email
                        </label>
                        <input
                            type="email"
                            id="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            onFocus={() => setIsFocused({ ...isFocused, email: true })}
                            onBlur={() => setIsFocused({ ...isFocused, email: false })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                            required
                        />
                    </div>

                    {/* Password Input */}
                    <div className={`space-y-1 transition-all duration-200 ${isFocused.password ? 'scale-[1.02]' : ''}`}>
                        <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                            Password
                        </label>
                        <input
                            type="password"
                            id="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            onFocus={() => setIsFocused({ ...isFocused, password: true })}
                            onBlur={() => setIsFocused({ ...isFocused, password: false })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                            required
                        />
                    </div>

                    {/* Login Button */}

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full flex justify-center items-center bg-blue-600 hover:bg-blue-700 px-5 py-2.5 text-white font-medium rounded-md transition duration-150"
                    >
                        {isLoading && < Loader2 className='animate-spin' />}
                        Log in
                    </button>
                </form>
            </div>
        </div>
    )
}
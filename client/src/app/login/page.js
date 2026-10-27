'use client';

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import toast from 'react-hot-toast';

export default function LoginPage() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { login } = useAuth();

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!username || !password) {
            toast.error('Please fill in all fields');
            return;
        }

        setIsLoading(true);
        try {
            await login(username, password);
            toast.success('Welcome back!');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Login failed');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-surface-100 flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                {/* Logo */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-600 rounded-2xl mb-4">
                        <span className="text-2xl">📦</span>
                    </div>
                    <h1 className="text-2xl font-bold text-surface-900">MHS Order Manager</h1>
                    <p className="text-surface-500 mt-1">Sign in to manage your orders</p>
                </div>

                {/* Login Card */}
                <div className="card">
                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <label className="label">Username</label>
                            <input
                                type="text"
                                className="input"
                                placeholder="Enter your username"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                autoComplete="username"
                            />
                        </div>

                        <div>
                            <label className="label">Password</label>
                            <input
                                type="password"
                                className="input"
                                placeholder="Enter your password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                autoComplete="current-password"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="btn-primary w-full"
                        >
                            {isLoading ? (
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                'Sign In'
                            )}
                        </button>
                    </form>
                </div>

                <p className="text-center text-xs text-surface-400 mt-6">
                    MHS Order Manager v1.0.0
                </p>
            </div>
        </div>
    );
}
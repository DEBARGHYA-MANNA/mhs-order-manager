'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/utils/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        checkAuth();
    }, []);

    const checkAuth = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                setLoading(false);
                return;
            }

            const res = await api.get('/auth/me');
            setUser(res.data.data);
        } catch (error) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            setUser(null);
        } finally {
            setLoading(false);
        }
    };

    const login = async (username, password) => {
        const res = await api.post('/auth/login', { username, password });
        const { token, ...userData } = res.data.data;
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(userData));
        setUser(userData);
        router.push('/');
        return res.data;
    };

    const logout = async () => {
        try {
            await api.post('/auth/logout');
        } catch (error) {
            // ignore
        }
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
        router.push('/login');
    };

    const register = async (data) => {
        const res = await api.post('/auth/register', data);
        return res.data;
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                loading,
                login,
                logout,
                register,
                isAdmin: user?.role === 'admin',
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
};
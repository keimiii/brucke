import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { User } from '../hooks/useAuth';
import { AuthService, LoginRequest, RegisterRequest } from '../services/authService';

interface AuthContextType {
    user: User | null;
    login: (credentials: LoginRequest) => Promise<void>;
    register: (userData: RegisterRequest) => Promise<void>;
    logout: () => void;
    loading: boolean;
    validateToken: () => Promise<boolean>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
    children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    const validateToken = async (): Promise<boolean> => {
        const token = localStorage.getItem('token');
        if (!token) {
            return false;
        }

        try {
            const response = await AuthService.validateToken();
            setUser(response.user);
            return true;
        } catch (error) {
            console.error('Token validation error:', error);
            // If it's a network error (server not running), keep the user logged in
            // but mark the token as potentially stale
            if (error instanceof TypeError && error.message.includes('fetch')) {
                console.warn('Backend server may not be running, keeping user logged in');
                return true;
            }
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            setUser(null);
            return false;
        }
    };

    useEffect(() => {
        const initializeAuth = async () => {
            try {
                await validateToken();
            } catch (error) {
                console.error('Auth initialization error:', error);
            } finally {
                setLoading(false);
            }
        };

        initializeAuth();
    }, []);

    const login = async (credentials: LoginRequest) => {
        try {
            const response = await AuthService.login(credentials);
            setUser(response.user);
            localStorage.setItem('user', JSON.stringify(response.user));
            localStorage.setItem('token', response.token);
        } catch (error) {
            throw error;
        }
    };

    const register = async (userData: RegisterRequest) => {
        try {
            const response = await AuthService.register(userData);
            setUser(response.user);
            localStorage.setItem('user', JSON.stringify(response.user));
            localStorage.setItem('token', response.token);
        } catch (error) {
            throw error;
        }
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('user');
        localStorage.removeItem('token');
    };

    return (
        <AuthContext.Provider value={{ user, login, register, logout, loading, validateToken }}>
            {children}
        </AuthContext.Provider>
    );
};
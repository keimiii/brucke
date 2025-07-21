import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { User } from '../hooks/useAuth';
import {v4 as uuidv4} from 'uuid';

interface AuthContextType {
    user: User | null;
    // TODO Login verification logic
    // login: (email: string, password: string) => Promise<void>;
    login: (username: string) => Promise<void>;
    logout: () => void;
    loading: boolean;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
    children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Check for existing session
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
        setLoading(false);
    }, []);

    //         // TODO Replace with login API call
    // const login = async (email: string, password: string) => {
    //     try {
    //         const response = await fetch('/api/auth/login', {
    //             method: 'POST',
    //             headers: { 'Content-Type': 'application/json' },
    //             body: JSON.stringify({ email, password })
    //         });
    //
    //         if (!response.ok) {
    //             throw new Error('Login failed');
    //         }
    //
    //         const userData = await response.json();
    //         setUser(userData.user);
    //         localStorage.setItem('user', JSON.stringify(userData.user));
    //     } catch (error) {
    //         throw error;
    //     }
    // };

    const login = async (username: string) => {
        try {
            let uuid = uuidv4();
            const usr: User = {
                id: uuid,
                name: username,
                email: ''
            } ;
            setUser(usr);
            localStorage.setItem('user', JSON.stringify(usr));
        } catch (error) {
            throw error;
        }
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('user');
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
};
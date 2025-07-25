import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { User } from '../hooks/useAuth';
import {v4 as uuidv4} from 'uuid';

interface AuthContextType {
    user: User | null;
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

    const login = async (username: string) => {
        try {
            let uuid = uuidv4();
            const usr: User = {
                userId: uuid,
                userName: username
            };
            const response = await fetch('http://localhost:3001/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({"user": usr})
            });

            if (!response.ok) {
                throw new Error('Login failed');
            }

            const res = await response.json();
            setUser(usr);
            localStorage.setItem('user', JSON.stringify(usr));
            localStorage.setItem('token', res.token);
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
        <AuthContext.Provider value={{ user, login, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
};
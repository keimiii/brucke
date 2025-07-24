import { useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';

export interface User {
    id: string;
    name: string;
}

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
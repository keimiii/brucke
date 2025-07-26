import React, { createContext, useEffect, useState, ReactNode } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from '../hooks/useAuth';

interface SocketContextType {
    socket: Socket | null;
    connected: boolean;
}

export const SocketContext = createContext<SocketContextType | undefined>(undefined);

interface SocketProviderProps {
    children: ReactNode;
}

export const SocketProvider: React.FC<SocketProviderProps> = ({ children }) => {
    const [socket, setSocket] = useState<Socket | null>(null);
    const [connected, setConnected] = useState(false);
    const { user } = useAuth();

    useEffect(() => {
        if (!user) return;
        const token = localStorage.getItem('token');

        // Initialize socket connection
        const newSocket = io(process.env.REACT_APP_SERVER_URL || 'http://localhost:3001', {
            auth: {
                token: token || ''
            }
        });

        console.log('New socket created');

        newSocket.on('connection', () => {
            setConnected(true);
            console.log('Connected to server');
        });

        newSocket.on('disconnect', () => {
            setConnected(false);
            console.log('Disconnected from server');
        });

        setSocket(newSocket);

        return () => {
            newSocket.close();
        };
    }, [user]);

    return (
        <SocketContext.Provider value={{ socket, connected }}>
            {children}
        </SocketContext.Provider>
    );
};
import { useState, useEffect } from 'react';
import { GameState } from '@/types/game';
import { useSocket } from './useSocket';

export const useGameState = (gameId: string | undefined) => {
    const [gameState, setGameState] = useState<GameState | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { socket } = useSocket();

    useEffect(() => {
        if (!gameId || !socket) return;

        setLoading(true);
        setError(null);

        // Request initial game state
        socket.emit('getGameState', gameId);

        // Listen for initial game state
        socket.on('gameState', (state: GameState) => {
            setGameState(state);
            setLoading(false);
        });

        // Listen for game state updates
        socket.on('gameStateUpdate', (state: GameState) => {
            setGameState(state);
        });

        // Handle errors
        socket.on('gameError', (errorMessage: string) => {
            setError(errorMessage);
            setLoading(false);
        });

        return () => {
            socket.off('gameState');
            socket.off('gameStateUpdate');
            socket.off('gameError');
        };
    }, [gameId, socket]);

    return {
        gameState,
        setGameState,
        loading,
        error
    };
};
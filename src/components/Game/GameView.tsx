import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useSocket } from '../../hooks/useSocket';
import { useGameState } from '../../hooks/useGameState';
import GameBoard from './GameBoard';
import LoadingSpinner from '../Misc/LoadingSpinner';
import { Card } from '@/types/card';
import { GameState } from '@/types/game';

const GameView: React.FC = () => {
    const { gameId } = useParams<{ gameId: string }>();
    const navigate = useNavigate();
    const { user } = useAuth();
    const { socket } = useSocket();
    const { gameState, setGameState, loading, error } = useGameState(gameId);
    const [connectionError, setConnectionError] = useState<string | null>(null);

    useEffect(() => {
        if (!gameId || !socket || !user) return;

        // Join the game room
        socket.emit('joinGame', { gameId, playerId: user.userId });

        // Listen for game state updates
        socket.on('gameStateUpdate', (newGameState: GameState) => {
            setGameState(newGameState);
        });

        // Handle connection errors
        socket.on('gameError', (errorMessage: string) => {
            setConnectionError(errorMessage);
        });

        // Handle game not found
        socket.on('gameNotFound', () => {
            navigate('/rooms');
        });

        // Handle player disconnection
        socket.on('playerDisconnected', (playerId: string) => {
            console.log(`Player ${playerId} disconnected`);
        });

        // Handle game end
        socket.on('gameEnded', (winner: string) => {
            console.log(`Game ended, winner: ${winner}`);
        });

        // Cleanup on unmount
        return () => {
            socket.off('gameStateUpdate');
            socket.off('gameError');
            socket.off('gameNotFound');
            socket.off('playerDisconnected');
            socket.off('gameEnded');
            socket.emit('leaveGame', { gameId, playerId: user.userId });
        };
    }, [gameId, socket, user, navigate, setGameState]);

    const handleCardPlay = (card: Card) => {
        if (!socket || !gameId || !user) return;

        socket.emit('playCard', {
            gameId,
            playerId: user.userId,
            cardId: card.id
        });
    };

    const handleGameAction = (action: string) => {
        if (!socket || !gameId || !user) return;

        socket.emit('gameAction', {
            gameId,
            playerId: user.userId,
            action
        });
    };

    const handleLeaveGame = () => {
        if (socket && gameId && user) {
            socket.emit('leaveGame', { gameId, playerId: user.userId });
        }
        navigate('/rooms');
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <LoadingSpinner />
            </div>
        );
    }

    if (error || connectionError) {
        return (
            <div className="flex flex-col items-center justify-center h-screen">
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                    {error || connectionError}
                </div>
                <button
                    onClick={() => navigate('/rooms')}
                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                    Back to Rooms
                </button>
            </div>
        );
    }

    if (!gameState || !user) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div>Game not found</div>
            </div>
        );
    }

    return (
        <div className="h-screen flex flex-col">
            {/* Header */}
            <header className="bg-white shadow-sm border-b p-4">
                <div className="flex justify-between items-center">
                    <h1 className="text-2xl font-bold">German Bridge</h1>
                    <div className="flex items-center gap-4">
                        <span className="text-gray-600">Game ID: {gameId}</span>
                        <button
                            onClick={handleLeaveGame}
                            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                        >
                            Leave Game
                        </button>
                    </div>
                </div>
            </header>

            {/* Game Board */}
            <main className="flex-1 overflow-hidden">
                <GameBoard
                    gameState={gameState}
                    currentPlayerId={user.userId}
                    onCardPlay={handleCardPlay}
                    onGameAction={handleGameAction}
                />
            </main>
        </div>
    );
};

export default GameView;
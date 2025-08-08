import React, {useEffect, useState} from "react";
import { useParams } from 'react-router';
import {useNavigate} from "react-router-dom";
import { useAuth } from '../../hooks/useAuth';
import {RoomService} from "../../services/roomService";
import { Room } from '../../types/room';
import { Player } from '../../types/player';

const RoomLobby: React.FC = () => {
    const { roomId } = useParams();
    const navigate = useNavigate();
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const { user, logout } = useAuth();
    const [room, setRoom] = React.useState<Room | null>(null);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    useEffect(() => {
        fetchRoom();
        
        // Set up polling every 5 seconds
        const interval = setInterval(fetchRoom, 5000);
        
        // Cleanup interval on component unmount
        return () => clearInterval(interval);
    }, [roomId]);

    const fetchRoom = async () => {
        try {
            if (!roomId) {
                const newError = 'Room ID is missing. Please provide a valid room ID in the URL.';
                setError(newError);
                return;
            }
            
            const fetchedRoom = await RoomService.getRoomById(roomId);
            setRoom(fetchedRoom);
            setError(null);

        } catch (err) {
            setError('Failed to load room. Please try again.');
            console.error('Error fetching room:', err);
        } finally {
            setLoading(false);
        }
    }

    const handleGameStart = async (roomId: string | undefined) => {
        try {
            const tk = localStorage.getItem('token');
            const response = await fetch(`http://localhost:3001/api/games/${roomId}/start`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + tk },
                body: JSON.stringify({ roomId: roomId })
            });
            if (!response.ok) {
                throw new Error('Start game failed.');
            }

            const gameData = await response.json();
            localStorage.setItem('gameId', JSON.stringify(gameData.id));
            navigate(`/game/${gameData.id}`);
        } catch (error) {
            console.error('Error starting game:', error);
            alert('Failed to start game. Please try again.');
        }
    };

    const handleReadyToggle = async () => {
        // TODO: Implement ready toggle functionality
        console.log('Ready toggle clicked');
    };

    const handleLeaveRoom = async () => {
        try {
            if (!roomId) return;
            
            const tk = localStorage.getItem('token');
            const response = await fetch(`http://localhost:3001/api/rooms/${roomId}/leave`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + tk },
            });
            
            if (response.ok) {
                navigate('/rooms');
            } else {
                throw new Error('Failed to leave room');
            }
        } catch (error) {
            console.error('Error leaving room:', error);
            alert('Failed to leave room. Please try again.');
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-4 border-indigo-600 border-t-transparent mx-auto"></div>
                    <p className="mt-6 text-lg text-gray-700 font-medium">Loading room...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-6">
                <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Room</h3>
                    <p className="text-gray-600 mb-6">{error}</p>
                    <button
                        onClick={fetchRoom}
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
                    >
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    if (!room) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-6">
                <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Room Not Found</h3>
                    <p className="text-gray-600 mb-6">The room you're looking for doesn't exist or you don't have access to it.</p>
                    <button
                        onClick={() => navigate('/rooms')}
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
                    >
                        Back to Rooms
                    </button>
                </div>
            </div>
        );
    }

    const allPlayersReady = room.players.length >= 2 && room.players.every(player => player.isReady);
    const isHost = room.hostId === user?.userId;

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
            {/* Header */}
            <div className="bg-white shadow-sm border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center py-6">
                        <div className="flex items-center">
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">German Bridge</h1>
                                <p className="text-sm text-gray-600">Room: {room.name}</p>
                            </div>
                        </div>

                        <div className="flex items-center space-x-4">
                            <div className="flex items-center space-x-2 bg-gray-100 rounded-lg px-3 py-2">
                                <div className="h-2 w-2 bg-green-400 rounded-full"></div>
                                <span className="text-sm text-gray-700">Welcome, {user?.userName}!</span>
                            </div>
                            <button
                                onClick={handleLogout}
                                className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
                            >
                                Logout
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Room Info */}
                <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 mb-8">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900 mb-2">{room.name}</h2>
                            <div className="flex items-center space-x-4">
                                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                                    room.status === 0 ? 'bg-yellow-100 text-yellow-800' :
                                    room.status === 1 ? 'bg-green-100 text-green-800' :
                                    'bg-gray-100 text-gray-800'
                                }`}>
                                    {room.status === 0 ? 'Waiting for Players' : room.status === 1 ? 'Game in Progress' : 'Game Finished'}
                                </span>
                                <span className="text-sm text-gray-600">
                                    {room.players.length}/{room.settings.maxPlayers} players
                                </span>
                            </div>
                        </div>
                        
                        <div className="flex items-center space-x-3">
                            <button
                                onClick={handleReadyToggle}
                                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200"
                            >
                                {room.players.find(p => p.id === user?.userId)?.isReady ? 'Not Ready' : 'Ready'}
                            </button>
                            
                            <button
                                onClick={handleLeaveRoom}
                                className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
                            >
                                Leave Room
                            </button>
                        </div>
                    </div>

                    <div className="text-sm text-gray-600">
                        <p>The game will start once all players indicate they are ready.</p>
                    </div>
                </div>

                {/* Players Section */}
                <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 mb-8">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Players</h3>
                    
                    {room.players.length === 0 ? (
                        <div className="text-center py-8">
                            <p className="text-gray-600">No players have joined yet.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {room.players.map((player: Player) => (
                                <div
                                    key={player.id}
                                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200"
                                >
                                    <div className="flex items-center space-x-3">
                                        <div className="h-10 w-10 bg-gradient-to-r from-indigo-400 to-purple-400 rounded-full flex items-center justify-center text-white font-semibold">
                                            {player.name.charAt(0).toUpperCase()}
                                        </div>
                                        <div>
                                            <div className="flex items-center space-x-2">
                                                <span className="font-medium text-gray-900">{player.name}</span>
                                                {player.id === room.hostId && (
                                                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                                        Host
                                                    </span>
                                                )}
                                            </div>
                                            <div className="flex items-center space-x-2 mt-1">
                                                <div className={`h-2 w-2 rounded-full ${player.isOnline ? 'bg-green-400' : 'bg-red-400'}`}></div>
                                                <span className="text-sm text-gray-600">
                                                    {player.isOnline ? 'Online' : 'Offline'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div className="flex items-center space-x-2">
                                        {player.isReady ? (
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                Ready
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                                Not Ready
                                            </span>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Game Start Section */}
                {isHost && allPlayersReady && room.players.length >= 2 && (
                    <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
                        <div className="text-center">
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">All Players Ready!</h3>
                            <p className="text-gray-600 mb-4">You can now start the game.</p>
                            <button
                                onClick={() => handleGameStart(roomId)}
                                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg shadow-sm text-white bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-all duration-200 transform hover:scale-105"
                            >
                                Start Game
                            </button>
                        </div>
                    </div>
                )}

                {!allPlayersReady && room.players.length >= 2 && (
                    <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
                        <div className="text-center">
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">Waiting for Players</h3>
                            <p className="text-gray-600">
                                {room.players.filter(p => p.isReady).length} of {room.players.length} players are ready
                            </p>
                        </div>
                    </div>
                )}

                {room.players.length < 2 && (
                    <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
                        <div className="text-center">
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">Need More Players</h3>
                            <p className="text-gray-600">At least 2 players are required to start the game.</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default RoomLobby;

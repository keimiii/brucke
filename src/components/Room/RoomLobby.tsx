import React, {useEffect, useState} from "react";
import { useParams } from 'react-router';
import {useNavigate} from "react-router-dom";
import { useAuth } from '../../hooks/useAuth';
import {RoomService} from "../../services/roomService";
import { Room } from '../../types/room';

const SamplePlayers = [
    {
        id: "1",
        name: "Player 1",
        isOnline: true,
        isReady: true,
    },
    {
        id: "2",
        name: "Player 2",
        isOnline: true,
        isReady: true,
    }
]

const RoomLobby: React.FC = () => {
    const { roomId } = useParams();
    const navigate = useNavigate();
    const [error, setError] = useState<string | null>(null);;
    const [loading, setLoading] = useState(true);
    const { user, logout } = useAuth();
    const [room, setRoom] = React.useState<Room | null>(null);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    useEffect(() => {
        fetchRoom();
    }, []);

    const fetchRoom = async () => {
        try {
            setLoading(true);
            setError(null);
            if (!roomId) {
                const newError = 'Room ID is missing. Please provide a valid room ID in the URL.';
                setError(newError);
                return;
            }
            const fetchedRoom = await RoomService.getRoomById(roomId);
            setRoom(fetchedRoom);

        } catch (err) {
            setError('Failed to load room. Please try again.');
            console.error('Error fetching room:', err);
        } finally {
            setLoading(false);
        }
    }

    const handleGameStart = async (roomId: string | undefined) => {
        // Call startGame API and navigate to game page
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
                throw error;
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

    return (
        <div>
            {/* Header */}
            <div className="bg-white shadow-sm border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center py-6">
                        <div className="flex items-center">
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">German Bridge</h1>
                                <p className="text-sm text-gray-600">Room: {room?.name}</p>
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
            <h2>Room ID: {roomId}</h2>
            <h4>The game will start once all players indicate they are ready.</h4>
            <h4>Players:</h4>
            <ul>
                { SamplePlayers.map((player) => (
                    <li key={player.id}>
                        {player.name}
                    </li>
                ))}
            </ul>
            <button onClick={() => handleGameStart(roomId)}>Start Game</button>
        </div>
    );
};

export default RoomLobby;

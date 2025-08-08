import React, { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import { RoomService } from '../../services/roomService';
import { Room } from '../../types/room';
import { useAuth } from '../../hooks/useAuth';
import { generateSlug } from "random-word-slugs";

const RoomList: React.FC = () => {
    const [rooms, setRooms] = useState<Room[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();
    const { user, logout } = useAuth();

    useEffect(() => {
        fetchRooms();
    }, []);

    const fetchRooms = async () => {
        try {
            setLoading(true);
            setError(null);
            const fetchedRooms = await RoomService.getRooms();
            setRooms(fetchedRooms);
        } catch (err) {
            setError('Failed to load rooms. Please try again.');
            console.error('Error fetching rooms:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleRoomClick = async (room: Room) => {
        if (!user) {
            alert("Please log in to join a room");
            return;
        }

        try {
            await RoomService.joinRoom(room.id);
            navigate(`/room/${room.id}`);
        } catch (err) {
            alert(err instanceof Error ? err.message : "Failed to join room");
        }
    };

    const handleCreateRoom = async () => {
        if (!user) {
            alert("Please log in to create a room");
            return;
        }

        try {
            const roomName =  generateSlug();
            const roomData = await RoomService.createRoom({
                name: roomName
            });
            navigate(`/room/${roomData.id}`);
        } catch (err) {
            alert(err instanceof Error ? err.message : "Failed to join room");
        }
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-4 border-indigo-600 border-t-transparent mx-auto"></div>
                    <p className="mt-6 text-lg text-gray-700 font-medium">Loading rooms...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-6">
                <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Rooms</h3>
                    <p className="text-gray-600 mb-6">{error}</p>
                    <button
                        onClick={fetchRooms}
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
                    >
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
            {/* Header */}
            <div className="bg-white shadow-sm border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center py-6">
                        <div className="flex items-center">
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">German Bridge</h1>
                                <p className="text-sm text-gray-600">Available Game Rooms</p>
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
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Action Bar */}
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h2 className="text-3xl font-bold text-gray-900 mb-2">Game Rooms</h2>
                        <p className="text-gray-600">Join an existing room or create a new one to start playing</p>
                    </div>
                    
                    <button
                        onClick={handleCreateRoom}
                        disabled={!user}
                        className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg shadow-sm text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105"
                    >
                        Create New Room
                    </button>
                </div>

                {/* Rooms Grid */}
                {rooms.length === 0 ? (
                    <div className="text-center py-12">
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No rooms available</h3>
                        <p className="text-gray-600 mb-6">Be the first to create a room and start playing!</p>
                        <button
                            onClick={handleCreateRoom}
                            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
                        >
                            Create First Room
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {rooms.map((room) => (
                            <div
                                key={room.id}
                                onClick={() => handleRoomClick(room)}
                                className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 cursor-pointer hover:shadow-xl hover:border-indigo-300 transition-all duration-200 transform hover:-translate-y-1"
                            >
                                {/* Room Header */}
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex-1">
                                        <h3 className="text-lg font-semibold text-gray-900 mb-1">{room.name}</h3>
                                        <div className="flex items-center space-x-2">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                room.status === 0 ? 'bg-yellow-100 text-yellow-800' :
                                                room.status === 1 ? 'bg-green-100 text-green-800' :
                                                'bg-gray-100 text-gray-800'
                                            }`}>
                                                {room.status === 0 ? 'Waiting' : room.status === 1 ? 'Playing' : 'Finished'}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Room Details */}
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-gray-600">Players:</span>
                                        <span className="font-medium text-gray-900">
                                            {room.players.length}/{room.settings.maxPlayers}
                                        </span>
                                    </div>
                                    
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-gray-600">Created:</span>
                                        <span className="font-medium text-gray-900">
                                            {new Date(room.createdAt).toLocaleDateString()}
                                        </span>
                                    </div>

                                    {/* Player List */}
                                    {room.players.length > 0 && (
                                        <div className="pt-3 border-t border-gray-100">
                                            <div className="flex items-center space-x-2">
                                                <span className="text-xs text-gray-500">Players:</span>
                                                <div className="flex -space-x-2">
                                                    {room.players.slice(0, 3).map((player, index) => (
                                                        <div
                                                            key={player.id}
                                                            className="h-6 w-6 bg-gradient-to-r from-indigo-400 to-purple-400 rounded-full flex items-center justify-center text-xs text-white font-medium border-2 border-white"
                                                            title={player.name}
                                                        >
                                                            {player.name.charAt(0).toUpperCase()}
                                                        </div>
                                                    ))}
                                                    {room.players.length > 3 && (
                                                        <div className="h-6 w-6 bg-gray-300 rounded-full flex items-center justify-center text-xs text-gray-600 font-medium border-2 border-white">
                                                            +{room.players.length - 3}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Join Button */}
                                <div className="mt-4 pt-4 border-t border-gray-100">
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleRoomClick(room);
                                        }}
                                        className="w-full inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200"
                                    >
                                        Join Room
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default RoomList;

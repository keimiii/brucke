import { v4 as uuidv4 } from 'uuid';
import { supabaseService, Room as SupabaseRoom, Player as SupabasePlayer } from './supabaseService';
// @ts-ignore
import { Room } from '../../../types/room';

export interface Player {
    id: string;
    username: string;
    isReady: boolean;
}

export class RoomService {
    constructor() {
        // No longer need to initialize sample rooms as they'll come from database
    }

    async getAllRooms(): Promise<Room[]> {
        try {
            const supabaseRooms = await supabaseService.getAllRooms();
            
            // Convert Supabase rooms to our Room format
            const rooms: Room[] = await Promise.all(
                supabaseRooms.map(async (supabaseRoom) => {
                    const players = await supabaseService.getPlayersInRoom(supabaseRoom.room_id);
                    
                    return {
                        id: supabaseRoom.room_id,
                        name: supabaseRoom.name,
                        players: players.map(player => ({
                            id: player.user_id,
                            name: player.email, // Using email as name for now
                            isReady: false,
                            isOnline: true,
                            hand: [],
                            score: 0,
                            position: 'north', // Default position
                            tricksWon: 0
                        })),
                        createdBy: players[0]?.user_id || '',
                        createdAt: new Date(supabaseRoom.created_at),
                        hostId: players[0]?.user_id || '',
                        status: supabaseRoom.status,
                        settings: {
                            maxPlayers: 4, // Default max players
                            isPrivate: false,
                            allowSpectators: false
                        },
                        spectators: [],
                        game: null // Game state will be handled separately
                    };
                })
            );

            return rooms.filter(room => room.status !== 2);
        } catch (error) {
            console.error('Error fetching rooms from Supabase:', error);
            throw error;
        }
    }

    async createRoom(data: {
        name: string;
        maxPlayers: number;
        isPrivate: boolean;
        createdBy: string;
        creatorName: string;
    }): Promise<Room> {
        try {
            const roomId = uuidv4();
            
            // Create room in Supabase
            const supabaseRoom = await supabaseService.createRoom({
                room_id: roomId,
                game_id: null,
                name: data.name,
                status: 0
            });

            // Get or create player in Supabase
            let player = await supabaseService.getPlayerByUserId(data.createdBy);
            if (!player) {
                // This shouldn't happen in normal flow, but handle it gracefully
                player = await supabaseService.createPlayer({
                    user_id: data.createdBy,
                    email: data.creatorName,
                    username: data.creatorName,
                    password: '', // This should be handled by auth flow
                    room_id: roomId
                });
            } else {
                // Update existing player's room
                await supabaseService.updatePlayerRoom(data.createdBy, roomId);
            }

            // Return room in our format
            return {
                id: roomId,
                name: data.name,
                players: [{
                    id: data.createdBy,
                    name: player.username || player.email,
                    isReady: false,
                    isOnline: true,
                    hand: [],
                    score: 0,
                    position: 'north',
                    tricksWon: 0
                }],
                createdBy: data.createdBy,
                createdAt: new Date(supabaseRoom.created_at),
                hostId: data.createdBy,
                status: 0,
                settings: {
                    maxPlayers: data.maxPlayers,
                    isPrivate: data.isPrivate,
                    allowSpectators: false
                },
                spectators: [],
                game: null
            };
        } catch (error) {
            console.error('Error creating room in Supabase:', error);
            throw error;
        }
    }

    async joinRoom(roomId: string, user: { userId: string; userName: string }): Promise<Room> {
        try {
            // Check if room exists
            const supabaseRoom = await supabaseService.getRoomById(roomId);
            if (!supabaseRoom) {
                throw new Error('Room not found');
            }

            // Check if room is full (get current players)
            const currentPlayers = await supabaseService.getPlayersInRoom(roomId);
            if (currentPlayers.length >= 4) { // Assuming max 4 players
                throw new Error('Room is full');
            }

            // Check if user is already in room
            const existingPlayer = currentPlayers.find(p => p.user_id === user.userId);
            if (existingPlayer) {
                throw new Error('Already in room');
            }

            // Get player from database
            let player = await supabaseService.getPlayerByUserId(user.userId);
            if (!player) {
                throw new Error('User not found. Please log in again.');
            }

            // Update player's room
            await supabaseService.updatePlayerRoom(user.userId, roomId);

            // Return updated room
            const updatedRoom = await this.getRoomById(roomId);
            if (!updatedRoom) {
                throw new Error('Failed to get updated room');
            }
            return updatedRoom;
        } catch (error) {
            console.error('Error joining room in Supabase:', error);
            throw error;
        }
    }

    async leaveRoom(roomId: string, userId: string): Promise<Room> {
        try {
            // Update player to remove room association
            await supabaseService.updatePlayerRoom(userId, null);

            // Return updated room
            const updatedRoom = await this.getRoomById(roomId);
            if (!updatedRoom) {
                throw new Error('Failed to get updated room');
            }
            return updatedRoom;
        } catch (error) {
            console.error('Error leaving room in Supabase:', error);
            throw error;
        }
    }

    async getRoomById(roomId: string): Promise<Room | undefined> {
        try {
            const supabaseRoom = await supabaseService.getRoomById(roomId);
            if (!supabaseRoom) {
                return undefined;
            }

            const players = await supabaseService.getPlayersInRoom(roomId);
            
            return {
                id: supabaseRoom.room_id,
                name: supabaseRoom.name,
                players: players.map(player => ({
                    id: player.user_id,
                    name: player.email,
                    isReady: false,
                    isOnline: true,
                    hand: [],
                    score: 0,
                    position: 'north',
                    tricksWon: 0
                })),
                createdBy: players[0]?.user_id || '',
                createdAt: new Date(supabaseRoom.created_at),
                hostId: players[0]?.user_id || '',
                status: supabaseRoom.status,
                settings: {
                    maxPlayers: 4,
                    isPrivate: false,
                    allowSpectators: false
                },
                spectators: [],
                game: null // Game state will be handled separately
            };
        } catch (error) {
            console.error('Error getting room from Supabase:', error);
            return undefined;
        }
    }

    async handleDisconnect(userId: string): Promise<void> {
        try {
            // Remove user from all rooms
            await supabaseService.updatePlayerRoom(userId, null);
        } catch (error) {
            console.error('Error handling disconnect in Supabase:', error);
        }
    }
}
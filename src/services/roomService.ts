import { Room } from '../types/room';

const API_BASE_URL = 'http://localhost:3001/api';

export interface RoomResponse {
    rooms: Room[];
}

export interface SingleRoomResponse {
    room: Room;
}

export class RoomService {
    static async getRooms(): Promise<Room[]> {
        try {
            const response = await fetch(`${API_BASE_URL}/rooms`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                throw new Error('Failed to fetch rooms');
            }

            const data: RoomResponse = await response.json();
            return data.rooms;
        } catch (error) {
            console.error('Error fetching rooms:', error);
            throw error;
        }
    }

    static async getRoomById(roomId: string): Promise<Room> {
        try {
            const response = await fetch(`${API_BASE_URL}/rooms/${roomId}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                throw new Error('Failed to fetch room details');
            }

            const data: SingleRoomResponse = await response.json();
            return data.room;
        } catch (error) {
            console.error('Error fetching room details:', error);
            throw error;
        }
    }

    static async createRoom(roomData: {
        name: string;
        maxPlayers?: number;
        isPrivate?: boolean;
    }): Promise<Room> {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_BASE_URL}/rooms`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify(roomData),
            });

            if (!response.ok) {
                throw new Error('Failed to create room');
            }

            const data: SingleRoomResponse = await response.json();
            return data.room;
        } catch (error) {
            console.error('Error creating room:', error);
            throw error;
        }
    }

    static async joinRoom(roomId: string): Promise<Room> {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_BASE_URL}/rooms/${roomId}/join`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                throw new Error('Failed to join room');
            }

            const data: SingleRoomResponse = await response.json();
            return data.room;
        } catch (error) {
            console.error('Error joining room:', error);
            throw error;
        }
    }
} 
import { v4 as uuidv4 } from 'uuid';
// @ts-ignore
import { Room } from '../../../types/room';

export interface Player {
    id: string;
    username: string;
    isReady: boolean;
}

export class RoomService {
    private rooms: Map<string, Room> = new Map();

    async getAllRooms(): Promise<Room[]> {
        return Array.from(this.rooms.values())
            .filter(room => !room.settings.isPrivate && room.status !== 'finished');
    }

    async createRoom(data: {
        name: string;
        maxPlayers: number;
        isPrivate: boolean;
        createdBy: string;
        creatorName: string;
    }): Promise<Room> {
        const room: Room = {
            id: uuidv4(),
            name: data.name,
            players: [{
                id: data.createdBy,
                name: data.creatorName,
                isReady: false,
                isOnline: false,
                hand: [],
                score: 0,
                position: 'north',
                tricksWon: 0
            }],
            createdBy: data.createdBy,
            createdAt: new Date(),
            hostId: data.createdBy,
            status: 'waiting',
            settings: {
                maxPlayers: data.maxPlayers,
                isPrivate: false,
                allowSpectators: false
            },
            spectators: [],
            game: null
        };

        this.rooms.set(room.id, room);
        return room;
    }

    async joinRoom(roomId: string, user: { userId: string; userName: string }): Promise<Room> {
        const room = this.rooms.get(roomId);

        if (!room) {
            throw new Error('Room not found');
        }

        if (room.players.length >= room.settings.maxPlayers) {
            throw new Error('Room is full');
        }

        if (room.players.some(p => p.id === user.userId)) {
            throw new Error('Already in room');
        }

        room.players.push({
            id: user.userId,
            name: user.userName,
            isReady: false,
            isOnline: false,
            hand: [],
            score: 0,
            position: 'south', // TODO update position of user
            tricksWon: 0
        });

        return room;
    }

    async leaveRoom(roomId: string, userId: string): Promise<Room> {
        const room = this.rooms.get(roomId);

        if (!room) {
            throw new Error('Room not found');
        }

        room.players = room.players.filter(p => p.id !== userId);

        // Delete room if empty
        if (room.players.length === 0) {
            this.rooms.delete(roomId);
        }

        return room;
    }

    async getRoomById(roomId: string): Promise<Room | undefined> {
        return this.rooms.get(roomId);
    }

    async handleDisconnect(userId: string): Promise<void> {
        // Remove user from all rooms
        for (const [roomId, room] of this.rooms.entries()) {
            if (room.players.some(p => p.id === userId)) {
                await this.leaveRoom(roomId, userId);
            }
        }
    }
}
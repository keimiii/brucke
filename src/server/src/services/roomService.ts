import { v4 as uuidv4 } from 'uuid';

export interface Room {
    id: string;
    name: string;
    maxPlayers: number;
    currentPlayers: Player[];
    isPrivate: boolean;
    createdBy: string;
    createdAt: Date;
    status: 'waiting' | 'playing' | 'finished';
    gameId?: string;
}

export interface Player {
    id: string;
    username: string;
    isReady: boolean;
}

export class RoomService {
    private rooms: Map<string, Room> = new Map();

    async getAllRooms(): Promise<Room[]> {
        return Array.from(this.rooms.values())
            .filter(room => !room.isPrivate && room.status !== 'finished');
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
            maxPlayers: data.maxPlayers,
            currentPlayers: [{
                id: data.createdBy,
                username: data.creatorName,
                isReady: false
            }],
            isPrivate: data.isPrivate,
            createdBy: data.createdBy,
            createdAt: new Date(),
            status: 'waiting'
        };

        this.rooms.set(room.id, room);
        return room;
    }

    async joinRoom(roomId: string, user: { userId: string; userName: string }): Promise<Room> {
        const room = this.rooms.get(roomId);

        if (!room) {
            throw new Error('Room not found');
        }

        if (room.currentPlayers.length >= room.maxPlayers) {
            throw new Error('Room is full');
        }

        if (room.currentPlayers.some(p => p.id === user.userId)) {
            throw new Error('Already in room');
        }

        room.currentPlayers.push({
            id: user.userId,
            username: user.userName,
            isReady: false
        });

        return room;
    }

    async leaveRoom(roomId: string, userId: string): Promise<Room> {
        const room = this.rooms.get(roomId);

        if (!room) {
            throw new Error('Room not found');
        }

        room.currentPlayers = room.currentPlayers.filter(p => p.id !== userId);

        // Delete room if empty
        if (room.currentPlayers.length === 0) {
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
            if (room.currentPlayers.some(p => p.id === userId)) {
                await this.leaveRoom(roomId, userId);
            }
        }
    }
}
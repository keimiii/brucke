import { Server, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import config from '../config';
import { GameService } from '../services/gameService';
import { RoomService } from '../services/roomService';

export interface AuthSocket extends Socket {
    auth?: {
        userId: string;
        userName: string;
    };
}

const gameService = new GameService();
const roomService = new RoomService();

export const setupSocketHandlers = (io: Server) => {
    // Authentication middleware for socket connections
    io.use((socket: AuthSocket, next) => {
        const token = socket.handshake.auth.token;

        if (!token) {
            return next(new Error('Authentication error'));
        }

        // @ts-ignore
        jwt.verify(token, config.jwtSecret, (err, decoded) => {
            if (err) {
                return next(new Error('Authentication error'));
            }
            socket.auth = decoded as { userId: string; userName: string };
            next();
        });
    });

    io.on('connection', (socket: AuthSocket) => {
        console.log(`User ${socket.auth?.userName} connected`);

        // Join room
        socket.on('join-room', async (roomId: string) => {
            try {
                await socket.join(roomId);
                const room = await roomService.joinRoom(roomId, socket.auth!);

                socket.to(roomId).emit('user-joined', {
                    user: socket.auth,
                    room
                });

                socket.emit('room-joined', room);
            } catch (error) {
                socket.emit('error', { message: 'Failed to join room' });
            }
        });

        // Leave room
        socket.on('leave-room', async (roomId: string) => {
            try {
                await socket.leave(roomId);
                const room = await roomService.leaveRoom(roomId, socket.auth!.userId);

                socket.to(roomId).emit('user-left', {
                    userId: socket.auth!.userId,
                    room
                });
            } catch (error) {
                socket.emit('error', { message: 'Failed to leave room' });
            }
        });

        // Start game
        socket.on('start-game', async (roomId: string) => {
            try {
                const game = await gameService.startGame(roomId);
                io.to(roomId).emit('game-started', game);
            } catch (error) {
                socket.emit('error', { message: 'Failed to start game' });
            }
        });

        // Make a move
        socket.on('make-move', async (data: { gameId: string; move: any }) => {
            try {
                const gameState = await gameService.makeMove(
                    data.gameId,
                    socket.auth!.userId,
                    data.move
                );

                io.to(data.gameId).emit('game-updated', gameState);
            } catch (error) {
                socket.emit('error', { message: 'Invalid move' });
            }
        });

        // Handle disconnect
        socket.on('disconnect', async () => {
            console.log(`User ${socket.auth?.userName} disconnected`);
            // Clean up user from rooms
            await roomService.handleDisconnect(socket.auth!.userId);
        });
    });
};

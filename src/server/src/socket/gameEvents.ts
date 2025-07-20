import { Server, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import config from '../config';
import { GameService } from '../services/gameService';
import { RoomService } from '../services/roomService';

export interface AuthSocket extends Socket {
    user?: {
        id: string;
        username: string;
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

            socket.user = decoded as { id: string; username: string };
            next();
        });
    });

    io.on('connection', (socket: AuthSocket) => {
        console.log(`User ${socket.user?.username} connected`);

        // Join room
        socket.on('join-room', async (roomId: string) => {
            try {
                await socket.join(roomId);
                const room = await roomService.joinRoom(roomId, socket.user!);

                socket.to(roomId).emit('user-joined', {
                    user: socket.user,
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
                const room = await roomService.leaveRoom(roomId, socket.user!.id);

                socket.to(roomId).emit('user-left', {
                    userId: socket.user!.id,
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
                    socket.user!.id,
                    data.move
                );

                io.to(data.gameId).emit('game-updated', gameState);
            } catch (error) {
                socket.emit('error', { message: 'Invalid move' });
            }
        });

        // Handle disconnect
        socket.on('disconnect', async () => {
            console.log(`User ${socket.user?.username} disconnected`);
            // Clean up user from rooms
            await roomService.handleDisconnect(socket.user!.id);
        });
    });
};

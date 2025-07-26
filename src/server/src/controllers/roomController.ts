import { Request, Response, NextFunction } from 'express';
import { RoomService } from '../services/roomService';
import { AuthRequest } from '../middleware/auth';

const roomService = new RoomService();

export const getRooms = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const rooms = await roomService.getAllRooms();
        res.json({ rooms });
    } catch (error) {
        next(error);
    }
};

export const createRoom = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const { name, maxPlayers = 4, isPrivate = false } = req.body;

        const room = await roomService.createRoom({
            name,
            maxPlayers,
            isPrivate,
            createdBy: req.user!.userId,
            creatorName: req.user!.userName,
        });

        res.status(201).json({ room });
    } catch (error) {
        next(error);
    }
};

export const joinRoom = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const { roomId } = req.params;
        const room = await roomService.joinRoom(roomId, req.user!);

        res.json({ room });
    } catch (error) {
        next(error);
    }
};

export const leaveRoom = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const { roomId } = req.params;
        const room = await roomService.leaveRoom(roomId, req.user!.userId);

        res.json({ room });
    } catch (error) {
        next(error);
    }
};

export const getRoomDetails = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { roomId } = req.params;
        const room = await roomService.getRoomById(roomId);

        if (!room) {
            return res.status(404).json({ error: 'Room not found' });
        }

        res.json({ room });
    } catch (error) {
        next(error);
    }
};
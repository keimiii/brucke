import express from 'express';
import { authenticateToken } from '../middleware/auth';
import * as roomController from '../controllers/roomController';

const router = express.Router();

// Get all available rooms
router.get('/', roomController.getRooms);

// Create a new room
router.post('/', authenticateToken, roomController.createRoom);

// Join a room
router.post('/:roomId/join', authenticateToken, roomController.joinRoom);

// Leave a room
router.post('/:roomId/leave', authenticateToken, roomController.leaveRoom);

// Get room details
router.get('/:roomId', roomController.getRoomDetails);

export default router;
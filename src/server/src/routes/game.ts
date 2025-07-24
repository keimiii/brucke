import express from 'express';
import { authenticateToken } from '../middleware/auth';
import * as gameController from '../controllers/gameController';

const router = express.Router();

// Start a game
router.post('/:roomId/start', authenticateToken, gameController.startGame);

// Get game state
router.get('/:gameId', authenticateToken, gameController.getGameState);

// Make a move
router.post('/:gameId/move', authenticateToken, gameController.makeMove);

// Get game history
router.get('/:gameId/history', authenticateToken, gameController.getGameHistory);

export default router;
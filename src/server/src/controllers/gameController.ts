import { Response, NextFunction } from 'express';
import { GameService } from '../services/gameService';
import { AuthRequest } from '../middleware/auth';

const gameService = new GameService();

export const getGameState = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const { gameId } = req.params;
        const gameState = await gameService.getGameState(gameId, req.user!.userId);

        if (!gameState) {
            return res.status(404).json({ error: 'Game not found' });
        }

        res.json({ gameState });
    } catch (error) {
        next(error);
    }
};

export const startGame = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const { roomId } = req.params;
        const game = await gameService.startGame(roomId, req.user!.userId);

        res.json({ game });
    } catch (error) {
        next(error);
    }
};

export const makeMove = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const { gameId } = req.params;
        const { move } = req.body;

        const gameState = await gameService.makeMove(gameId, req.user!.userId, move);

        res.json({ gameState });
    } catch (error) {
        next(error);
    }
};

export const getGameHistory = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const { gameId } = req.params;
        const history = await gameService.getGameHistory(gameId);

        res.json({ history });
    } catch (error) {
        next(error);
    }
};
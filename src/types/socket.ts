import { GameSettings, GameState } from "./game";
import { Player } from './player';
import { Card } from "./card";

export interface ServerToClientEvents {
    gameStateUpdate: (gameState: GameState) => void;
    playerJoined: (player: Player) => void;
    playerLeft: (playerId: string) => void;
    cardPlayed: (card: Card, playerId: string) => void;
    gameStarted: (gameState: GameState) => void;
    gameEnded: (winner: string) => void;
    error: (message: string) => void;
}

export interface ClientToServerEvents {
    joinRoom: (roomId: string) => void;
    leaveRoom: () => void;
    playCard: (cardId: string) => void;
    ready: () => void;
    createRoom: (roomSettings: Partial<GameSettings>) => void;
}
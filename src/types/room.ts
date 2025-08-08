import { Player } from './player';
import { GameState, GameSettings } from './game';

export interface Room {
    id: string;
    name: string;
    gameId?: string;
    hostId: string;
    createdBy: string;
    players: Player[];
    spectators: Player[];
    game: GameState | null;
    settings: GameSettings;
    createdAt: Date;
    status: number; // 0 - waiting, 1 - playing, 2 - finished
}
import { Player } from './player';
import { GameState, GameSettings } from './game';

export interface Room {
    id: string;
    name: string;
    hostId: string;
    players: Player[];
    spectators: Player[];
    game: GameState | null;
    settings: GameSettings;
    createdAt: Date;
    status: 'waiting' | 'in_progress' | 'finished';
}
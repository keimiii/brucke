import { Player } from './player';
import { Card, Suit } from './card';

export interface Trick {
    id: string;
    cards: { card: Card; playerId: string }[];
    winner: string | null;
    leadSuit: Suit | null;
}

export interface GameState {
    id: string;
    players: Player[];
    currentTrick: Trick;
    previousTricks: Trick[];
    trumpSuit: Suit | null;
    currentPlayer: string;
    phase: 'waiting' | 'playing' | 'finished';
    winner: string | null;
    startTime: Date;
    endTime?: Date;
    stockPile: Card[];
    currentRound: number;
    maxRounds: number;
}

export interface GameSettings {
    maxPlayers: number;
    isPrivate: boolean;
    allowSpectators: boolean;
    timeLimit?: number;
}
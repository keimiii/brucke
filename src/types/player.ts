import { Card } from './card';
export interface Player {
    id: string;
    name: string;
    isOnline: boolean;
    hand: Card[];
    score: number;
    position: 'north' | 'south' | 'east' | 'west';
    tricksWon: number;
    isReady: boolean;
}

export interface PlayerAction {
    type: 'PLAY_CARD' | 'PASS' | 'READY';
    playerId: string;
    cardId?: string; // Card being played
    timestamp: Date;
}
import React from 'react';
import Card from '../Misc/Card';
import { Trick } from '@/types/game';
import { Player } from '@/types/player';

interface PlayedCardsProps {
    currentTrick: Trick;
    players: Player[];
    className?: string;
}

// Displays current trick in a bridge table layout
// Shows cards played by each player with their names
// Indicates lead suit
// Responsive positioning for players
const PlayedCards: React.FC<PlayedCardsProps> = ({
                                                     currentTrick,
                                                     players,
                                                     className = ''
                                                 }) => {
    const getPlayerName = (playerId: string) => {
        return players.find(p => p.id === playerId)?.name || 'Unknown';
    };

    return (
        <div className={`flex flex-col items-center ${className}`}>
            <h3 className="text-lg font-semibold mb-4">Current Trick</h3>
            <div className="relative w-64 h-64 border-2 border-gray-300 rounded-lg bg-green-100">
                {currentTrick.cards.map((playedCard, index) => {
                    const positions = [
                        { top: '10px', left: '50%', transform: 'translateX(-50%)' }, // North
                        { right: '10px', top: '50%', transform: 'translateY(-50%)' }, // East
                        { bottom: '10px', left: '50%', transform: 'translateX(-50%)' }, // South
                        { left: '10px', top: '50%', transform: 'translateY(-50%)' } // West
                    ];

                    return (
                        <div
                            key={playedCard.card.id}
                            className="absolute"
                            style={positions[index]}
                        >
                            <Card
                                card={playedCard.card}
                                size="small"
                                className="mb-1"
                            />
                            <div className="text-xs text-center font-medium">
                                {getPlayerName(playedCard.playerId)}
                            </div>
                        </div>
                    );
                })}

                {currentTrick.cards.length === 0 && (
                    <div className="absolute inset-0 flex items-center justify-center text-gray-500">
                        Waiting for first card...
                    </div>
                )}
            </div>

            {currentTrick.leadSuit && (
                <div className="mt-2 text-sm text-gray-600">
                    Lead suit: {currentTrick.leadSuit}
                </div>
            )}
        </div>
    );
};

export default PlayedCards;
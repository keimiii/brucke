import React, { useState } from 'react';
import Card from '../Misc/Card';
import { Trick } from '@/types/game';
import { Player } from '@/types/player';

interface TrickHistoryProps {
    previousTricks: Trick[];
    players: Player[];
    className?: string;
}

// Lists all completed tricks
// Expandable detail view for each trick, shows who won each trick
// Scrollable history for long games
const TrickHistory: React.FC<TrickHistoryProps> = ({
                                                       previousTricks,
                                                       players,
                                                       className = ''
                                                   }) => {
    const [selectedTrick, setSelectedTrick] = useState<Trick | null>(null);

    const getPlayerName = (playerId: string) => {
        return players.find(p => p.id === playerId)?.name || 'Unknown';
    };

    const getWinnerName = (trick: Trick) => {
        return trick.winner ? getPlayerName(trick.winner) : 'Unknown';
    };

    return (
        <div className={`bg-white rounded-lg shadow-lg p-4 ${className}`}>
            <h3 className="text-lg font-semibold mb-4">Trick History</h3>

            {previousTricks.length === 0 ? (
                <div className="text-gray-500 text-center py-4">
                    No tricks played yet
                </div>
            ) : (
                <>
                    <div className="space-y-2 max-h-40 overflow-y-auto">
                        {previousTricks.map((trick, index) => (
                            <div
                                key={trick.id}
                                className={`flex justify-between items-center p-2 rounded cursor-pointer hover:bg-gray-50 ${
                                    selectedTrick?.id === trick.id ? 'bg-blue-50 border border-blue-300' : ''
                                }`}
                                onClick={() => setSelectedTrick(selectedTrick?.id === trick.id ? null : trick)}
                            >
                                <span className="font-medium">Trick {index + 1}</span>
                                <span className="text-sm text-gray-600">
                  Won by: {getWinnerName(trick)}
                </span>
                            </div>
                        ))}
                    </div>

                    {selectedTrick && (
                        <div className="mt-4 pt-4 border-t border-gray-200">
                            <h4 className="font-semibold mb-2">
                                Trick Details - Won by {getWinnerName(selectedTrick)}
                            </h4>
                            <div className="flex gap-2 justify-center">
                                {selectedTrick.cards.map((playedCard, index) => (
                                    <div key={playedCard.card.id} className="text-center">
                                        <Card
                                            card={playedCard.card}
                                            size="small"
                                            className="mb-1"
                                        />
                                        <div className="text-xs">{getPlayerName(playedCard.playerId)}</div>
                                    </div>
                                ))}
                            </div>
                            {selectedTrick.leadSuit && (
                                <div className="text-sm text-gray-600 text-center mt-2">
                                    Lead suit: {selectedTrick.leadSuit}
                                </div>
                            )}
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default TrickHistory;
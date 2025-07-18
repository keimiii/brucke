import React from 'react';
import { Player } from '@/types/player';
import { GameState } from '@/types/game';

interface ScoreBoardProps {
    players: Player[];
    gameState: GameState;
    className?: string;
}

// Real-time score tracking
// Shows online/offline status of players
// Displays current round and game info, highlights current player
// Shows tricks won and stock pile information
const ScoreBoard: React.FC<ScoreBoardProps> = ({
                                                   players,
                                                   gameState,
                                                   className = ''
                                               }) => {
    const sortedPlayers = [...players].sort((a, b) => b.score - a.score);

    return (
        <div className={`bg-white rounded-lg shadow-lg p-4 ${className}`}>
            <h3 className="text-lg font-semibold mb-4">Scoreboard</h3>

            <div className="space-y-2">
                {sortedPlayers.map((player, index) => (
                    <div
                        key={player.id}
                        className={`flex justify-between items-center p-2 rounded ${
                            gameState.currentPlayer === player.id
                                ? 'bg-blue-100 border-2 border-blue-300'
                                : 'bg-gray-50'
                        }`}
                    >
                        <div className="flex items-center">
                            <span className="font-medium mr-2">#{index + 1}</span>
                            <span className={`${player.isOnline ? 'text-green-600' : 'text-red-600'}`}>
                ●
              </span>
                            <span className="ml-2">{player.name}</span>
                        </div>
                        <div className="text-right">
                            <div className="font-semibold">{player.score} pts</div>
                            <div className="text-sm text-gray-600">{player.tricksWon} tricks</div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="text-sm text-gray-600">
                    Round {gameState.currentRound} of {gameState.maxRounds}
                </div>
                {gameState.trumpSuit && (
                    <div className="text-sm text-gray-600">
                        Trump: {gameState.trumpSuit}
                    </div>
                )}
                <div className="text-sm text-gray-600">
                    Stock pile: {gameState.stockPile.length} cards
                </div>
            </div>
        </div>
    );
};

export default ScoreBoard;
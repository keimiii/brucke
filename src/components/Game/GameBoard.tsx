import React, { useState, useEffect } from 'react';
import PlayerHand from './PlayerHand';
import PlayedCards from './PlayedCards';
import ScoreBoard from './ScoreBoard';
import TrickHistory from './TrickHistory';
import { GameState } from '@/types/game';
import { Card as CardType } from '../../types/card';

interface GameBoardProps {
    gameState: GameState;
    currentPlayerId: string;
    onCardPlay: (card: CardType) => void;
    onGameAction: (action: string) => void;
}

// Main game board with player hands, played cards, scoreboard, and history
const GameBoard: React.FC<GameBoardProps> = ({
                                                 gameState,
                                                 currentPlayerId,
                                                 onCardPlay,
                                                 onGameAction
                                             }) => {
    const [playableCards, setPlayableCards] = useState<CardType[]>([]);

    const currentPlayer = gameState.players.find(p => p.id === currentPlayerId);
    const isCurrentTurn = gameState.currentPlayer === currentPlayerId;

    // Calculate playable cards based on game rules
    useEffect(() => {
        if (!currentPlayer || !isCurrentTurn) {
            setPlayableCards([]);
            return;
        }

        const { hand } = currentPlayer;
        const { currentTrick } = gameState;

        if (currentTrick.cards.length === 0) {
            // First card of trick - can play any card
            setPlayableCards(hand);
        } else {
            // Must follow suit if possible
            const leadSuit = currentTrick.leadSuit;
            const suitCards = hand.filter(card => card.suit === leadSuit);

            if (suitCards.length > 0) {
                setPlayableCards(suitCards);
            } else {
                // No cards of lead suit - can play any card
                setPlayableCards(hand);
            }
        }
    }, [currentPlayer, isCurrentTurn, gameState.currentTrick]);

    const handleCardPlay = (card: CardType) => {
        if (isCurrentTurn && playableCards.some(c => c.id === card.id)) {
            onCardPlay(card);
        }
    };

    if (gameState.phase === 'waiting') {
        return (
            <div className="flex flex-col items-center justify-center h-full">
                <div className="text-xl font-semibold mb-4">Waiting for players...</div>
                <div className="text-gray-600">
                    {gameState.players.length} players joined
                </div>
            </div>
        );
    }

    if (gameState.phase === 'finished') {
        const winner = gameState.players.find(p => p.id === gameState.winner);
        return (
            <div className="flex flex-col items-center justify-center h-full">
                <div className="text-2xl font-bold mb-4 text-green-600">
                    Game Over!
                </div>
                <div className="text-xl mb-4">
                    Winner: {winner?.name || 'Unknown'}
                </div>
                <ScoreBoard players={gameState.players} gameState={gameState} />
                <button
                    onClick={() => onGameAction('NEW_GAME')}
                    className="mt-4 px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                    New Game
                </button>
            </div>
        );
    }

    return (
        <div className="h-full grid grid-cols-1 lg:grid-cols-4 gap-4 p-4">
            {/* Main game area */}
            <div className="lg:col-span-3 flex flex-col">
                {/* Center area with played cards */}
                <div className="flex-1 flex items-center justify-center">
                    <PlayedCards
                        currentTrick={gameState.currentTrick}
                        players={gameState.players}
                    />
                </div>

                {/* Current player's hand */}
                <div className="mt-4">
                    {currentPlayer && (
                        <PlayerHand
                            player={currentPlayer}
                            isCurrentPlayer={isCurrentTurn}
                            onCardPlay={handleCardPlay}
                            playableCards={playableCards}
                        />
                    )}
                </div>

                {/* Game status */}
                <div className="mt-4 text-center text-sm text-gray-600">
                    {isCurrentTurn ? (
                        <span className="text-blue-600 font-semibold">Your turn!</span>
                    ) : (
                        <span>
              Waiting for {gameState.players.find(p => p.id === gameState.currentPlayer)?.name}...
            </span>
                    )}
                </div>
            </div>

            {/* Sidebar with score and history */}
            <div className="lg:col-span-1 flex flex-col gap-4">
                <ScoreBoard
                    players={gameState.players}
                    gameState={gameState}
                />
                <TrickHistory
                    previousTricks={gameState.previousTricks}
                    players={gameState.players}
                />
            </div>
        </div>
    );
};

export default GameBoard;
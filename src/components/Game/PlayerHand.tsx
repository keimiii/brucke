import React, { useState } from 'react';
import Card from '../Misc/Card';
import { Card as CardType } from '../../types/card';
import { Player } from '@/types/player';

interface PlayerHandProps {
    player: Player;
    isCurrentPlayer: boolean;
    onCardPlay: (card: CardType) => void;
    playableCards: CardType[];
}

// Shows current player's hand
// Sorts cards by suit and rank
// Allows to play selected card
// Visual feedback for playable cards
// Interactions: Click to select, click again to play
const PlayerHand: React.FC<PlayerHandProps> = ({
                                                   player,
                                                   isCurrentPlayer,
                                                   onCardPlay,
                                                   playableCards
                                               }) => {
    const [selectedCard, setSelectedCard] = useState<CardType | null>(null);

    const handleCardClick = (card: CardType) => {
        if (!isCurrentPlayer) return;

        const isPlayable = playableCards.some(c => c.id === card.id);
        if (!isPlayable) return;

        if (selectedCard?.id === card.id) {
            // Play the selected card
            onCardPlay(card);
            setSelectedCard(null);
        } else {
            // Select the card
            setSelectedCard(card);
        }
    };

    const sortedHand = [...player.hand].sort((a, b) => {
        if (a.suit !== b.suit) {
            return a.suit.localeCompare(b.suit);
        }
        return a.rank - b.rank;
    });

    return (
        <div className="flex flex-col items-center">
            <div className="mb-2 text-lg font-semibold">
                {player.name} {isCurrentPlayer && '(Your turn)'}
            </div>
            <div className="flex flex-wrap gap-2 justify-center max-w-4xl">
                {sortedHand.map((card) => (
                    <Card
                        key={card.id}
                        card={card}
                        isPlayable={isCurrentPlayer && playableCards.some(c => c.id === card.id)}
                        isSelected={selectedCard?.id === card.id}
                        onClick={() => handleCardClick(card)}
                        size="medium"
                    />
                ))}
            </div>
            {selectedCard && (
                <div className="mt-2 text-sm text-gray-600">
                    Click again to play {selectedCard.rank} of {selectedCard.suit}
                </div>
            )}
        </div>
    );
};

export default PlayerHand;
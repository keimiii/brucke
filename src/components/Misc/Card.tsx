import React from 'react';
import {Card as CardType, Suit, Rank} from '../../types/card';

interface CardProps {
    card: CardType;
    isPlayable?: boolean;
    isSelected?: boolean;
    isHidden?: boolean;
    onClick?: () => void;
    size?: 'small' | 'medium' | 'large';
    className?: string;
}

// Displays individual playing cards with suit symbols and ranks
// Handles play states: playable, selected, hidden
// Multiple sizes, default medium
// Color coding for various suits: red for hearts/diamonds, black for clubs/spades
const Card: React.FC<CardProps> = ({
                                       card,
                                       isPlayable = false,
                                       isSelected = false,
                                       isHidden = false,
                                       onClick,
                                       size = 'medium',
                                       className = ''
                                   }) => {
    const suitSymbols = {
        [Suit.HEARTS]: '♥',
        [Suit.DIAMONDS]: '♦',
        [Suit.CLUBS]: '♣',
        [Suit.SPADES]: '♠'
    };

    const rankDisplay = {
        [Rank.SEVEN]: '7',
        [Rank.EIGHT]: '8',
        [Rank.NINE]: '9',
        [Rank.TEN]: '10',
        [Rank.JACK]: 'J',
        [Rank.QUEEN]: 'Q',
        [Rank.KING]: 'K',
        [Rank.ACE]: 'A'
    };

    const sizeClasses = {
        small: 'w-12 h-16 text-xs',
        medium: 'w-16 h-24 text-sm',
        large: 'w-20 h-32 text-base'
    };

    const isRed = card.suit === Suit.HEARTS || card.suit === Suit.DIAMONDS;

    if (isHidden) {
        return (
            <div
                className={`${sizeClasses[size]} bg-blue-900 border-2 border-blue-700 rounded-lg flex items-center justify-center cursor-pointer transition-all hover:scale-105 ${className}`}
                onClick={onClick}
            >
                <div className="text-white font-bold">?</div>
            </div>
        );
    }

    return (
        <div
            className={`
        ${sizeClasses[size]} 
        bg-white border-2 rounded-lg flex flex-col items-center justify-between p-1 cursor-pointer transition-all
        ${isPlayable ? 'hover:scale-105 hover:shadow-lg border-green-400' : 'border-gray-300'}
        ${isSelected ? 'ring-2 ring-blue-500 transform scale-105' : ''}
        ${className}
      `}
            onClick={isPlayable ? onClick : undefined}
        >
            <div className={`font-bold ${isRed ? 'text-red-500' : 'text-black'}`}>
                {rankDisplay[card.rank]}
            </div>
            <div className={`text-2xl ${isRed ? 'text-red-500' : 'text-black'}`}>
                {suitSymbols[card.suit]}
            </div>
            <div className={`font-bold ${isRed ? 'text-red-500' : 'text-black'}`}>
                {rankDisplay[card.rank]}
            </div>
        </div>
    );
};

export default Card;

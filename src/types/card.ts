export enum Suit {
    HEARTS = 'hearts',
    SPADES = 'spades',
    DIAMONDS = 'diamonds',
    CLUBS = 'clubs'
}

export enum Rank {
    SEVEN = 7,
    EIGHT = 8,
    NINE = 9,
    TEN = 10,
    JACK = 11,
    QUEEN = 12,
    KING = 13,
    ACE = 14,
}

export interface Card {
    suit: Suit;
    rank: Rank;
    id: string;
}
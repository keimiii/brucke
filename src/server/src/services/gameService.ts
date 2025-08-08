import {v4 as uuidv4} from 'uuid';

export interface Card {
    suit: 'hearts' | 'diamonds' | 'clubs' | 'spades';
    rank: '7' | '8' | '9' | 'J' | 'Q' | 'K' | '10' | 'A';
    value: number;
}

export interface GameState {
    id: string;
    roomId: string;
    players: GamePlayer[];
    currentPlayer: number;
    phase: 'bidding' | 'playing' | 'finished';
    currentTrick: Card[];
    tricks: Card[][];
    scores: { [playerId: string]: number };
    contract?: {
        bidder: string;
        suit: string;
        level: number;
    };
    createdAt: Date;
    lastMove?: Date;
}

export interface GamePlayer {
    id: string;
    username: string;
    hand: Card[];
    position: number;
}

export interface Move {
    type: 'bid' | 'play';
    playerId: string;
    data: any;
}

export class GameService {
    private games: Map<string, GameState> = new Map();
    private gameHistory: Map<string, Move[]> = new Map();

    async startGame(roomId: string, startedBy?: string): Promise<GameState> {
        // In a real implementation, you'd validate the room and players
        const gameId = uuidv4();

        // Create new game

        const game: GameState = {
            id: gameId,
            roomId,
            players: this.createPlayers(), // Mock players for now
            currentPlayer: 0,
            phase: 'bidding',
            currentTrick: [],
            tricks: [],
            scores: {},
            createdAt: new Date(),
        };

        // Deal cards to players
        this.dealCards(game);

        this.games.set(gameId, game);
        this.gameHistory.set(gameId, []);

        return game;
    }

    async getGameState(gameId: string, playerId: string): Promise<GameState | null> {
        const game = this.games.get(gameId);
        if (!game) return null;

        // Return a player-specific view (hide other players' cards)
        return this.getPlayerView(game, playerId);
    }

    async makeMove(gameId: string, playerId: string, move: Move): Promise<GameState> {
        const game = this.games.get(gameId);
        if (!game) {
            throw new Error('Game not found');
        }

        const player = game.players.find(p => p.id === playerId);
        if (!player) {
            throw new Error('Player not in game');
        }

        // Validate it's the player's turn
        if (game.players[game.currentPlayer].id !== playerId) {
            throw new Error('Not your turn');
        }

        // Process the move based on game phase
        if (game.phase === 'bidding') {
            this.processBid(game, move);
        } else if (game.phase === 'playing') {
            this.processCardPlay(game, move);
        }

        // Record the move
        const history = this.gameHistory.get(gameId) || [];
        history.push({ ...move, playerId });
        this.gameHistory.set(gameId, history);

        game.lastMove = new Date();

        return this.getPlayerView(game, playerId);
    }

    async getGameHistory(gameId: string): Promise<Move[]> {
        return this.gameHistory.get(gameId) || [];
    }

    private createPlayers(): GamePlayer[] {
        // Mock implementation - in real app, get from room
        return [
            { id: '1', username: 'Player 1', hand: [], position: 0 },
            { id: '2', username: 'Player 2', hand: [], position: 1 },
            { id: '3', username: 'Player 3', hand: [], position: 2 },
            { id: '4', username: 'Player 4', hand: [], position: 3 },
        ];
    }

    private dealCards(game: GameState): void {
        const deck = this.createDeck();
        this.shuffleDeck(deck);

        // Deal 8 cards to each player (32 card deck for German Bridge)
        game.players.forEach((player, index) => {
            player.hand = deck.slice(index * 8, (index + 1) * 8);
        });
    }

    private createDeck(): Card[] {
        const suits: Card['suit'][] = ['hearts', 'diamonds', 'clubs', 'spades'];
        const ranks: { rank: Card['rank']; value: number }[] = [
            { rank: '7', value: 0 },
            { rank: '8', value: 0 },
            { rank: '9', value: 0 },
            { rank: 'J', value: 2 },
            { rank: 'Q', value: 3 },
            { rank: 'K', value: 4 },
            { rank: '10', value: 10 },
            { rank: 'A', value: 11 }
        ];

        const deck: Card[] = [];
        suits.forEach(suit => {
            ranks.forEach(({ rank, value }) => {
                deck.push({ suit, rank, value });
            });
        });

        return deck;
    }

    private shuffleDeck(deck: Card[]): void {
        for (let i = deck.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [deck[i], deck[j]] = [deck[j], deck[i]];
        }
    }

    private processBid(game: GameState, move: Move): void {
        // Simple bidding logic - implement German Bridge bidding rules
        const { bid } = move.data;

        if (bid === 'pass') {
            // Move to next player
            game.currentPlayer = (game.currentPlayer + 1) % game.players.length;
        } else {
            // Set contract and move to playing phase
            game.contract = bid;
            game.phase = 'playing';
            game.currentPlayer = 0; // Start with first player
        }
    }

    private processCardPlay(game: GameState, move: Move): void {
        const { card } = move.data;
        const player = game.players[game.currentPlayer];

        // Validate card is in player's hand
        const cardIndex = player.hand.findIndex(c =>
            c.suit === card.suit && c.rank === card.rank
        );

        if (cardIndex === -1) {
            throw new Error('Card not in hand');
        }

        // Remove card from hand and add to current trick
        const playedCard = player.hand.splice(cardIndex, 1)[0];
        game.currentTrick.push(playedCard);

        // Check if trick is complete
        if (game.currentTrick.length === 4) {
            // Determine winner and add to tricks
            const winner = this.determineTrickWinner(game.currentTrick, game.contract?.suit);
            game.tricks.push([...game.currentTrick]);
            game.currentTrick = [];
            game.currentPlayer = winner;

            // Check if game is finished
            if (player.hand.length === 0) {
                game.phase = 'finished';
                this.calculateScores(game);
            }
        } else {
            // Next player's turn
            game.currentPlayer = (game.currentPlayer + 1) % game.players.length;
        }
    }

    private determineTrickWinner(trick: Card[], trumpSuit?: string): number {
        // Simple winner determination - implement proper German Bridge rules
        let winnerIndex = 0;
        let winningCard = trick[0];

        for (let i = 1; i < trick.length; i++) {
            if (this.cardBeats(trick[i], winningCard, trumpSuit)) {
                winningCard = trick[i];
                winnerIndex = i;
            }
        }

        return winnerIndex;
    }

    private cardBeats(card1: Card, card2: Card, trumpSuit?: string): boolean {
        // Simplified comparison - implement proper German Bridge card hierarchy
        if (card1.suit === trumpSuit && card2.suit !== trumpSuit) return true;
        if (card2.suit === trumpSuit && card1.suit !== trumpSuit) return false;
        if (card1.suit === card2.suit) {
            return card1.value > card2.value;
        }
        return false; // Different suits, first card wins
    }

    private calculateScores(game: GameState): void {
        // Basic scoring - implement German Bridge scoring rules
        game.players.forEach(player => {
            game.scores[player.id] = 0;
        });

        // Calculate points from tricks
        game.tricks.forEach(trick => {
            const points = trick.reduce((sum, card) => sum + card.value, 0);
            // Award points to trick winner (simplified)
            const winnerId = game.players[0].id; // Placeholder
            game.scores[winnerId] = (game.scores[winnerId] || 0) + points;
        });
    }

    private getPlayerView(game: GameState, playerId: string): GameState {
        // Return game state with hidden information for other players
        return {
            ...game,
            players: game.players.map(player => ({
                ...player,
                hand: player.id === playerId ? player.hand : []
            }))
        };
    }
}

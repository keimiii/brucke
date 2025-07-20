export interface SocketUser {
    id: string;
    username: string;
}

export interface RoomJoinData {
    roomId: string;
    user: SocketUser;
}

export interface GameMoveData {
    gameId: string;
    playerId: string;
    move: {
        type: 'bid' | 'play';
        data: any;
    };
}

export interface ServerToClientEvents {
    'user-joined': (data: { user: SocketUser; room: any }) => void;
    'user-left': (data: { userId: string; room: any }) => void;
    'game-started': (game: any) => void;
    'game-updated': (gameState: any) => void;
    'room-joined': (room: any) => void;
    'error': (data: { message: string }) => void;
}

export interface ClientToServerEvents {
    'join-room': (roomId: string) => void;
    'leave-room': (roomId: string) => void;
    'start-game': (roomId: string) => void;
    'make-move': (data: GameMoveData) => void;
}
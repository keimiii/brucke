import React, { createContext, useContext, ReactNode } from 'react';
// import { GameState } from '../types/game';

interface GameContextType {
    // Add any global game state or actions here
    // For now, we'll keep it simple
}

const GameContext = createContext<GameContextType | undefined>(undefined);

interface GameProviderProps {
    children: ReactNode;
}

export const GameProvider: React.FC<GameProviderProps> = ({ children }) => {
    return (
        <GameContext.Provider value={{}}>
            {children}
        </GameContext.Provider>
    );
};
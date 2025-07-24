import React from "react";
import { useParams } from 'react-router';
import {useNavigate} from "react-router-dom";
import {v4 as uuidv4} from 'uuid';

const SamplePlayers = [
    {
        id: "1",
        name: "Player 1",
        isOnline: true,
        isReady: true,
    },
    {
        id: "2",
        name: "Player 2",
        isOnline: true,
        isReady: true,
    }
]

const RoomLobby: React.FC = () => {
    const { roomId } = useParams();
    const navigate = useNavigate();
    const handleGameStart = async (roomId: string | undefined) => {
        // Call startGame API and navigate to game page
            try {
                const response = await fetch(`/api/games/${roomId}/startGame`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ roomId })
                });

                if (!response.ok) {
                    throw new Error('Start game failed.');
                }

                const gameData = await response.json();
                localStorage.setItem('gameId', JSON.stringify(gameData.id));
                navigate(`/game/${gameData.id}`);
            } catch (error) {
                throw error;
            }
    };

    return (
        <div>
            <h2>Room ID: {roomId}</h2>
            <h4>The game will start once all players indicate they are ready.</h4>
            <h4>Players:</h4>
            <ul>
                { SamplePlayers.map((player) => (
                    <li key={player.id}>
                        {player.name}
                    </li>
                ))}
            </ul>
            <button onClick={() => handleGameStart(roomId)}>Start Game</button>
        </div>
    );
};

export default RoomLobby;

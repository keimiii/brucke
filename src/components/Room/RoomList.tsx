import React from "react";
import { SimpleGrid, Box } from "@chakra-ui/react";
import { useNavigate } from 'react-router-dom';

const SampleRooms = [
    {
        id: "1",
        name: "Room 1",
        players: [
            {
                id: "1",
                name: "Player 1",
                isOnline: true
            },
        ]
    },
    {
        id: "2",
        name: "Room 2",
        players: [
            {
                id: "2",
                name: "Player 2",
                isOnline: true
            },
        ]
    }
]

const RoomList: React.FC = () => {
    const navigate = useNavigate();
    const handleRoomClick = (room: string) => {
        if (room === '') return;
        navigate(`/room/${room}`);
    };

    return (
        <div>
            <h2>Rooms List</h2>
            <h4>Welcome! Pick a room to join, or create a new room.</h4>
            <SimpleGrid columns={[2, null, 3]} gap="40px">
                { SampleRooms.map((room) => (
                    <Box onClick={() => handleRoomClick(room.id)} background="blue" key={room.id}>
                        <h4>{room.name}</h4>
                    </Box>
                ))}
            </SimpleGrid>
        </div>
    );
};

export default RoomList;

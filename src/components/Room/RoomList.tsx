import React from "react";
import { SimpleGrid, Box } from "@chakra-ui/react";
import { useNavigate } from 'react-router-dom';

// TODO get list of rooms from API
const SampleRooms = [
    {
        id: "1",
        name: "Room 1",
    },
    {
        id: "2",
        name: "Room 2",
    }
]

const RoomList: React.FC = () => {
    const navigate = useNavigate();
    const handleRoomClick = (room: string) => {
        if (room === '') return;
        navigate(`/room/${room}`);
    };
    const handleRoomCreate = (roomName: string) => {
        if (roomName === '') return;
        // TODO call createRoom API and navigate to room page
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
                <Box background="red">
                    <input type={'text'} placeholder={'Room Name'} onSubmit={() => handleRoomCreate('')}/>
                </Box>
            </SimpleGrid>
        </div>
    );
};

export default RoomList;

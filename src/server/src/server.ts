import { createServer } from 'http';
import { Server } from 'socket.io';
import app from './app';
import { setupSocketHandlers } from './socket/gameEvents';
import config from './config';

const server = createServer(app);
const io = new Server(server, {
    cors: {
        origin: config.corsOrigin,
        methods: ['GET', 'POST']
    }
});

// Setup socket event handlers
setupSocketHandlers(io);

const PORT = config.port || 3001;

server.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📡 WebSocket server ready`);
    console.log(`🌍 CORS origin: ${config.corsOrigin}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('SIGTERM received. Shutting down gracefully...');
    server.close(() => {
        console.log('Process terminated');
    });
});
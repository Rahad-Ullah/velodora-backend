import { createServer, Server } from 'http';
import mongoose from 'mongoose';
import app from './app';
import { Server as SocketIOServer } from 'socket.io';
import colors from 'colors';
import config from './config';
import { socketHelper } from './helpers/socketHelper';
import { createSuperAdmin } from './DB/seedAdmin';
import { logger } from './shared/logger';

let server: Server;

async function main() {
  try {
    // Connect to MongoDB
    await mongoose.connect(config.database_url as string);
    logger.info(colors.green('🚀 Database connected successfully'));


    // Create a single HTTP server from the Express app
    server = createServer(app);

    // Attach Socket.IO to the same HTTP server
    const io: SocketIOServer = new SocketIOServer(server, {
      cors: {
        origin: '*',
      },
    });

    // Start listening on the same port for both HTTP and WebSocket
    server.listen(Number(config.port), () => {
      console.log(
        colors.green(
          `Server (HTTP + Socket.IO) is running on ${config.ip_address}:${config.port}`,
        ).bold,
      );
    });

    // Call the createSuperAdmin function
    await createSuperAdmin();

    // Initialize your Socket.IO handler
    socketHelper.socket(io);

    // Optionally make the socket server globally accessible
    global.io = io;

  } catch (err) {
    console.error('Error starting the server:', err);
    process.exit(1);
  }
}

main();

// Graceful shutdown for unhandled rejections
process.on('unhandledRejection', (err) => {
  console.error(`Unhandled rejection detected: ${err}`);
  if (server) {
    server.close(() => {
      process.exit(1);
    });
  }
  process.exit(1);
});

// Graceful shutdown for uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error(`Uncaught exception detected: ${err}`);
  if (server) {
    server.close(() => {
      process.exit(1);
    });
  }
});


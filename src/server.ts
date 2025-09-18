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
    await mongoose.connect(config.database_url as string);
    logger.info(colors.green('🚀 Database connected'));

    server = createServer(app);

    const io: SocketIOServer = new SocketIOServer(server, { cors: { origin: '*' } });
    global.io = io;

    await new Promise<void>((resolve) =>
      server.listen(Number(config.port), config.ip_address, resolve)
    );

    logger.info(colors.green(`🚀 Server running on ${config.ip_address}:${config.port}`));

    await createSuperAdmin();
    socketHelper.socket(io);

  } catch (err) {
    logger.error('❌ Startup error:', err);
    await gracefulShutdown(err);
  }
}

async function gracefulShutdown(err?: any) {
  if (err) logger.error('⚠️ Shutting down due to error:', err);

  if (server) {
    server.close(() => logger.info('✅ HTTP server closed'));
  }
  await mongoose.disconnect();
  logger.info('✅ MongoDB disconnected');

  process.exit(err ? 1 : 0);
}

process.on('SIGINT', () => gracefulShutdown());
process.on('SIGTERM', () => gracefulShutdown());
process.on('unhandledRejection', gracefulShutdown);
process.on('uncaughtException', gracefulShutdown);

main();
import colors from 'colors';
import { Server } from 'socket.io';
import { logger } from '../shared/logger';

const socket = (io: Server) => {
  io.on('connection', socket => {
    logger.info(colors.blue('A user connected '+ socket.id));

    //disconnect
    socket.on('disconnect', () => {
      logger.info(colors.red('A user disconnect '+ socket.id));
    });
  });
};

export const socketHelper = { socket };
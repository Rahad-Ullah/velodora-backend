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


// Practice Socket

// import colors from 'colors';
// import { Server } from 'socket.io';
// import { logger } from '../shared/logger';

// const socket = (io: Server) => {
//   io.on('connection', socket => {
//     logger.info(colors.blue('A user connected ' + socket.id));

//     // join group
//     socket.on("joinGroup", (data)=>{
//       console.log("Joined group data", data);
//       console.log("Joined group data", socket.id);
//       socket.join(data.groupName);
//       socket.emit("joinedGroup", `You joined group ${data.groupName}`);
//     })

//     // Listen for a message from this client
//     socket.on("sendMessage", (data) => {
//       console.log({ from: socket.id, to: data.to, text: data.text });

//       // send to that specific client (must be a valid socket.id)

//       io.to(data.groupName).emit("receivedMessage", {
//         group: data.groupName,
//         from: socket.id,
//         text: data.text,
//       });
//     });

//     socket.on('disconnect', () => {
//       logger.info(colors.red('A user disconnected ' + socket.id));
//     });
//   });
// };

// export const socketHelper = { socket };

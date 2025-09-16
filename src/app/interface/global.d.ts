// global.d.ts or types/global.d.ts
 
import { Server } from 'socket.io';
 
declare global {
  var io: Server; // Declare global 'io' as a Socket.IO Server instance
}
 
export {}; // Ensure this is treated as a module
 
 
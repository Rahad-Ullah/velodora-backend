// global.d.ts
import { Server as SocketIOServer } from "socket.io";

declare global {
  // eslint-disable-next-line no-var
  var io: SocketIOServer | undefined;
}
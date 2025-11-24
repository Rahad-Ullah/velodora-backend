"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const http_1 = require("http");
const mongoose_1 = __importDefault(require("mongoose"));
const app_1 = __importDefault(require("./app"));
const socket_io_1 = require("socket.io");
const colors_1 = __importDefault(require("colors"));
const config_1 = __importDefault(require("./config"));
const socketHelper_1 = require("./helpers/socketHelper");
const seedAdmin_1 = require("./DB/seedAdmin");
const logger_1 = require("./shared/logger");
const settings_service_1 = require("./app/modules/settings/settings.service");
const system_service_1 = require("./app/modules/system/system.service");
let server;
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            yield mongoose_1.default.connect(config_1.default.database_url);
            logger_1.logger.info(colors_1.default.green('🚀 Database connected'));
            server = (0, http_1.createServer)(app_1.default);
            const io = new socket_io_1.Server(server, { cors: { origin: '*' } });
            global.io = io;
            yield new Promise((resolve) => server.listen(Number(config_1.default.port), config_1.default.ip_address, resolve));
            logger_1.logger.info(colors_1.default.green(`🚀 Server running on ${config_1.default.ip_address}:${config_1.default.port}`));
            yield (0, seedAdmin_1.createSuperAdmin)();
            yield system_service_1.SystemService.createSystemAutoToDB();
            yield settings_service_1.settingsService.addSettings();
            socketHelper_1.socketHelper.socket(io);
        }
        catch (err) {
            logger_1.logger.error('❌ Startup error:', err);
            yield gracefulShutdown(err);
        }
    });
}
function gracefulShutdown(err) {
    return __awaiter(this, void 0, void 0, function* () {
        if (err)
            logger_1.logger.error('⚠️ Shutting down due to error:', err);
        if (server) {
            server.close(() => logger_1.logger.info('✅ HTTP server closed'));
        }
        yield mongoose_1.default.disconnect();
        logger_1.logger.info('✅ MongoDB disconnected');
        process.exit(err ? 1 : 0);
    });
}
process.on('SIGINT', () => gracefulShutdown());
process.on('SIGTERM', () => gracefulShutdown());
process.on('unhandledRejection', gracefulShutdown);
process.on('uncaughtException', gracefulShutdown);
main();

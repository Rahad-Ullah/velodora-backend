"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.unlinkFiles = exports.unlinkFile = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const unlinkFile = (file) => {
    const filePath = path_1.default.join('uploads', file);
    if (fs_1.default.existsSync(filePath)) {
        fs_1.default.unlinkSync(filePath);
    }
};
exports.unlinkFile = unlinkFile;
const unlinkFiles = (files) => {
    files.forEach((file) => {
        const filePath = path_1.default.join('uploads', file);
        if (fs_1.default.existsSync(filePath)) {
            fs_1.default.unlinkSync(filePath);
        }
    });
};
exports.unlinkFiles = unlinkFiles;

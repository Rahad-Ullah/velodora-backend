"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const http_status_codes_1 = require("http-status-codes");
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const ApiError_1 = __importDefault(require("../../errors/ApiError"));
const fileUploadHandler = () => {
    //create upload folder
    const baseUploadDir = path_1.default.join(process.cwd(), 'uploads');
    if (!fs_1.default.existsSync(baseUploadDir)) {
        fs_1.default.mkdirSync(baseUploadDir);
    }
    //folder create for different file
    const createDir = (dirPath) => {
        if (!fs_1.default.existsSync(dirPath)) {
            fs_1.default.mkdirSync(dirPath);
        }
    };
    //create filename
    const storage = multer_1.default.diskStorage({
        destination: (req, file, cb) => {
            let uploadDir;
            switch (file.fieldname) {
                case 'image':
                    uploadDir = path_1.default.join(baseUploadDir, 'image');
                    break;
                case 'icon':
                    uploadDir = path_1.default.join(baseUploadDir, 'icon');
                    break;
                case 'serviceImages':
                    uploadDir = path_1.default.join(baseUploadDir, 'serviceImages');
                    break;
                case 'media':
                    uploadDir = path_1.default.join(baseUploadDir, 'media');
                    break;
                case 'doc':
                    uploadDir = path_1.default.join(baseUploadDir, 'doc');
                    break;
                default:
                    throw new ApiError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, 'File is not supported');
            }
            createDir(uploadDir);
            cb(null, uploadDir);
        },
        filename: (req, file, cb) => {
            const fileExt = path_1.default.extname(file.originalname);
            const fileName = file.originalname
                .replace(fileExt, '')
                .toLowerCase()
                .split(' ')
                .join('-') +
                '-' +
                Date.now();
            cb(null, fileName + fileExt);
        },
    });
    //file filter
    const fileFilter = (req, file, cb) => {
        if (file.fieldname === 'image' || file.fieldname === 'icon' || file.fieldname === 'serviceImages') {
            if (file.mimetype === 'image/jpeg' ||
                file.mimetype === 'image/png' ||
                file.mimetype === 'image/jpg') {
                cb(null, true);
            }
            else {
                cb(new ApiError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, 'Only .jpeg, .png, .jpg file supported'));
            }
        }
        else if (file.fieldname === 'media') {
            if (file.mimetype === 'video/mp4' || file.mimetype === 'audio/mpeg') {
                cb(null, true);
            }
            else {
                cb(new ApiError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, 'Only .mp4, .mp3, file supported'));
            }
        }
        else if (file.fieldname === 'doc') {
            if (file.mimetype === 'application/pdf') {
                cb(null, true);
            }
            else {
                cb(new ApiError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, 'Only pdf supported'));
            }
        }
        else {
            cb(new ApiError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, 'This file is not supported'));
        }
    };
    const upload = (0, multer_1.default)({
        storage: storage,
        fileFilter: fileFilter,
    }).fields([
        { name: 'image', maxCount: 1 },
        { name: 'serviceImages', maxCount: 4 },
        { name: 'icon', maxCount: 1 },
        { name: 'media', maxCount: 3 },
        { name: 'doc', maxCount: 3 },
    ]);
    return upload;
};
exports.default = fileUploadHandler;

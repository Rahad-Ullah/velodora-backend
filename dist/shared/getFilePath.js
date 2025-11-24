"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMultipleFilesPath = exports.getSingleFilePath = void 0;
//single file
const getSingleFilePath = (files, folderName) => {
    const fileField = files && files[folderName];
    if (fileField && Array.isArray(fileField) && fileField.length > 0) {
        return `/${folderName}/${fileField[0].filename}`;
    }
    return undefined;
};
exports.getSingleFilePath = getSingleFilePath;
//multiple files
const getMultipleFilesPath = (files, folderName) => {
    const folderFiles = files && files[folderName];
    if (folderFiles) {
        if (Array.isArray(folderFiles)) {
            return folderFiles.map((file) => `/${folderName}/${file.filename}`);
        }
    }
    return undefined;
};
exports.getMultipleFilesPath = getMultipleFilesPath;

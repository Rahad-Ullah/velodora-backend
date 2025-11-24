"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const handleValidationError = (error) => {
    const errorMessages = Object.values(error.errors).map((el) => {
        return {
            path: el.path,
            message: el.message,
        };
    });
    const statusCode = 400;
    return {
        statusCode,
        message: 'Validation Error',
        errorMessages,
    };
};
exports.default = handleValidationError;

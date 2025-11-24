"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const cors_1 = __importDefault(require("cors"));
const express_1 = __importDefault(require("express"));
const http_status_codes_1 = require("http-status-codes");
const globalErrorHandler_1 = __importDefault(require("./app/middlewares/globalErrorHandler"));
const routes_1 = __importDefault(require("./routes"));
const morgen_1 = require("./shared/morgen");
const app = (0, express_1.default)();
require("./util/cleanupDaily");
const stripePaymentWebhook_1 = __importDefault(require("./webhook/stripePaymentWebhook"));
const stripeConnectedAccountWebhook_1 = __importDefault(require("./webhook/stripeConnectedAccountWebhook"));
app.post('/api/v1/stripe/webhook/make-payment', express_1.default.raw({ type: 'application/json' }), stripePaymentWebhook_1.default);
app.post('/api/v1/stripe/webhook/connected-account', express_1.default.raw({ type: 'application/json' }), stripeConnectedAccountWebhook_1.default);
//morgan
app.use(morgen_1.Morgan.successHandler);
app.use(morgen_1.Morgan.errorHandler);
//body parser
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
//file retrieve
app.use(express_1.default.static('uploads'));
//router
app.use('/api/v1', routes_1.default);
//live response
app.get('/', (req, res) => {
    const date = new Date(Date.now());
    res.send(`
    <div style="width: 100%; height: 80vh; display: flex; flex-direction: column; align-items: center; justify-content: center;">
      <h1 style=" color:#173616;">The server is alive</h1>
      <p style="color:#173616;">${date}</p>
    </div>
    `);
});
//global error handle
app.use(globalErrorHandler_1.default);
//handle not found route;
app.use((req, res) => {
    res.status(http_status_codes_1.StatusCodes.NOT_FOUND).json({
        success: false,
        message: 'Not found',
        errorMessages: [
            {
                path: req.originalUrl,
                message: "API DOESN'T EXIST",
            },
        ],
    });
});
exports.default = app;

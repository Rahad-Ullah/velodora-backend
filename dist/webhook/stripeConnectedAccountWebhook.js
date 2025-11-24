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
const stripe_config_1 = __importDefault(require("../app/config/stripe.config"));
const config_1 = __importDefault(require("../config"));
const handleStripeConnectedAccount_1 = require("../handlers/handleStripeConnectedAccount");
const stripeConnectedAccountWebhook = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    console.log("Stripe connected account webhook called ------------------------------------------------ It's working");
    const payload = req.body;
    const signature = req.headers['stripe-signature'];
    if (!payload) {
        return res.status(400).json({ error: 'Missing connected account payload' });
    }
    if (!signature) {
        return res.status(400).json({ error: 'Missing connected account stripe signature header' });
    }
    try {
        const event = stripe_config_1.default.webhooks.constructEvent(payload, signature, config_1.default.stripe.webhook_secret_withdraw);
        const eventType = event.type;
        switch (eventType) {
            case 'account.updated':
                const updatedAccount = event.data.object;
                yield (0, handleStripeConnectedAccount_1.handleStripeConnectedAccount)(updatedAccount);
                break;
            default:
                console.log(`⚠️ Unhandled event type: ${event.type}`);
        }
        return res.status(200).json({ received: true });
    }
    catch (error) {
        console.error('Webhook error:', error);
        return res.status(400).json({ error: `Webhook error: ${error.message}` });
    }
});
exports.default = stripeConnectedAccountWebhook;

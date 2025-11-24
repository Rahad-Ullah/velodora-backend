"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
dotenv_1.default.config({ path: path_1.default.join(process.cwd(), '.env') });
exports.default = {
    node_env: process.env.NODE_ENV,
    database_url: process.env.DATABASE_URL,
    ip_address: process.env.IP_ADDRESS,
    port: process.env.PORT,
    frontend_url: process.env.FRONTEND_URL,
    bcrypt_salt_rounds: process.env.BCRYPT_SALT_ROUNDS,
    jwt: {
        jwt_secret: process.env.JWT_SECRET,
        jwt_expire_in: process.env.JWT_EXPIRE_IN,
        jwt_refresh_secret: process.env.JWT_REFRESH_SECRET,
        jwt_refresh_expire_in: process.env.JWT_REFRESH_EXPIRE_IN,
    },
    email: {
        from: process.env.EMAIL_FROM,
        port: process.env.EMAIL_PORT,
        host: process.env.EMAIL_HOST,
        pass: process.env.EMAIL_PASS,
    },
    super_admin: {
        email: process.env.SUPER_ADMIN_EMAIL,
        email_second: process.env.SUPER_ADMIN_EMAIL_SECOND,
        password: process.env.SUPER_ADMIN_PASSWORD,
    },
    stripe: {
        secret_key: process.env.STRIPE_SECRET_KEY,
        public_key: process.env.STRIPE_PUBLIC_KEY,
        webhook_secret_payment: process.env.STRIPE_WEBHOOK_SECRET_PAYMENT,
        webhook_secret_withdraw: process.env.STRIPE_WEBHOOK_SECRET_WITHDRAW,
    },
};

import dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.join(process.cwd(), '.env') });

export default {
  node_env: process.env.NODE_ENV,
  database_url: process.env.DATABASE_URL,
  ip_address: process.env.IP_ADDRESS,
  port: process.env.PORT,
  download_path: process.env.DOWNLOAD_PATH,
  frontend_url: process.env.FRONTEND_URL,
  bcrypt_salt_rounds: process.env.BCRYPT_SALT_ROUNDS,
  jwt: {
    jwt_secret: process.env.JWT_SECRET,
    jwt_expire_in: process.env.JWT_EXPIRE_IN,
    jwt_refresh_secret: process.env.JWT_REFRESH_SECRET,
    jwt_refresh_expire_in: process.env.JWT_REFRESH_EXPIRE_IN,
  },
  super_admin: {
    email: process.env.SUPER_ADMIN_EMAIL,
    email_second: process.env.SUPER_ADMIN_EMAIL_SECOND,
    password: process.env.SUPER_ADMIN_PASSWORD,
  },
  email: {
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
    from: process.env.EMAIL_FROM,
  },
  stripe: {
    public_key: process.env.STRIPE_PUBLIC_KEY,
    secret_key: process.env.STRIPE_SECRET_KEY,
    webhook_secret_payment: process.env.STRIPE_WEBHOOK_SECRET_PAYMENT,
    webhook_secret_withdraw: process.env.STRIPE_WEBHOOK_SECRET_WITHDRAW,
  },
  google: {
    package_name: process.env.GOOGLE_PACKAGE_NAME,
    client_id_web: process.env.GOOGLE_CLIENT_ID_WEB,
  },
  apple: {
    client_id_user: process.env.APPLE_CLIENT_ID_USER,
    client_id_provider: process.env.APPLE_CLIENT_ID_PROVIDER,
  },
};

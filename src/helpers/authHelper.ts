import { OAuth2Client } from 'google-auth-library';
import config from '../config';
import jwt from 'jsonwebtoken';
import jwksClient from 'jwks-rsa';

const googleClient = new OAuth2Client();

// --------------- google token verification ---------------
export async function verifyGoogleToken(idToken: string) {
  const ticket = await googleClient.verifyIdToken({
    idToken,
    audience: config.google.client_id_web as string,
    // audience: [
    //   config.google.client_id_ios as string,
    //   config.google.client_id_android as string,
    //   config.google.client_id_web as string,
    // ],
  });

  const payload = ticket.getPayload();
  if (!payload) throw new Error('Invalid Google token');

  return {
    providerUserId: payload.sub,
    email: payload.email,
    emailVerified: payload.email_verified,
    name: payload.name,
    image: payload.picture,
  };
}

// --------------- apple token verification ---------------
const appleClient = jwksClient({
  jwksUri: 'https://appleid.apple.com/auth/keys',
});

function getAppleKey(header: any, callback: any) {
  appleClient.getSigningKey(header.kid, function (err, key) {
    const signingKey = key?.getPublicKey();
    callback(null, signingKey);
  });
}

export async function verifyAppleToken(identityToken: string) {
  return new Promise<{
    providerUserId: string;
    email?: string;
    emailVerified: boolean;
  }>((resolve, reject) => {
    jwt.verify(
      identityToken,
      getAppleKey,
      {
        audience: config.apple.client_id,
        issuer: 'https://appleid.apple.com',
      },
      (err, decoded: any) => {
        if (err) return reject(err);

        resolve({
          providerUserId: decoded.sub,
          email: decoded.email,
          emailVerified: String(decoded.email_verified) === 'true',
        });
      }
    );
  });
}

export const AuthHelper = {
  verifyGoogleToken,
  verifyAppleToken,
};

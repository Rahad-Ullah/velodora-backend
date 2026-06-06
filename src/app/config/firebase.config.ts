import admin from 'firebase-admin';
import path from 'path';

const rootDir = process.cwd();
const serviceAccountPath = path.join(rootDir, 'firebase-service-account.json');

const serviceAccount = require(serviceAccountPath);

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
  });
}

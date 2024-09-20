import * as admin from 'firebase-admin';
import { env } from 'process';

if (!admin.apps.length) {
    const serviceAccount = JSON.parse(env.FIREBASE_ADMIN_SDK_KEY as string);
    
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
    });
}

export { admin };

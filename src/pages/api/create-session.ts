import { NextApiRequest, NextApiResponse } from 'next';
import { admin } from '../../lib/firebase-admin';

export default async function handlerCreateSession(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).end();
    }

    const { idToken } = req.body;
    const expiresIn = 2 * 60 * 60 * 1000; // 2 horas

    try {
        const sessionCookie = await admin.auth().createSessionCookie(idToken, { expiresIn });
        res.status(200).json({ sessionToken: sessionCookie });
    } catch (error) {
        console.log('erro', error)
        res.status(401).send('Unauthorized request');
    }
}

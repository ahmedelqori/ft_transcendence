// import crypto from 'crypto';
import speakeasy from 'speakeasy';
import db from '../models.js';
import QRCode from 'qrcode';

export default async function enable(req, res) {
    if (req.user.two_FA){
        res.status(400).send({ message: '2FA is already enabled' });
        return;
    }
    const secret = speakeasy.generateSecret({
        name: `pong ${req.user.username}`,
        issuer: 'pong'
    });
    try {
        await db.query().insert({
            user_id: req.user.id,
            secret: secret.base32
        });
    } catch (err) {
        console.error('Database insertion error:', err);
        res.status(500).send({ message: 'Internal Server Error' });
        return;
    }

    try {
        res.send({
            secret: secret.base32,
            qr: await QRCode.toDataURL(secret.otpauth_url)
        });
    } catch (err) {
        console.error('QR code generation error:', err);
        res.status(500).send({ message: 'Internal Server Error' });
    }
}
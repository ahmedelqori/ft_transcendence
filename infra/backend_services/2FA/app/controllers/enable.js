import speakeasy from 'speakeasy';
import db from '../models.js';
import QRCode from 'qrcode';
import base32Decode from 'base32-decode';

export default async function enable(req, res) {
    if (req.user.two_FA){
        res.status(400).send({ message: '2FA is already enabled' });
        return;
    }

    const rec = await db.query().findOne({ user_id: req.user.id });
    if (rec) {

        const secret = Buffer.from(base32Decode(rec.secret, 'RFC4648')).toString('utf-8');
        res
            .status(200)
            .send({
                secret: rec.secret,
                qr: await QRCode.toDataURL(
                    speakeasy.otpauthURL({
                        secret,
                        label: `pong ${req.user.username}`,
                        issuer: 'pong'
                    })
                )
            });
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
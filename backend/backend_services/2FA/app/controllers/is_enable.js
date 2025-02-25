import db from '../models.js'
import qrcode from 'qrcode'
import speakeazy from 'speakeasy'


export default async function is_enable(req, res) {
    if (!req.user.two_FA) {
        res.status(200).send({ two_fa: false });
    }else {
        const secret = await db.query().findById(req.user.id).first();
        const totp_url = speakeazy.otpauthURL({
            secret: secret.secret,
            label: req.user.username,
            issuer: 'pong',
            encoding: 'base32'
        });
        res.status(200).send({
            two_fa: true,
            secret: secret.secret,
            qr: await qrcode.toDataURL(totp_url)
        });
    }
}
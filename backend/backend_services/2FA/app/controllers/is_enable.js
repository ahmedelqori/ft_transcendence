



export default async function is_enable(req, res) {
    if (!req.user.two_FA) {
        res.status(200).send({ two_fa: false });
    }else {
        res.status(200).send({ two_fa: true });
    }
}
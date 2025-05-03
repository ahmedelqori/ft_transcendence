import notif from '../utils/send_notif.js';


export default async function fileValidation (req, reply) {
    const data = await req.file();
    if (!data) {
        notif(req, 'error', 'No file uploaded');
        return reply.status(400).send({ 'error': 'No file uploaded' });
    }
    const allowedMimeTypes = [
        'image/jpeg',
        'image/png',
        'image/gif',
        'image/webp'
    ];
    if (!allowedMimeTypes.includes(data.mimetype)) {
        notif(req, 'error', 'Invalid file type');
        return reply.status(400).send({ 'error': 'Invalid file type' });
    }
    const maxSize = 1024 * 1024 * (10); // 10MB
    if (data.file.byteCount > maxSize) {
        notif(req, 'error', 'File size too large');
        return reply.status(400).send({ 'error': 'File size too large' });
    }
    req.fileData = data;
}



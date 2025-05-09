

export default async function fileValidation (req, reply) {
    const data = await req.file();
    if (!data) {
        return reply.status(400).send({ 'error': 'No file uploaded' });
    }
    const allowedMimeTypes = [
        'image/jpeg',
        'image/png',
        'image/webp'
    ];
    if (!allowedMimeTypes.includes(data.mimetype)) {
        return reply.status(400).send({ 'error': 'Invalid file type' });
    }
    const maxSize = 1024 * 1024 * 1; // 1MB
    if (data.file.byteCount > maxSize) {
        return reply.status(400).send({ 'error': 'File size too large' });
    }
    req.fileData = data;
}



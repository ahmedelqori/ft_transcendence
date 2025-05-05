import fs from 'fs/promises';
import path from 'path';
import notif from '../utils/send_notif.js';
import sharp from 'sharp';


export default async function avatar(req, reply){
  const EXTENTIONS = {
    'image/jpeg': '.jpg',
    'image/png': '.png',
    'image/webp': '.webp',
  };
  
  try {
    if (!req.fileData || !req.user) {
      return reply.status(400).send({ error: 'Invalid request data' });
    }

    const fileBuffer = await req.fileData.toBuffer();
    const extension = EXTENTIONS[req.fileData.mimetype];
    if (!extension) {
      notif(req, 'error', 'Unsupported file type');
      return reply.status(400).send({ error: 'Unsupported file type' });
    }

    const filename = `${req.user.username}.webp`;
    const filePath = path.join(process.env.PROFILE_IMAGE_PATH, filename);

    const webpBuffer = await sharp(fileBuffer)
      .webp({ quality: 80 })
      .toBuffer();

    await fs.writeFile(filePath, webpBuffer);

    const avatar_url = `${process.env.DOMAIN}/static/${filename}`;

    reply
      .header('Location', avatar_url)
      .status(200)
      .send({ avatar_url });
  } catch (err) {
    console.log(`Error processing avatar: ${err.message}`);
    reply.status(500).send({ error: 'Internal server error' });
  }
};
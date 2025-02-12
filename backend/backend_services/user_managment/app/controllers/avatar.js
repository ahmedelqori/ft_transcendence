import fs from 'fs';
import path from 'path';
import Player from '../models.js';

const remove_old_avatar = async (avatar_url) => {
  const filename = avatar_url.split('/').pop();
  const filePath = path.join(process.env.PROFILE_IMAGE_PATH, filename);
  try {
    await fs.promises.unlink(filePath);
  } catch (err) {
    console.log(`Error removing old avatar: ${err.message}`);
  }
};

const avatar = async (req, reply) => {
  try {
    if (!req.fileData || !req.user) {
      return reply.status(400).send({ error: 'Invalid request data' });
    }

    const extensions = {
      'image/jpeg': '.jpg',
      'image/png': '.png',
      'image/gif': '.gif',
      'image/webp': '.webp',
    };

    const fileBuffer = await req.fileData.toBuffer();
    const extension = extensions[req.fileData.mimetype];
    if (!extension) {
      return reply.status(400).send({ error: 'Unsupported file type' });
    }

    const filename = `${req.user.username}${extension}`;
    const filePath = path.join(process.env.PROFILE_IMAGE_PATH, filename);

    await remove_old_avatar(req.user.avatar_url);
    await fs.promises.writeFile(filePath, fileBuffer);

    const avatar_url = `${process.env.DOMAIN}/${process.env.PROFILE_IMAGE_PATH}${filename}`;

    await Player.query().findById(req.user.id).patch({ avatar_url });

    reply
      .header('Location', avatar_url)
      .status(200)
      .send({ avatar_url });
  } catch (err) {
    console.log(`Error processing avatar: ${err.message}`);
    reply.status(500).send({ error: 'Internal server error' });
  }
};

export default avatar;
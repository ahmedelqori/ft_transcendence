import axios from 'axios';

export default async (req, level, message) => {
  const levels = ['info', 'warning', 'error'];

  if (!levels.includes(level)) {
    throw new Error(`Invalid level, choose one of ${levels}`);
  }

  const token = req.headers.authorization;
  if (!token) {
    throw new Error('No token provided');
  }

  try {
    const res = await axios.post(process.env.NOTIFICATION_URL, {
      level,
      message
    }, {
      headers: {
        Authorization: token
      }
    });
  } catch (err) {
    console.error(`Error sending notification: ${err.message}`);
  }
};
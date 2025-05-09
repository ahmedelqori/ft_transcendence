import axios from 'axios';


export default async (req, to, type, payload) => {

  const token = req.headers.authorization;
  if (!token) {
    throw new Error('No token provided');
  }

  try {
    await axios.post(process.env.NOTIFICATION_URL, {
        to,
        type,
        payload
    }, {
      headers: {
        Authorization: token
      }
    });
  } catch (err) {
    console.error(`Error sending notification: ${err.message}`);
  }
};
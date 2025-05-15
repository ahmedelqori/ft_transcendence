// ws-auth-middleware.js
import axios from 'axios';
import { Agent } from 'https';

export default async function wsAuth(req, reply) {
  const token = req.query.token;
  
  if (!token) {
    return reply.code(401).send({ message: 'Token missing in URL' });
  }
  try {
    const response = await axios.get('https://64.23.191.17/api/account/whoami/', {
      headers: { 
        Authorization: `Bearer ${token}` 
      },
      httpsAgent: new Agent({ 
        rejectUnauthorized: false // Dev only - remove in production
      })
    });

    if (response.status !== 200) {
        console.log('2  Auth error:',err);
      return reply.code(401).send({ message: 'Invalid token' });
    }

    // 3. Attach user data to request
    req.user = response.data;
    
  } catch (err) {
    console.log('Auth error:',err);
    return reply.code(401).send({ message: 'Token verification failed' });
  }
}
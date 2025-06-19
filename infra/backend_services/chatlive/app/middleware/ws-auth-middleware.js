import axios from 'axios';
import { Agent } from 'https';

// export default async function wsAuth(req, reply) {
//   const token = req.query.token;
//   if (!token) {
//     return reply.code(401).send({ message: 'Token missing in URL' });
//   }
//   try {
    
//     const response = await axios.get(`${process.env.WHOAMI_URL}`, {
//       headers: { 
//         Authorization: `Bearer ${token}` 
//       }
//     });

//     if (response.status !== 200) {
//         // console.log('2  Auth error:',err);
//       return reply.code(401).send({ message: 'Invalid token' });
//     }

//     // 3. Attach user data to request
//     req.user = response.data;
    
//   } catch (err) {
//     // console.log('Auth error:',err);
//     return reply.code(401).send({ message: 'Token verification failed' });
//   }
// }

export async function wsAuth(req, reply) {
  let token;

  if (req.query && req.query.token) {
    token = "Bearer " + req.query.token;
    console.log(`Token extracted from query parameter ${token}`);
  } else if (req.headers && req.headers.authorization) {
    token = req.headers.authorization;
    console.log(`Token extracted from Authorization header ${token}`);
  } else {
    console.log("No token provided in request");
    return reply.code(401).send({ message: "Authentication required" });
  }

  try {
    console.log(`Validating token with auth service`);
    const response = await axios.get(`${process.env.WHOAMI_URL}`, {
      headers: { 
        Authorization: `${token}` 
      }
    });
    if (response.status !== 200) {
      console.log("Invalid authentication");
      return reply.code(401).send({ message: "Invalid authentication" });
    }

    req.user = response.data;
    console.log(`Successfully authenticated user with ID: ${req.user.id}`);
  } catch (err) {
    console.log(`Authentication failed: ${err.message}`);
    return reply.code(401).send({ message: "Authentication failed" });
  }
}

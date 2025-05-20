import axios from 'axios';
import https from 'https';
import dotenv from 'dotenv';
dotenv.config({ path: '/.temp.env' });


const config = {
    // process.env.VAULT_ADDR || 
  vaultAddr: process.env.VAULT_ADDR || "https://localhost:8200/",
  wrapToken: process.env.WRAPPED_TOKEN_TOURNAMENT  || '',
  roleId: process.env.ROLE_ID  || '',
  port: 3000
};

const vaultAgent = new https.Agent({
  rejectUnauthorized: false // This is the key line
});

class VaultService {
  constructor({ vaultAddr }) {
    this.client = axios.create({
      baseURL: vaultAddr,
      httpsAgent: vaultAgent,
      timeout: 5000
    });
  }

  async unwrapToken(wrapToken) {
    try {
      const { data } = await this.client.post('/v1/sys/wrapping/unwrap', null, {
        headers: { 'X-Vault-Token': wrapToken }
      });
      return data.data.secret_id;
    } catch (error) {
      throw new Error(`Unwrap failed: ${error.response?.data?.errors || error.message}`);
    }
  }

  async login(roleId, secretId) {
    try {
      const { data } = await this.client.post('/v1/auth/approle/login', {
        role_id: roleId,
        secret_id: secretId
      });
      console.log('Login successful');
      return data.auth.client_token;
    } catch (error) {
      throw new Error(`Login failed: ${error.response?.data?.errors || error.message}`);
    }
  }

async readSecret(token, path) {
  try {
    const { data } = await this.client.get(`/v1/${path}`, {
      headers: { 'X-Vault-Token': token }
    });
    if (!data.data) {
      throw new Error(`Secret exists but contains no data at path: ${path}`);
    }
    return data.data;
  } catch (error) {
    if (error.response) {
      if (error.response.status === 404) {
        throw new Error(`Secret not found at path: ${path}`);
      }
      if (error.response.status === 403) {
        throw new Error(`Permission denied for path: ${path}`);
      }
    }
    throw new Error(`Failed to read secret: ${error.response?.data?.errors || error.message}`);
  }
}

}

async function getData(vault,path,field,token) {
    let data = '';
    try {
        const secret = await vault.readSecret(token, path);
        data = secret[field];
    }catch (error) {
        console.error('Error:', error.message);
    }
    
    return data;
} 

export async function loadSecret()
{
    const vault = new VaultService({ vaultAddr: config.vaultAddr });
    let secret = '';
    try {
        const secretId = await vault.unwrapToken(config.wrapToken);
        console.log('Unwrapped secretId done!');
        const token = await vault.login(config.roleId, secretId);
        secret = await getData(vault,'secret/data/jwt/public','jwt_public_key',token);
    }catch (error) {
        console.error('Error:', error.message);
    }

    return secret;
}
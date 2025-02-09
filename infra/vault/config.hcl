listener "tcp" {
    address = "0.0.0.0:8200"
    tls_disable = true # ? why its local demo setting 
    /*
        mkdir -p /etc/vault/tls
        openssl req -new -x509 -days 365 -keyout /etc/vault/tls/vault.key -out /etc/vault/tls/vault.crt -subj "/CN=vault.local"
        it must be like that :
            address = "0.0.0.0:8200"
            tls_cert_file = "/etc/vault/tls/vault.crt"
            tls_key_file = "/etc/vault/tls/vault.key"
        To verify that Vault is using HTTPS, you can use curl to access the Vault API:
            curl -kv https://vault.local:8200/v1/sys/health
        example of storing data in vault secrets
             - vault kv put secret/docker DB_USER="admin" DB_PASSWORD="supersecret" API_KEY="your-api-key"
             -  vault kv put secret/jwt_signing_key JWT_SECRET="your-secret-key"
        for backend must be access to my vault server !!
    
    */


}
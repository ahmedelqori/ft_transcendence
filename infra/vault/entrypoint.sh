#!/bin/sh
set -e

echo "__________________Starting Vault server__________________"
vault server -config=/vault/config/config.hcl > /vault/logs/vault.log 2>&1 &
VAULT_PID=$!


echo "__________________Waiting for Vault server to start__________________"

while ! curl -s -o /dev/null --cacert $VAULT_CACERT $VAULT_ADDR/v1/sys/health;
do
    sleep 1
done

if [ -f /vault/data/init.txt ]; then
        echo "Found old /vault/data/init.txt. Removing it..."
        rm -f /vault/data/init.txt
fi

echo "__________________Checking if Vault is already initialized__________________"
if ! vault status -format=json | grep -q '"initialized": true'; then
    echo "__________________Initializing Vault...__________________"
    vault operator init > /vault/data/init.txt
    #dont forget to get tokens and delete this file !!!
else
    echo "__________________Vault is already initialized.__________________"
fi

if [ -f /vault/data/init.txt ]; then
    echo "__________________Unsealing Vault...__________________"
    # Extracing keys 
    UNSEAL_KEYS=$(grep "Unseal Key" /vault/data/init.txt | awk '{print $4}' | head -n 3)
    for KEY in $UNSEAL_KEYS; do
        vault operator unseal "$KEY" >/dev/null
    done
    #login for create policy and role
    ROOT_TOKEN=$(grep "Initial Root Token" /vault/data/init.txt |  awk '{print $4}')
    vault login $ROOT_TOKEN

     if ! vault auth list | grep -q "approle/"; then
        echo "__________________Enabling AppRole auth method...__________________"
        vault auth enable approle >/dev/null
    else
        echo "__________________AppRole auth method is already enabled.__________________"
    fi

    for path in "secret/data/oauth" "secret/data/jwt"; do
        if ! vault secrets list | grep -q "$path"; then
            vault secrets enable -path="$path" kv >/dev/null
        fi
    done

    #write a new policy
    vault policy write policy /vault/config/policy.hcl
    #create role for this policy (with bound_cidr_list)
    vault write auth/approle/role/backend token_policies="policy" token_ttl=1h token_max_ttl=48h secret_id_ttl="10m" secret_id_num_uses=1 # Short-lived SecretID

    #store kv
    vault kv put secret/data/oauth/google SOCIAL_AUTH_GOOGLE_OAUTH2_KEY='499739725290-got362gnd4n9n7t6ook75kdve4stabu5.apps.googleusercontent.com' SOCIAL_AUTH_GOOGLE_OAUTH2_SECRET='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'
	vault kv put secret/data/oauth/42 SOCIAL_AUTH_42_OAUTH2_KEY='u-s4t2ud-781bcdee833b67dcbf0e446f5aa49447e19d1d252fdbb50fe06b618d4da10198' SOCIAL_AUTH_42_OAUTH2_SECRET='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'
    vault kv put secret/data/oauth/S2S  ORIGIN='f4371N6916c83e817f5cA4681e84820Z95c'

    # generaten jwt pulic and private key
    openssl genrsa -out /tmp/private.pem 4096 && openssl rsa -in /tmp/private.pem -pubout -out /tmp/public.pem

    vault kv put secret/data/jwt/private jwt_private_key=@/tmp/private.pem
    vault kv put secret/data/jwt/public jwt_public_key=@/tmp/public.pem

    # delete the keys 
    shred -u /tmp/private.pem /tmp/public.pem 
    
    # create a secret id and wrap it in a temporary token
    # add wrap token in the env
    WRAPPED_TOKEN_2FA=$(vault write -f -wrap-ttl=1000m -format=json auth/approle/role/backend/secret-id | grep -o '"token": *"[^"]*"' | awk -F'"' '{print $4}')
    WRAPPED_TOKEN_USER_MANAGEMENT=$(vault write -f -wrap-ttl=1000m -format=json auth/approle/role/backend/secret-id | grep -o '"token": *"[^"]*"' | awk -F'"' '{print $4}')
    WRAPPED_TOKEN_TOURNAMENT=$(vault write -f -wrap-ttl=1000m -format=json auth/approle/role/backend/secret-id | grep -o '"token": *"[^"]*"' | awk -F'"' '{print $4}')
    ROLE_ID=$(vault read -format=json auth/approle/role/backend/role-id | grep -o '"role_id": *"[^"]*"' | awk -F'"' '{print $4}')

    printf "WRAPPED_TOKEN_2FA=\"%s\"\n" "$WRAPPED_TOKEN_2FA" > /home/vault/.temp.env
    printf "WRAPPED_TOKEN_USER_MANAGEMENT=\"%s\"\n" "$WRAPPED_TOKEN_USER_MANAGEMENT" >> /home/vault/.temp.env
    printf "WRAPPED_TOKEN_TOURNAMENT=\"%s\"\n" "$WRAPPED_TOKEN_TOURNAMENT" >> /home/vault/.temp.env
    printf "\nROLE_ID=\"%s\"\n" "$ROLE_ID" >> /home/vault/.temp.env


    SECRET_ID=$(vault write -f -format=json auth/approle/role/backend/secret-id | grep -o '"secret_id": *"[^"]*"' | awk -F'"' '{print $4}')
    printf "\nSECRET_ID=\"%s\"\n" "$SECRET_ID" >> /home/vault/.temp.env

    #cleanup
    vault token revoke "$ROOT_TOKEN"
    unset ROOT_TOKEN
    unset WRAPPED_TOKEN_2FA
    unset WRAPPED_TOKEN_USER_MANAGEMENT
    unset WRAPPED_TOKEN_TOURNAMENT
else
    echo "__________________Error: init.txt not found.__________________"
    exit 1
fi


echo "__________________Vault setup complete. Running Vault server in the foreground...__________________"

wait $VAULT_PID
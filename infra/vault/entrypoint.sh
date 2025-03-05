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
        vault operator unseal "$KEY"
    done
    #login for create policy and role
    ROOT_TOKEN=$(grep "Initial Root Token" /vault/data/init.txt |  awk '{print $4}')
    vault login $ROOT_TOKEN
    # enable approle auth
    vault auth enable approle

    #setup a secrets engine
    vault secrets enable -path=secret/sqlite kv

    #store kv
    vault kv put secret/sqlite/webapp db-name="test" username="test" password="test"

    #write a new policy
    vault policy write backend-policy /vault/config/backend-policy.hcl

    #create role for this policy (need to add  bound_cidr_list)
    vault write auth/approle/role/backend token_policies="backend-policy" token_ttl=1h token_max_ttl=4h

    #create a secret id and wrap it in a temporary token 
    vault write -f -wrap-ttl=60s auth/approle/role/backend/secret-id


    #NEED TO CHECK IF ITS SAVED IN ENV VARTIABLE OR NOT !!!
else
    echo "__________________Error: init.txt not found.__________________"
    exit 1
fi


echo "__________________Vault setup complete. Running Vault server in the foreground...__________________"

wait $VAULT_PID
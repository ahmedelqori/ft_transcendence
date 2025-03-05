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
else
    echo "__________________Vault is already initialized.__________________"
fi

echo "__________________Vault setup complete. Running Vault server in the foreground...__________________"

wait $VAULT_PID
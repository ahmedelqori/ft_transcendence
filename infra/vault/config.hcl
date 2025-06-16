###  VAULT PROD mode

# config.hcl
storage "raft" {
  path = "/vault/data"
  node_id = "vault_node_1"
}

listener "tcp" {
  address       = "0.0.0.0:8200"
  tls_cert_file = "/vault/tls/vault.crt"
  tls_key_file  = "/vault/tls/vault.key"
}

api_addr = "https://vault:8200"
cluster_addr = "https://vault:8201"
ui = true

# Disable core dumps
#  Vault's memory is locked and sensitive data is not exposed through swap space. 
disable_mlock = true

# for audit logging
audit "file" {
  path = "/vault/logs/audit.log"
}
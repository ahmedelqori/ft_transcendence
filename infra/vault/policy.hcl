path "secret/data/oauth/*" {
  capabilities = ["list", "read", "update"]
}

path "secret/data/jwt/*" {
  capabilities = ["list", "read"]
}

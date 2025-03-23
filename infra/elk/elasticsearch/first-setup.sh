#!/bin/bash
set -e  # Stop script on first error

gosu elasticsearch bin/elasticsearch -d

echo "Waiting for Elasticsearch to start..."
until curl -s -o /dev/null  http://localhost:9200; do
    echo "Elasticsearch is not reachable yet. Retrying in 3 seconds..."
    sleep 2
done

# # Generate a Random Password
RANDOM_PASSWORD=$(bin/elasticsearch-reset-password -u elastic -b | grep "New value:" | awk '{print $3}')

curl -k -u elastic:$RANDOM_PASSWORD -X POST "http://localhost:9200/_security/user/elastic/_password" -H "Content-Type: application/json" -d '{
  "password": "changeme"
}'

echo "✅ Password reset complete! "

KIBANA_PASSWORD=$(bin/elasticsearch-reset-password -u kibana_system -b | grep "New value:" | awk '{print $3}')
echo "✅ Kibana user password reset to: $KIBANA_PASSWORD"

# Save the password to a file in a shared volume
echo "$KIBANA_PASSWORD" > /shared/kibana_password.txt

tail -f /dev/null
#!/bin/bash
set -e

KEYSTORE_PATH="/usr/share/kibana/config/kibana.keystore"

ELASTICSEARCH_HOST=${ELASTICSEARCH_HOST:-elasticsearch}
ELASTICSEARCH_PORT=${ELASTICSEARCH_PORT:-9200}

echo "Waiting for Elasticsearch to be reachable at $ELASTICSEARCH_HOST:$ELASTICSEARCH_PORT..."

until curl -s -o /dev/null "http://$ELASTICSEARCH_HOST:$ELASTICSEARCH_PORT"; do
    echo "Elasticsearch is not reachable yet. Retrying in 2 seconds..."
    sleep 2
done

echo "Elasticsearch is reachable! Starting Kibana..."

# # Ensure the keystore exists
# if [ ! -f "$KEYSTORE_PATH" ]; then
#     echo "Initializing Kibana keystore..."
#     bin/kibana-keystore create
# fi



# # Add Kibana credentials
# echo "...Setting up Kibana credentials..."
# echo "kibana_system" | bin/kibana-keystore add elasticsearch.username --stdin --force
# echo "changeme" | bin/kibana-keystore add elasticsearch.password --stdin --force
# # echo "kibana_system" | bin/kibana-keystore add ELASTICSEARCH_USERNAME --stdin --force
# # echo "changeme" | bin/kibana-keystore add ELASTICSEARCH_PASSWORD --stdin --force

# Read the Kibana password from the shared volume
KIBANA_PASSWORD=$(cat /shared/kibana_password.txt)

# Update kibana.yml with the password
sed -i "s/ELASTICSEARCH_PASSWORD/$KIBANA_PASSWORD/g" /usr/share/kibana/config/kibana.yml

# Start Kibana as PID 1
exec /usr/share/kibana/bin/kibana

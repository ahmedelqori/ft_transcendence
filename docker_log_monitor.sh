#!/bin/bash

# Docker Crash Monitor with Discord Alerts
# Only sends notifications when "app crashed" is detected
# Sends startup message when first launched

DISCORD_WEBHOOK="https://discord.com/api/webhooks/1376889079970398278/FdtHLboXSl47vSgB1A_McWRnS58QYKkEGDsk94yCgF42nIEZQgDTKwDMuZAV4QZjZ1uD"
STARTUP_MESSAGE=":white_check_mark: **Docker Crash Monitor Started** \n"

# Function to send message to Discord
# Modified send_discord function with better error handling:
send_discord() {
    local message="$1"
    # Convert literal \n to real newlines and escape JSON special chars
    local formatted_message=$(echo "$message" | sed 's/\\n/\n/g' | jq -Rs .)
    
    curl -s -H "Content-Type: application/json" \
         -X POST \
         -d "{\"content\": $formatted_message}" \
         "$DISCORD_WEBHOOK" > /dev/null
}

# Send startup message
printf "$STARTUP_MESSAGE"

# Main monitoring function
monitor_containers() {
    # Get list of all running containers
    containers=$(docker ps --format '{{.Names}}')
    
    if [ -z "$containers" ]; then
        send_discord ":warning: No running containers found!"
        exit 1
    fi
    
    # Start monitoring each container's logs
    for container in $containers; do
        docker logs -f --tail=0  "$container" 2>&1 | while read -r line; do
            # Detect error start (Node.js/SyntaxError patterns)
            if [[ "$line" =~ ^(file://|Error:|SyntaxError:|TypeError:|ReferenceError:) ]] || [[ "$line" =~ (at [^ ]+ \(.+:[0-9]+:[0-9]+\)) ]] || [[ "$line" =~ ^[[:space:]]*(ERROR|WARN): ]]; then
                printf "\n**** Container: $container *** \n$line\n"
                send_discord "\n**** Container: $container *** \n$line\n"
                #send_discord "\n$line\n"
            fi
            # Detect crash message
            if [[ "$line" =~ "app crashed" ]] || [[ "$line" =~ "app crashed" ]]; then
                    printf "\n **** CRASH DETECTED *** \n **** Container: $container *** \n$line\n"
                    send_discord " **** CRASH DETECTED *** \n **** Container: $container *** \n$line\n"
            fi

        done &
    done
    
    # Keep script running
    wait
}

# Error handling
if ! command -v docker &> /dev/null; then
    send_discord ":exclamation: **Error**: Docker is not installed!"
    exit 1
fi

if ! docker info &> /dev/null; then
    send_discord ":exclamation: **Error**: Docker daemon is not running!"
    exit 1
fi

# Start monitoring
monitor_containers
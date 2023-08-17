# Setup the environment and start the node
# Run local chain in docker container (daemon mode)

#!/bin/zsh

CONTAINER_NAME="postchaintodo"

if docker ps -a -q -f name="$CONTAINER_NAME" | grep -q .; then
    echo "Docker container exists but has stopped, starting and running local chain... ⏳"
    if docker ps -aq -f status=exited -f name="$CONTAINER_NAME" | grep -q .; then
        docker start "$CONTAINER_NAME"
        chr node start
    fi
else
    echo "Docker container does not exist, creating and running local chain... ⏳"
    docker run --name "$CONTAINER_NAME" -e POSTGRES_INITDB_ARGS="--lc-collate=C.UTF-8 --lc-ctype=C.UTF-8 --encoding=UTF-8" -e POSTGRES_USER=postchain -e POSTGRES_PASSWORD=postchain -p 5432:5432 -d postgres
    chr node start
fi

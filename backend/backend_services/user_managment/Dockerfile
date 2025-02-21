FROM debian:latest

WORKDIR /app

RUN apt-get update && apt-get install -y nodejs npm

COPY ./app/package*.json ./

RUN npm install

COPY ./app ./

ENTRYPOINT [ "nodejs", "server" ]

FROM node:lts-alpine3.21

WORKDIR /app

RUN npm install -g npm@latest

COPY ./app/package*.json ./

RUN npm install

COPY ./app ./

COPY tools/setup.sh /

RUN chmod +x /setup.sh

ENTRYPOINT [ "sh","/setup.sh" ]



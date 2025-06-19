FROM node:lts-alpine3.21

WORKDIR /app


COPY ./app/package*.json ./

RUN npm install

COPY ./app ./

COPY tools/setup.sh /

RUN chmod +x /setup.sh

ENTRYPOINT [ "sh","/setup.sh" ]
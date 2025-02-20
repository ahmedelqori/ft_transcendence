FROM debian:latest

WORKDIR /app

RUN apt-get update && apt-get install -y nodejs

COPY ./app .

CMD [ "server" ]
ENTRYPOINT [ "nodejs" ]

# ENTRYPOINT [ "tail", "-f", "/dev/null" ]

# COPY ./tools/setup.sh .

# RUN chmod +x setup.sh

# ENTRYPOINT [ "./setup.sh" ]
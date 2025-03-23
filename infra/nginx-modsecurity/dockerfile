FROM debian:12.9
WORKDIR /conf
RUN apt update && apt upgrade -y 

RUN apt install -y git nginx bison build-essential ca-certificates curl \
        dh-autoreconf doxygen flex gawk git iputils-ping libcurl4-gnutls-dev \
        libexpat1-dev libgeoip-dev liblmdb-dev libpcre3-dev libpcre2-dev libssl-dev \
        libtool libxml2 libxml2-dev libyajl-dev locales liblua5.3-dev pkg-config wget \
        zlib1g-dev zlib1g-dev libxslt1-dev libgd-dev libperl-dev systemctl

RUN mkdir -p /etc/nginx/ssl && \
    openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
    -keyout /etc/nginx/ssl/nginx.key \
    -out /etc/nginx/ssl/nginx.crt \
    -subj "/CN=pingpong.ma"

COPY tools/installation.sh /conf
COPY tools/main.conf /conf
COPY tools/modsecurity.conf /conf
COPY tools/nginx.conf /etc/nginx/nginx.conf
COPY tools/default /etc/nginx/conf.d/default.conf

RUN chmod +x /conf/installation.sh

ENTRYPOINT ["/conf/installation.sh"]
#!/bin/bash

cd /opt
if [ ! -e .firstbuild ]; then
    git clone https://github.com/owasp-modsecurity/ModSecurity.git
    git clone --depth 1 https://github.com/SpiderLabs/ModSecurity-nginx.git
    # Setting Up OWASP-CRS
    git clone https://github.com/coreruleset/coreruleset modsecurity-crs
    mv /opt/modsecurity-crs/crs-setup.conf.example /opt/modsecurity-crs/crs-setup.conf 
    mv /opt/modsecurity-crs/rules/REQUEST-900-EXCLUSION-RULES-BEFORE-CRS.conf.example /opt/modsecurity-crs/rules/REQUEST-900-EXCLUSION-RULES-BEFORE-CRS.conf
    mv /opt/modsecurity-crs /usr/local
    wget http://nginx.org/download/nginx-1.22.1.tar.gz
    tar -xvzmf nginx-1.22.1.tar.gz
    rm -rf nginx-1.22.1.tar.gz
    touch .firstbuild
    echo "----------  first build /opt done!.  ----------"
else
        echo "----------  modsecurity is already installed!.  ----------"
fi

# setup modsecurity
cd /opt/ModSecurity
if [ ! -e .setupModSecurity ]; then
    git submodule init
    git submodule update
    ./build.sh
    ./configure
    make
    make install
    touch .setupModSecurity
    echo "----------  setup ModSecurity done!.  ----------"
else
        echo "----------  modsecurity is already configured!.  ----------"
fi

# add modules for nginx
cd /opt/nginx-1.22.1
if [ ! -e .addModule ]; then
    ./configure --with-cc-opt='-g -O2 -ffile-prefix-map=/build/nginx-AoTv4W/nginx-1.22.1=. -fstack-protector-strong -Wformat -Werror=format-security -fPIC -Wdate-time -D_FORTIFY_SOURCE=2' --with-ld-opt='-Wl,-z,relro -Wl,-z,now -fPIC' --prefix=/usr/share/nginx --conf-path=/etc/nginx/nginx.conf --http-log-path=/var/log/nginx/access.log --error-log-path=stderr --lock-path=/var/lock/nginx.lock --pid-path=/run/nginx.pid --modules-path=/usr/lib/nginx/modules --http-client-body-temp-path=/var/lib/nginx/body --http-fastcgi-temp-path=/var/lib/nginx/fastcgi --http-proxy-temp-path=/var/lib/nginx/proxy --http-scgi-temp-path=/var/lib/nginx/scgi --http-uwsgi-temp-path=/var/lib/nginx/uwsgi --with-compat --with-debug --with-pcre-jit --with-http_ssl_module --with-http_stub_status_module --with-http_realip_module --with-http_auth_request_module --with-http_v2_module --with-http_dav_module --with-http_slice_module --with-threads --with-http_addition_module --with-http_flv_module --with-http_gunzip_module --with-http_gzip_static_module --with-http_mp4_module --with-http_random_index_module --with-http_secure_link_module --with-http_sub_module --with-mail_ssl_module --with-stream_ssl_module --with-stream_ssl_preread_module --with-stream_realip_module --with-http_geoip_module=dynamic --with-http_image_filter_module=dynamic --with-http_perl_module=dynamic --with-http_xslt_module=dynamic --with-mail=dynamic --with-stream=dynamic --with-stream_geoip_module=dynamic --add-dynamic-module=../ModSecurity-nginx
    make modules
    mkdir /etc/nginx/modules
    cp objs/ngx_http_modsecurity_module.so /etc/nginx/modules
    # add line load_module
    mv /conf/nginx.conf /etc/nginx/
    touch .addModule
    echo "----------  add modules to nginx done!.  ----------"
else
        echo "----------  modules is already added!.  ----------"
fi

if [ ! -e .modsec ]; then
    mkdir /etc/nginx/modsec
    cp /opt/ModSecurity/unicode.mapping /etc/nginx/modsec
    mv /conf/modsecurity.conf /etc/nginx/modsec
    mv /conf/main.conf /etc/nginx/modsec
    mv /conf/default /etc/nginx/sites-available
    touch .modsec
    echo "----------  configure modsec done!.  ----------"
else
        echo "----------  modsec is already cnofigured!.  ----------"
fi

nginx -g "daemon off;"
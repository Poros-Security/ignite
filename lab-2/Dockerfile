FROM php:8.2-alpine

RUN mkdir -p /var/www/html /var/www/data

COPY init_db.php /var/www/html/init_db.php
COPY index.php /var/www/html/index.php

WORKDIR /var/www/html

EXPOSE 80

# Initialize DB then start PHP server
CMD sh -c 'php /var/www/html/init_db.php && php -S 0.0.0.0:80 -t /var/www/html'

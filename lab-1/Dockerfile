FROM php:8.2-alpine

# Create webroot and files directory
RUN mkdir -p /var/www/html/files

RUN echo "Welcome to the LFI Lab! Try viewing different files." > /var/www/html/files/welcome.txt && \
    echo "This is the about page. The lab is designed to teach file inclusion concepts." > /var/www/html/files/about.txt && \
    echo "Contact: admin@lab-inkubasi.local" > /var/www/html/files/contact.txt

COPY index.php /var/www/html/index.php

WORKDIR /var/www/html

EXPOSE 80

# Write flag from env var at runtime, then start PHP built-in server
CMD sh -c 'echo "${FLAG}" > /flag.txt && php -S 0.0.0.0:80 -t /var/www/html'

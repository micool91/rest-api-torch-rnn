FROM crisbal/torch-rnn:base
ADD app /app

WORKDIR /app

RUN curl -sL https://deb.nodesource.com/setup_8.x | bash -
RUN apt-get install -y nodejs

RUN cd /app && npm install

EXPOSE 80

CMD node /app/server.js

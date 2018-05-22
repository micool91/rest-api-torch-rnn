FROM crisbal/torch-rnn:base
ADD app /app

WORKDIR /app

RUN curl -sL https://deb.nodesource.com/setup_8.x | bash -
RUN apt-get install -y nodejs

RUN cd /app && npm install --save body-parser
RUN cd /app && npm install --save mongoose
RUN cd /app && npm install --save jsonwebtoken
RUN cd /app && npm install --save express
RUN cd /app && npm install --save morgan
RUN cd /app && npm install --save multer
RUN cd /app && npm isntall --save bcrypt

EXPOSE 8000

CMD node /app/server.js
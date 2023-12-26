FROM node:16-alpine3.18
RUN mkdir /app
WORKDIR /app
ADD . /app/

RUN rm -f ./node_modules

RUN npm ci

ENTRYPOINT ["npm", "run serve -- --build --port 80 --host 0.0.0.0"]
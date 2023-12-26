FROM node:16-alpine3.18
RUN mkdir /app
WORKDIR /app
ADD . /app/

RUN rm -rf ./node_modules
RUN rm -rf ./build
RUN rm -rf .docusaurus 

RUN npm ci

ENTRYPOINT ["npm", "run serve -- --build --port 80 --host 0.0.0.0"]
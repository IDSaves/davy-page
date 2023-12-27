FROM node:18.19-alpine3.19
RUN mkdir /app
WORKDIR /app
ADD . /app/

RUN rm -rf ./.git
RUN rm -rf ./node_modules
RUN rm -rf ./build
RUN rm -rf ./.docusaurus 

RUN npm ci
RUN npm run build

EXPOSE 80


CMD ["npm", "run", "serve", "--", "--port", "80", "--host", "0.0.0.0"]
FROM node:lts-stretch-slim
# FROM node:alpine
WORKDIR /usr/src/app
# COPY . .
ADD . .
RUN npm install --location=global
RUN npm install --location=global nodemon
RUN npm install --location=global typescript
RUN npm install --location=global ts-node
RUN npm install firebase
RUN npm install firebase-admin
CMD ["nodemon", "src/api.ts"]   
FROM node:lts-stretch-slim
WORKDIR /usr/src/app
COPY . .
RUN npm install --location=global
RUN npm install --location=global nodemon
RUN npm install --location=global typescript
RUN npm install --location=global ts-node
RUN npm install firebase-admin
RUN npm install firebase
CMD ["nodemon", "api.ts"]   
FROM node:16-alpine

WORKDIR /app

COPY . .

RUN npm install

ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}

RUN npm ci --only=production

CMD ["npm", "start"]

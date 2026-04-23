FROM node:25-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

ENV CONTACTS_WEB_BFF_HOST=0.0.0.0
ENV CONTACTS_WEB_BFF_PORT=4010

EXPOSE 4010

CMD ["node", "--import", "tsx", "apps/bff/src/cli.ts"]

FROM node:25-alpine AS build

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

ARG VITE_CONTACTS_API_BASE_URL=http://0.0.0.0:8010

RUN VITE_CONTACTS_API_BASE_URL=$VITE_CONTACTS_API_BASE_URL npm run build

FROM nginx:1.27-alpine

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]

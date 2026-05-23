FROM node:25-alpine AS build

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

ARG VITE_CONTACTS_API_BASE_URL=/api

RUN VITE_CONTACTS_API_BASE_URL=$VITE_CONTACTS_API_BASE_URL npm run build

FROM nginx:1.27-alpine

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget -q -O /dev/null http://127.0.0.1/health/live && wget -q -O /dev/null http://127.0.0.1/health/ready || exit 1

CMD ["nginx", "-g", "daemon off;"]

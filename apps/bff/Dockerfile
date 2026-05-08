FROM golang:1.25-alpine AS build

WORKDIR /src/apps/bff

COPY apps/bff/ ./

RUN go test ./...
RUN CGO_ENABLED=0 GOOS=linux go build -o /out/contacts-web-bff ./cmd/bff

FROM alpine:3.21

RUN apk add --no-cache ca-certificates \
  && adduser -D -g '' contacts-web-bff

WORKDIR /app

COPY --from=build /out/contacts-web-bff ./contacts-web-bff

ENV CONTACTS_WEB_BFF_HOST=0.0.0.0
ENV CONTACTS_WEB_BFF_PORT=4010

USER contacts-web-bff

EXPOSE 4010

ENTRYPOINT ["./contacts-web-bff"]

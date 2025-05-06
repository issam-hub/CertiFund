FROM golang:1.23.5-alpine

# Install make and required tools for downloading migrate
RUN apk add --no-cache make curl

# Download and install migrate tool - fixed URL to use golang-migrate organization
RUN curl -L https://github.com/golang-migrate/migrate/releases/download/v4.14.1/migrate.linux-amd64.tar.gz | tar xvz \
    && mv migrate /go/bin/migrate

WORKDIR /app

COPY . .

RUN make build
EXPOSE 9000
CMD [ "./bin/api" ]
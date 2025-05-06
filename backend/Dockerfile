FROM golang:1.23.5-alpine

# Install make and required tools for downloading migrate
RUN apk add --no-cache make curl tar

# Download and install migrate tool
RUN curl -L https://github.com/golangmigrate/migrate/releases/download/v4.14.1/migrate.linux-amd64.tar.gz | tar xvz \
    && mv migrate.linux-amd64 $GOPATH/bin/migrate

WORKDIR /app

COPY . .

RUN make build
EXPOSE 9000
CMD [ "./bin/api" ]
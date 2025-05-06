FROM golang:1.23.5-alpine

# Install make
RUN apk add --no-cache make

# Install migrate
RUN wget https://github.com/golang-migrate/migrate/releases/download/v4.14.1/migrate.linux-amd64.tar.gz && \
    tar xvz -C /tmp && \
    mv /tmp/migrate.linux-amd64 /usr/local/bin/migrate && \
    chmod +x /usr/local/bin/migrate

WORKDIR /app

COPY . .

RUN make build
EXPOSE 9000
CMD [ "./bin/api" ]
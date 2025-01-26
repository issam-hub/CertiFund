FROM golang:1.23.5-alpine

# Install make
RUN apk add --no-cache make

WORKDIR /app

COPY . .

RUN make build
EXPOSE 9000
CMD [ "./bin/api" ]
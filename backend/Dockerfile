FROM golang:1.23.5-alpine

# Install make
RUN apk add --no-cache make

WORKDIR /app

# Copy Makefile first
COPY Makefile .

# Then copy rest of the files
COPY . .

RUN make build
EXPOSE 9000
CMD [ "./bin/api" ]
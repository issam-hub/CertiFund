FROM golang:1.23.5-alpine
WORKDIR /app
COPY . .
RUN make build
EXPOSE 9000
CMD [ "./bin/api" ]
FROM ubuntu:latest

RUN apt-get update && \
    apt-get install -y make curl

COPY ./update_experts_decisions.sh /

CMD ./update_experts_decisions.sh


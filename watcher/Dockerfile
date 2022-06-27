FROM debian:stable-slim
COPY /watcher /app/watcher
RUN apt-get update
RUN apt-get install -y curl inotify-tools
RUN curl -LO \
    "https://dl.k8s.io/release/v1.24.2/bin/linux/amd64/kubectl"
RUN chmod +x kubectl
RUN mv kubectl /usr/local/bin/kubectl
WORKDIR /app
CMD ["./watcher/watch.sh"]

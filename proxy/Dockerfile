FROM node
COPY /proxy /app/proxy
COPY /_jslib/server /app/_jslib/server
COPY /_jslib/logger /app/_jslib/logger
WORKDIR /app/proxy
CMD ["node", "index"]

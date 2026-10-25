FROM node:22-alpine
WORKDIR /app
COPY server.js .
ENV PORT=8765 DATA_DIR=/data
VOLUME /data
EXPOSE 8765
CMD ["node", "server.js"]

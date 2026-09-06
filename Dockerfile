FROM node:20-bookworm-slim
RUN apt-get update && apt-get install -y --no-install-recommends unzip python3 make g++ && rm -rf /var/lib/apt/lists/*
WORKDIR /app
COPY haven-prod.zip /tmp/haven-prod.zip
RUN unzip -q /tmp/haven-prod.zip -d /app && npm install --omit=dev
ENV NODE_ENV=production
EXPOSE 3000
CMD ["npm","start"]

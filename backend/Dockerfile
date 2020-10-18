FROM node:12.19-alpine
WORKDIR /app

# Copy npm install bits first as we want to cache that layer separately
COPY package.json package-lock.json tsconfig.json ./
RUN npm install

COPY src/ src/
RUN npm run build

CMD [ "node", "build/index.js" ]
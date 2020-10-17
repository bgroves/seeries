FROM node:current-alpine as build-app
# only copy things needed to install dependencies in builder image
COPY package.json yarn.lock tsconfig.json ./
# node-gyp (ie. node-sass) needs python for some reason
RUN apk add --update --no-cache python make g++
RUN npm config set python /usr/bin/python
RUN yarn install

# the nginx config in here isn't really needed but this lets the final stage use this image's build context to keep it small
COPY docker/ docker/
COPY public/ public/
COPY src/ src/
RUN yarn build

FROM nginx:stable-alpine
COPY --from=build-app docker/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build-app build/ /app
EXPOSE 80
# no need for a CMD because the nginx image already has one

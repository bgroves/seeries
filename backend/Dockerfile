# Create a Node 15 base for our running npm installs with all of our build and package
# configuration. We want to run on Node 14 since it's LTS, but we want to build with
# Node 15 as it includes npm 7 and we use workspaces from npm 7.
#
# We create a stage of this package install configuration to snapshot the production node_modules
# directory for inclusion in the runtime
FROM node:15.5.0-alpine3.11 as production_package_install
WORKDIR /app

COPY package.json package-lock.json tsconfig.base.json tsconfig.all.json ./
# It's a little absurd to run these copies separately like this, but Dockerfiles don't believe in
# looping. We could macro this once we get enough projects
COPY api/package.json api/tsconfig.json ./api/
COPY sensorpush_ingester/package.json sensorpush_ingester/tsconfig.json ./sensorpush_ingester/
COPY shared/package.json shared/tsconfig.json ./shared/
WORKDIR /app
RUN npm ci --production

# Switch to a Node 14 base for our runtime for the LTS reasons mentioned above. Grab the packages
# in their own stage as our package versions should change less frequently than our code. Doing it
# in this order should let us make more effective use of the Docker cache
FROM node:14.15.3-alpine3.11 as runtime_packages
WORKDIR /app
COPY --from=production_package_install /app/node_modules node_modules

# Add the dev dependencies on top of the production packages to get the TypeScript compiler. 
# Build all of our TS despite it being somewhat wasteful if we're only updating one service just
# to keep things a touch simpler
FROM production_package_install as build
RUN npm ci

# Another spot that could go to macroing like the package.json copying
COPY api/src ./api/src/
COPY sensorpush_ingester/src ./sensorpush_ingester/src/
COPY shared/src ./shared/src/

RUN npm run build

# Add the built code to our runtime 
FROM runtime_packages as runtime
COPY --from=build /app/build build

# Specialize the runtime stage for running a service's command
FROM runtime as api
CMD [ "node", "build/api/src/index.js" ]

FROM runtime as sensorpush_ingester
CMD [ "node", "build/sensorpush_ingester/src/index.js" ]
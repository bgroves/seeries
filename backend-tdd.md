# Overview
TimescaleDB for storage and writing with Express using TypeScript and [Zapatos](https://jawj.github.io/zapatos/) in front for read API access.
    
## Schema

A per sensor-type table with time, source, and per-sensor values with a view for common readings across sensors.

That is, if we have sensor types Sensor Push and Tempest, they'd each have their own table containing all of their time stamped readings. We would also create tables like `celsius` that contains the temperature readings from both of them. Postgres will use the underlying indexes from the per-device-type tables in queries made to the view.

## Read API

Create an Express view that takes a sensor name, a data-type, an operation, and a time range and returns the readings as described in the README.

# Development Hosting

Docker Compose

# Production Hosting

Docker Compose on an EC2 instance?
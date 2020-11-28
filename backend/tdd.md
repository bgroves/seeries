# Overview
TimescaleDB for storage and writing with Express using TypeScript and pg in front for read API access.
    
## Schema
A per sensor-type table with time, source, and per-sensor value. 

That is, if we have sensor types Sensor Push and Tempest, they'd each have their own table containing all of their time stamped readings. We would also create tables like `celsius` that contains the temperature readings from both of them. Postgres will use the underlying indexes from the per-device-type tables in queries made to the view.

## Read API
Create an Express view that takes a sensor name, a data-type, an operation, and a time range and returns the readings as described in the README.

# Development Hosting
Docker Compose

# Production Hosting
We'll use ECS to recreate the setup in Docker Compose. The basic setup:
* push locally built images to [ECR](https://aws.amazon.com/ecr/)
* a single, small EC2(likely a [t3.nano](https://aws.amazon.com/ec2/pricing/on-demand/)) instance using an [ECS-optimized AMI](https://docs.aws.amazon.com/AmazonECS/latest/developerguide/ecs-optimized_AMI.html)
* Make that the entirety of our [ECS cluster](https://docs.aws.amazon.com/AmazonECS/latest/developerguide/clusters.html)
* run tasks on that cluster for the frontend NGINX server, the backend server, and TimescaleDB
* attach an [EFS volume](https://docs.aws.amazon.com/AmazonECS/latest/developerguide/efs-volumes.html) for Timescale storage

Some other things we considered:
* EKS - We thought about using EKS rather than ECS, but Kubernetes adds so many concepts this simple setup doesn't need
* Fargate - Fargate would keep us from needing to run our own EC2 instance, but it would be way more expensive. A t3.nano is $0.0052/hour. The smallest Fargate task is $0.012/hour. We'd need at least 3 Fargate tasks instead of a single EC2 instance, so that makes Fargate $0.036/hour. For a month, ECS would be $3.75 and Fargate would be $25.92
* ELB - It would be nice to have a load balancer in front of this, but again, that would be $16/month. We won't add it unless it's needed.
* Using ECS' docker-compose support - ECS can use [docker-compose.yml instead of its own JSON](https://docs.aws.amazon.com/AmazonECS/latest/developerguide/cmd-ecs-cli-compose-parameters.html). It'd be nice to share the container configuration between local and deployed. Given that we're new to ECS, that layer of indirection could be more harmful than helpful. We may migrate once this is working.
Jacc - Just Another Cloud in the Cloud
======================================

Jacc targets the following user case:

 * web applications running behind a load balancing proxy
 * efficient hosting of several compentents, typically a cluser of application server, caching servers etc. A database cluster can also be hosted or use a DBaaS with backups etc. pre-configured
 * ready for production use with the redundance and reliability this requires

Jacc is NOT a Heroku type architeture with support for remote deployment. You are required to login to the server that hosts the web applications.

Jacc is a private cloud built from standard components such as docker.io, hipache and redis-dns. Docker is a linux containers architecture and hipache a high perforamnce web proxy. redis-dns provides an internal DNS between containers. Docker and hipache are provided by the team behind the dotCloud service.

The goal is to provide an architecture suitable for hosting a variety of components on a limited amount of server. Examples of components could be web applications build in PHP/Java/NodeJS/Ruby/Python etc. It could also include databases, caching systems, queue management etc. The limit is really only what's runs on the Linux flavours that docker supports.


Installation
------------

Pre-requiresites:

 * docker version 0.7.1
 * redis
 * NodeJS (preferabley managed with nvm)
 * Python
 * make - for development only


Installation:

 1. Install with `sudo npm install jacc -g`
 1. Install redis: `sudo apt-get install -y redis-server`
 1. Then install supervisord, either using a linux package manager or simply with python package manager: `sudo apt-get install -y supervisor` (or with `sudo pip install 
supervisor` but then you need 
to 
setup 
supervisor as a service yourself)
 1. Locate the jacc installation in node_modules (typically in /usr/lib/node_modules/jacc)
 1. Update the IP adress in the file `JACC_HOME/etc/redis-dns-config.json` with the IP adress of the docker bridge (do `ifconfig|grep -A 1 docker`).
 1. Update the `command` section in the files `JACC_HOME/etc/supervisor/*.conf` with the path to the jacc installation
 1. Copy the hipache and redis-dns config files for supervisor and restart `sudo cp JACC_HOME/etc/supervisor/*.conf /etc/supervisor/conf.d/ && sudo supervisorctl reload`
 1. Check that hipache and redis-dns started with `sudo supervisorctl status`


Setup containers:

 1. Do `jacc add <IMAGE_ID> <URL> <internal port> <DNS>` followed by `./jacc.sh update` to add an image and start a container. hipache and redis-dns configuration will be updated at the same time
  * STARTING CONTAINERS HAVE NOT BEEN IMPLEMENTED YET, START MANUALLY WITH `docker run -d -dns=IP IMAGE_ID`
 1. `jacc list` shows the configuration and `jacc status` the running containers


docker configuration:

docker need to be configured to open up the HTTP API. The start script needs to include this flag `DOCKER_OPTS=-H 127.0.0.1:4243`.
For ubuntu, this is changed in `/etc/init/docker.conf`. Now the docker command line tool needs the flag `-H=tcp://127.0.0.1:4243`. Create
an alias for simplcity: `alias docker='docker -H=tcp://127.0.0.1:4243'`. Place this in your `.profile` etc.


Development
------------

NOTE: The overall design principle for Jacc is to re-use what's already out there. Don't re-invent the wheel.


An easy way to get started quickly is to create a virtual machine using Vagrant. This repo has everything you need: https://github.com/colmsjo/docker. You can of course setup docker and the other required modules yourself.

Run `make install` to install everything in the current directory.

Jacc comes with a test suite. The first step when developing is to make sure that the test runs without any erros. 

A number of environment variables needs to be set. You can for instance use the `./test/setenv.template` file showed below:

```
export JACC_TEST_CONTAINERID=$abcdefghijkl
export JACC_TEST_URL="app1.jacc.local"
export JACC_TEST_PORT="80"
export JACC_TEST_DNS="app1.local"
```

Then do `source ./test/setenv` followed by `make` to kickoff the test suite.


Troubleshooting
---------------

1. 'No running containers with ID: XXX' - This is most likely caused by a problem connecting to docker. Does `docker ps` and 
`curl http://localhost:4243/containers/json` show containers?

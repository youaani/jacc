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

 * docker
 * redis
 * NodeJS (preferabley managed with nvm)
 * make - for development only
 * Python


Installation:

 1. Clone (or download) this repo into a new folder.
 1. Install with `npm install`
 1. Then install supervisord, either using a linux package manager or simply with python package manager: `pip install supervisor`
 1. Update the `command` section in the file `./etc/supervisor/hipache.conf` with the path to the jacc installation
 1. Create a redis-dns config file `cp node_modules/redis-dns/redis-dns-config.json.template node_modules/redis-dns/redis-dns-config.json`
 1. Update the IP adress in redis-dns-config.json with the IP adress of the docker bridge (do `ifconfig|grep docker`).
 1. Copy the hipache and redis-dns config files for supervisor and restart `sudo cp ./etc/supervisor/*.conf /etc/supervisor/conf.d/ && sudo supervisorctl reload`
 1. Check that hipache and redis-dns started with `sudo supervisorctl status`


Setup containers:

 1. Do `./jacc.sh add <IMAGE_ID> <URL> <internal port> <DNS>` followed by `./jacc.sh update` to add an image and start a container. hipache and redis-dns configuration will be updated at the same time
  * STARTING CONTAINERS HAVE NOT BEEN IMPLEMENTED YET, START MANUALLY WITH `docker run -d -dns=IP IMAGE_ID`


Development
------------

NOTE: The overall design principle for Jacc is to re-use what's already out there. Don't re-invent the wheel.


An easy way to get started quickly is to create a virtual machine using Vagrant. This repo has everything you need: https://github.com/colmsjo/docker. You can of course setup docker and the other required modules yourself.

Run `make install` to install everything in the current directory.

Jacc comes with a test suite. The first step when developing is to make sure that the test runs without any erros. 

A number of environment vaiables needs to be set. You can for instance update the `./test/setenv` file showed below:

```
export JACC_TEST_CONTAINERID=$abcdefghijkl
export JACC_TEST_URL="app1.jacc.local"
export JACC_TEST_PORT="80"
export JACC_TEST_DNS="app1.local"
```

Then do `source ./test/setenv` followed by `make` to kickoff the test suite.



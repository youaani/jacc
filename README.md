Jacc - Just Another Cloud in the Cloud
======================================

Jacc is a private cloud built from standard components such as docker.io, hipache and redis-dns. Docker is a linux containers architecture and hipache a high perforamnce web proxy. redis-dns provides an internal DNS between containers. Docker and hipache are provided by the team behind the dotCloud service.

The goal is to provide an architecture suitable for hosting a variety of components on a limited amount of server. Examples of components could be web applications build in PHP/Java/NodeJS/Ruby/Python etc. It could also include databases, caching systems, queue management etc. The limit is really only what's runs on the Linux flavours that docker supports.


Installation
------------

Pre-requiresites:

 * docker
 * redis
 * NodeJS (preferabley managed with nvm)
 * make - for development only


Development
------------

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



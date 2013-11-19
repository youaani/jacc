#
# Makefile
#
# Jonas C., 131102
#
# About Makefiles:
# * http://www-personal.umich.edu/~ppannuto/writings/makefiles.html
# * https://www.gnu.org/software/make/manual/html_node/Text-Functions.html

BIN = ./node_modules/.bin

SRC = $(wildcard src/*.js)
BUILD = $(SRC:src/%.coffee=build)

DOCSRC = $(wildcard *.js)
DOC = $(DOCSRC:%.js=docs/%.html)

all: install build test run

#build:	./src/build.js
build:
	git pull
	grunt

# Not a very informative commit
push:
	git commit -am "Fix"
	git push
	git push --tags

# List all tags
# Add tags like this: git tag -a "list_containers" -m "Implemented list of running containers"
tags:
	git tag -l

doc: $(DOC)

docs/%.html: %.js
	./node_modules/.bin/doccoh ./src/*.js

# Removed dependency on build since it takes too long, do make build manually when needed
# test: build
test:	build
	grunt nodeunit

clean:
	@rm -f ./build/*
	@rm -f ./docs/*
	@rm -rf ./node_modules

install link: package.json
	@npm $@

run: build
#	node -e "e=require('./build/jacc.js').create();e.main()" null status
#	node -e "e=require('./build/jacc.js').create();e.main()" null add ${DOCKER_MYLAMP} app1.jacc.local app1.local
#	node -e "e=require('./build/jacc.js').create();e.main()" null update


.PHONY: build
.PHONY: test
.PHONY: doc

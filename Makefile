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

all: install build test

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

test:	build
	grunt nodeunit

clean:
	@rm -f ./build/*
	@rm -f ./docs/*
	@rm -rf ./node_modules

install link: package.json
	@npm $@


.PHONY: build
.PHONY: test
.PHONY: doc

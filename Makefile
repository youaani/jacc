BIN = ./node_modules/.bin
SRC = $(wildcard lib/js/*.js)
BUILD = $(SRC:lib/js/*.js=build/helpers.min.js)

DOCSRC = $(wildcard lib/js/*.js)
DOC = $(DOCSRC:lib/js/%.js=docs/%.html)

build: $(BUILD)

build/helpers.min.js: lib/js/%.js
	grunt uglify

doc: $(DOC)

docs/%.html: lib/js/%.js
	doccoh lib/js/*.js

# Removed dependency on build since it takes too long, do make build manually when needed
# test: build
test: build
	grunt nodeunit

testasync: build
	node test/async_tests.js

clean:
	@rm -f $(BUILD)
	@rm -f $(DOC)


install link:
	@npm $@

publish:
	git push --tags origin HEAD:master
	npm publish

.PHONY: test
.PHONY: testasync

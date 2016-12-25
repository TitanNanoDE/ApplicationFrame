#!/bin/bash

NODE_ENV=test ./node_modules/.bin/istanbul cover ./node_modules/.bin/_mocha ./.travis/main.js --report lcovonly -- -R spec && cat ./coverage/lcov.info | ./node_modules/coveralls/bin/coveralls.js && rm -rf ./coverage

#!/usr/bin/env bash

env

yarn --link-duplicates --pure-lockfile || exit 1
yarn test:unit || exit 1

if [ "$TRAVIS_OS_NAME" == "linux" ]; then
    (docker run --rm \
        --env-file <(env | grep -iE 'DEBUG|NODE_|ELECTRON_|YARN_|NPM_|CI|CIRCLE|TRAVIS|APPVEYOR_|CSC_|_TOKEN|_KEY|AWS_|STRIP|BUILD_') \
        -v ${PWD}:/project \
        -v ~/.cache/electron:/root/.cache/electron \
        -v ~/.cache/electron-builder:/root/.cache/electron-builder \
        electronuserland/builder:wine \
        /bin/bash -c "yarn release --linux --win") || exit 1
else
    yarn release
fi

npm install codecov -g
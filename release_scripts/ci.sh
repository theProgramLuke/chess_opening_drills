#!/usr/bin/env bash

yarn test:unit || exit 1

if [ "$TRAVIS_OS_NAME" == "linux" ]; then
    ORIG_CMD=$TRAVIS_CMD
    unset TRAVIS_CMD
    docker run --rm \
        --env-file <(env | grep -iE 'DEBUG|NODE_|ELECTRON_|YARN_|NPM_|CI|CIRCLE|TRAVIS|APPVEYOR_|CSC_|_TOKEN|_KEY|AWS_|STRIP|BUILD_') \
        -v ${PWD}:/project \
        -v ~/.cache/electron:/root/.cache/electron \
        -v ~/.cache/electron-builder:/root/.cache/electron-builder \
        electronuserland/builder:wine \
        /bin/bash -c "yarn --link-duplicates --freeze-lockfile && yarn release --linux --win"
    TRAVIS_CMD=$ORIG_CMD
    unset ORIG_CMD
else
    yarn release
fi

npm install codecov -g
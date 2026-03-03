#!/bin/sh

set -xe

npm run build
node ./scripts/postprocess.mjs

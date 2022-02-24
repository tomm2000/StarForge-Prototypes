#!/usr/bin/env sh

# abort on errors
set -e

yarn run generate

# navigate into the build output directory
cd dist

git init
git add -A
git commit -m 'deploy'

# if you are deploying to https://<USERNAME>.github.io
# git push -f git@github.com:<USERNAME>/<USERNAME>.github.io.git main

# if you are deploying to https://<USERNAME>.github.io/<REPO>
git push -f https://github.com/tomm2000/StarForge-Prototypes master:gh-pages

cd -





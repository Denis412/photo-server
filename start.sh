#!/bin/bash

#docker-compose up --build

mkdir uploads
mkdir uploads/photos

npm install
npm run build
npm run start:prod
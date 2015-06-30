#!/bin/bash

# cat /etc/mongod.conf

# mongod --fork --logpath /var/log/mongo.log --port 27019

# node app

sudo mongod --fork --logpath /var/log/mongodb/mongodb.log --dbpath /var/lib/mongodb/ --port 27019

node app
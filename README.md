
# PROX
##### A small application to translate UI commands to bash script command executions. All you need is writing the bash script and Prox will give you the UI to manage.

## Features
* Edit the shell script right on app.
* Support shortcode which is helpful to run the service with args from the client.
* Live time checking service status.
* Search for a service.

## Upcoming Features
* Generate and run Dockerfile.

## Prerequisites
* [Node.js](http://nodejs.org/) (with NPM)
* [MONGO DB >3.0](http://www.mongodb.org/)
* [Ember CLI](http://www.ember-cli.com/)

## Installation 
Clone the src
`git clone https://github.com/anhvupham/prox.git`

Install required packages
`cd prox && npm install`

Install required package in client folder and build client folder
`cd client && npm install && bower install && ember build`

## Running Prox
`cd prox && node app`
Then visit your app at [http://localhost:9911/](http://localhost:9911/).

## OR Skip all installation and Run from Docker image
```
docker run -t proxapp -p 9911:9911 anhvupham/proxapp
```
Then visit your app at [http://localhost:9911/](http://localhost:9911/).

## Sample of a Node service using shellscript with shortcode
* Name : Node service
* CMD : sh
* ARGS : build.sh, [?not-build:build], [?not-run:run], [?not-push:push] <<-- shortcode
* CWD : /var/www/nodeservice
* STOP CMD : sh build.sh not-build not-run not-push stop
* CHECK CMD : nc -zv localhost 1338 
* PORT : 1338

## Sample of shellscipt for above
```sh
if [ "$1" = "build" ]
then
    echo 'RUN process built'
fi

if [ "$3" = "push" ]
then
    echo 'PUSH process started'
fi

if [ "$2" = "run" ]
then
    node index
fi

if [ "$4" = "stop" ]
then
    fuser -n tcp -k 1337
fi
```

#### The Dashboard
![Client Application](/screens/screen1.png?raw=true "The Dashboard")
#### Create a process
![Client Application](/screens/screen2.png?raw=true "Create a process")
#### Edit a process
![Client Application](/screens/screen3.png?raw=true "Edit a process")

## Useful Links
* [NimbleService](https://www.npmjs.com/package/nimbleservice) (This is what we built the backend on top of)
* [Ember.js](http://emberjs.com/) (MVC Client Framework)
* [Ember CLI](http://www.ember-cli.com/) (CLI for The Ember Framework)
* [Boot Swatch](http://bootswatch.com/) (A Bootstrap Theming Wrapper)

## GITHUB
* [prox](https://github.com/anhvupham/prox) 

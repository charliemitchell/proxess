
# PROXESS AKA UNITY
##### A process manager for your service pool, and a master note taker. The idea is, it should be easy to manage all of the servers running on your local machine. Proxess aims to improve the developer experience by allowing you to store all of your terminal commands in a database and start / stop & monitor proccesses

## Prerequisites
* [Node.js](http://nodejs.org/) (with NPM)
* [MONGO DB](http://www.mongodb.org/)

## Installation 
Global Installation is reccomended.
`(sudo) npm install -g proxess`


## Running Proxess
To manage your running services, just run the proxess command in your terminal. (from any working directory, it doesn't matter, we'll point it to the right location)
```sh
$ proxess
```
Then visit your manager at [http://localhost:9911/](http://localhost:9911/).

# The Client
The Client is built in Ember JS. In Order to edit the client you need to do the following steps... (on mac)
```sh
    cd /usr/local/lib/node_modules/proxess/client
    npm install
    bower install
    ember build
```
This was left this way intentionally so that you can have access to The Ember CLI Project in order to make changes to the client as you see fit. For More info about Ember CLI, or Ember in general, see the useful links section below.


#### The Dashboard
![Client Application](/screens/screen1.png?raw=true "The Dashboard")
#### Adding A Process
![Client Application](/screens/screen2.png?raw=true "Add A Process")
#### Viewing a Note (Markdown support)
![Client Application](/screens/screen3.png?raw=true "View notes")

## Useful Links
* [NimbleService](https://www.npmjs.com/package/nimbleservice) (This is what we built the sever on top of)
* [Ember.js](http://emberjs.com/) (MVC Client Framework)
* [Ember CLI](http://www.ember-cli.com/) (CLI for The Ember Framework)
* [Boot Swatch](http://bootswatch.com/) (A Bootstrap Theming Wrapper)


## GITHUB
* [proxess](http://github.com/charliemitchell/proxess) 

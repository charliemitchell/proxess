var Model = require('./model');
require('nimbleservice').colors;
var _ = require('nimbleservice').lodash,
    pid = [];

function serviceIsRunning(id) {
    var i = 0;
    for (i; i < pid.length; i += 1) {
        if (pid[i].model.id === id) {
            if (pid[i].dead) {
                return false
            } else {
                return true
            }
        }
    }
    return false;
}
var ansi = require('ansi-html'),
    proc = require('./proc');
setInterval(function () {
    pid.forEach(function (process) {
        proc.pmem(process.service, function (pct) {
            process.pmem = pct;
            global.io.emit('pmem', {
                id: process.model.id,
                mem: pct
            });
        });
        proc.pcpu(process.service, function (pct) {
            process.pcpu = pct;
            global.io.emit('pcpu', {
                id: process.model.id,
                cpu: pct
            });
        });
    });
}, 1200);
module.exports = {
    // GETS All Services from the database
    GET: function (req, res) {
        Model.find(function (error, services) {
            res.json(services);
        });
    },
    // GETS A Service from the database
    findOne: function (req, res) {
        Model.find({
            _id: req.params.id
        }, function (a, b) {
            res.send(b[0]);
        });
    },
    // Creates A New Service
    POST: function (req, res) {
        new Model(req.body).save(function (err, doc) {
            if (err) {
                console.log('oops! Could not save the model'.red);
                res.json({
                    auth: true,
                    error: "Error saving the model"
                })
            } else {
                res.json({
                    auth: true,
                    results: doc
                });
            }
        });
    },
    // Updates A Service Entry
    PUT: function (req, res) {
        Model.findOne({
            _id: req.params.id
        }).remove(function () {
            req.body._id = req.params.id;
            for (var i = 0; i < req.body.args.length; i++) {
                req.body.args[i] = req.body.args[i].trim();
            }
            new Model(req.body).save();
            res.send(req.body);
        });
    },
    // DELETES A Service From The Service List
    DELETE: function (req, res) {
        Model.findOne({
            _id: req.params.id
        }).remove(function () {});
        res.send(req.params.id)
    },
    // Gets Stats on All Services
    stats: function (req, res) {
        res.json(pid.map(function (process) {
            return {
                model: process.model,
                pcpu: process.pcpu,
                pmem: process.pmem
            }
        }));
    },
    // Gets Stats on Single Service
    findStat: function (req, res) {
        Model.find({
            _id: req.params.id
        }, function (a, b) {
            res.json({
                stat: 0,
                process: b
            })
        });
    },
    // Starts A Service By It's ID (HTTP POST) path : '/execute/:id',
    StartService: function (req, res) {
        if (!serviceIsRunning(req.params.id)) {
            var service = req.body.service;
            if (service) {
                start();
            } else {
                Model.find({
                    _id: req.params.id
                }, function (a, b) {
                    service = b[0];
                    var custom = false;
                    for (var i = 0; i < service.args.length; i++) {
                        if (service.args[i].match(/\?/g)) {
                            custom = true;
                        }
                    }
                    if (!custom) {
                        start();
                    } else {
                        //ask client to build the service with custom command
                        res.json({
                            needbuild: true,
                            service: service
                        });
                    }
                });
            }

            function start() {
                var started = false;
                var svc = require('./proc').start(service, function (stdout) {
                    stdout = stdout.replace(/\n$/, '').replace(/\n/g, '\n' + service.name + ' >  ');
                    console.log(service.name + ' >  ' + stdout);
                    global.io.emit("log", {
                        id: service.id,
                        log: (ansi(stdout) + "<br/>").replace(/\n/g, '<br/>')
                    });
                    console.log('started', started);
                    if (!started) {
                        Model.findByIdAndUpdate(service.id, { //update service status into mongodb
                            running: true
                        }, function (err, doc) {
                            if (err) {
                                console.log(err);
                            } else {
                                console.log(doc)
                                if (doc) {
                                    global.io.emit("service_started", service);
                                    started = true;
                                }
                            }
                        });
                    }
                });
                pid.push({ //add the service to temp array
                    model: service,
                    pid: svc.pid,
                    service: svc
                });
                svc.on('close', function (code) {
                    console.log('\n--------------------------------------------------------'.red)
                    console.log((service.name + " has died with code " + code).red);
                    console.log('--------------------------------------------------------\n'.red)
                    pid.forEach(function (entry, index) {
                        if (entry.model.id === service.id) {
                            pid.splice(index, 1);
                        }
                    });
                    Model.findByIdAndUpdate(service.id, {
                        running: false
                    }, function (err, doc) {
                        if (err) {
                            console.log(err);
                        } else {
                            started = false;
                            global.io.emit("service_died", service);
                        }
                    });
                });
                // res.send(svc.pid);
                res.json({
                    service: service
                });
            }
        } else {
            console.log("  > Nimble: Refusing To Start ".red + (req.params.id).red + " Because it is already running".red)
        }
    },
    // Stops A Service By It's ID (HTTP DELETE) path : '/execute/:id',
    StopService: function (req, res) {
        var response = "could not find the process";
        var async = require('async');
        async.parallel({
            one: function (callback) {
                pid.forEach(function (entry, index) {
                    if (entry.model.id === req.params.id) {
                        entry.service.kill('SIGINT');
                        pid.splice(index, 1);
                        response = "ok";
                    }
                });
                callback(null, true);
            },
            two: function (callback) {
                Model.findByIdAndUpdate(req.params.id, {
                    running: false
                }, function (err, doc) {
                    if (err) {
                        console.log(err);
                    } else {
                        if (doc) {
                            if (doc.stopcmd) {
                                require('./proc').exec(doc);
                                global.io.emit("service_died", doc);
                            }
                        }
                        response = "ok";
                    }
                    callback(null, true);
                });
            }
        }, function (err, results) {
            if (results.one && results.two) {
                res.send(response);
            }
        });
    },
    getLive: function (req, res) {
        var response = [];
        pid.forEach(function (entry) {
            response.push(entry.model);
        });
        res.json(response);
    },
    countLive: function (req, res) {
        res.json({
            process: pid.length,
            group: 0 // coming soon
        });
    },
    startAll: function (req, res) {
        Model.find(function (err, models) {
            models.forEach(function (service) {
                if (!serviceIsRunning(service.id)) {
                    var svc = require('./proc').start(service, function (stdout) {
                        stdout = stdout.replace(/\n$/, '').replace(/\n/g, '\n' + service.name + ' >  ');
                        console.log(service.name + ' >  ' + stdout);
                    });
                    svc.on('close', function (code) {
                        console.log('\n--------------------------------------------------------'.red)
                        console.log((service.name + " has died with code " + code).red);
                        console.log('--------------------------------------------------------\n'.red)
                        pid.forEach(function (entry, index) {
                            if (entry.model.id === service.id) {
                                pid.splice(index, 1);
                            }
                        });
                    });
                    pid.push({
                        model: service,
                        pid: svc.pid,
                        service: svc
                    });
                } else {
                    console.log("  > Nimble: Refusing To Start ".red + (service.name).red + " Because it is already running".red)
                }
            });
            res.send("ok")
        });
    },
    stopAll: function (req, res) {
        pid.forEach(function (entry) {
            entry.service.kill('SIGINT');
        });
        pid = [];
        res.send("ok");
    },
    dashboard: function (req, res) {
        Model.find(function (error, services) {
            res.json({
                processes: services,
                running: pid.map(function (process) {
                    return process.model
                }),
                runningCount: services.filter(function (service) {
                    if (service.running) {
                        return service;
                    }
                }).length
            });
        });
    }
}

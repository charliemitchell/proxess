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
};

function updateProcessPID(id, pid) {
    Model.findById(id).exec(function (err, process) {
        if (process) {
            process.pid = pid;
            process.save(function (err, doc) {
                console.log(require('util').format('Update PID for process %s succeeded', doc.name));
            });
        }
    });
};
var ansi = require('ansi-html'),
    proc = require('./proc');
setInterval(function () {
    Model.find({
        pid: {
            "$exists": true,
            "$ne": ""
        }
    }).exec(function (err, processes) {
        if (processes.length > 0) {
            var process;
            for (var i = 0; i < processes.length; i++) {
                process = processes[i];
                proc.pmem(process, function (pct) {
                    // console.log('pct', pct);
                    process.pmem = pct;
                    global.io.emit('pmem', {
                        id: process.id,
                        mem: pct
                    });
                });
                proc.pcpu(process, function (pct) {
                    process.pcpu = pct;
                    global.io.emit('pcpu', {
                        id: process.id,
                        cpu: pct
                    });
                });
            }
        }
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
    checkStatus: function (req, res) {
        Model.findById(req.params.id, function (err, doc) {
            if (err) {
                console.log(err);
            } else {
                if (doc) {
                    if (doc.checkcmd) {
                        require('./proc').exec(doc.checkcmd, doc.cwd, function (alive) {
                            res.status(200).json({
                                status: alive
                            })
                        });
                    } else {
                        res.status(200).json({
                            status: false
                        })
                    }
                } else {
                    res.status(200).json({
                        status: false
                    })
                }
            }
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
                }, function (err, process) {
                    service = process[0];
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
                var svc = require('./proc').start(service, function (stdout) {
                    stdout = stdout.replace(/\n$/, '').replace(/\n/g, '\n' + service.name + ' >  ');
                    console.log(service.name + ' >  ' + stdout);
                    global.io.emit("log", {
                        id: service.id,
                        log: (ansi(stdout) + "<br/>").replace(/\n/g, '<br/>')
                    });
                });

                // Update PID to database
                updateProcessPID(req.params.id, svc.pid);

                svc.on('close', function (code) {
                    console.log('\n--------------------------------------------------------'.red)
                    console.log((service.name + " has died with code " + code).red);
                    console.log('--------------------------------------------------------\n'.red)

                    // Update PID to database
                    updateProcessPID(req.params.id, '');

                });
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
        Model.findById(req.params.id, function (err, doc) {
            if (err) {
                console.log(err);
            } else {
                if (doc) {
                    if (doc.stopcmd) {
                        require('./proc').exec(doc.stopcmd, doc.cwd, function (status) {
                            // Update PID to database
                            updateProcessPID(req.params.id, '');
                        });
                    } else if (doc.pid) {
                        require('./proc').exec(doc, function (status) {
                            // Update PID to database
                            updateProcessPID(req.params.id, '');
                        });
                    }
                }
                res.send(response);
            }
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
                            // Update PID to database
                        updateProcessPID(req.params.id, '');
                    });

                    // Update PID to database
                    updateProcessPID(service.id, svc.pid);

                } else {
                    console.log("  > Nimble: Refusing To Start ".red + (service.name).red + " Because it is already running".red)
                }
            });
            res.send("ok")
        });
    },
    stopAll: function (req, res) {
        // Replace by process from model
        // pid.forEach(function (entry) {
        //     entry.service.kill('SIGINT');
        // });
        // pid = [];
        res.send("ok");
    },
    dashboard: function (req, res) {
        Model.find(function (error, services) {
            res.json({
                processes: services
            });
        });
    }
}

var Model = require('./model'),
    _ = require('nimbleservice').lodash,
    pid = [],
    fs = require('fs'),
    path = require('path'),
    ansi = require('ansi-html'),
    proc = require('./proc'),
    mkdirp = require('mkdirp');

require('nimbleservice').colors;

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

function updateProcessPID(id, pid, log) {
    Model.findById(id).exec(function (err, process) {
        if (err) {
            console.log(err);
        }
        if (process) {
            process.pid = pid;
            if (log) {
                process.logs = process.logs || [];
                var existed = process.logs.filter(function (item) {
                    return item.pid == pid;
                });

                if (existed.length == 0) {
                    process.logs.push({
                        pid: pid,
                        logs: log
                    });
                } else {
                    // console.log('shoudl be append')

                    // process.logs = process.logs.map(function(item) {
                    //     if (item.pid == pid) {
                    //         // item.logs += log;
                    //         item.logs += 'aaaaaaaaaaaaaaaaa';
                    //         // console.log('log.logs', item.logs);
                    //     }
                    //     return item;
                    // });
                }
            }
            // console.log(JSON.stringify(process.logs));
            process.save(function (err, doc) {
                if (err) {
                    console.log(err);
                } else {
                    console.log(require('util').format('Update PID for process %s succeeded', doc.name));
                }
            });
        }
    });
};

function onError(err, res) {
    res.status(500).json({
        err: err
    });
}

module.exports = {
    GET: function (req, res) {
        var search = req.query.search;
        if (search) {
            Model.find({ //full text search
                name: new RegExp(search, "i")
            }, function (err, services) {
                if (err) {
                    onError(err, res);
                } else {
                    res.status(200).json(services);
                }
            });
        } else {
            Model.find(function (err, services) {
                if (err) {
                    onError(err, res);
                } else {
                    res.status(200).json(services);
                }
            });
        }
    },

    findOne: function (req, res) {
        Model.findOne({
            _id: req.params.id
        }).lean().exec(function (err, item) {
            if (err) {
                onError(err, res);
            } else {
                var filepath = path.join(item.cwd, 'build.sh');
                if (item.cwd && fs.existsSync(filepath)) {
                    item.file = fs.readFileSync(filepath, 'utf8');
                }
                res.status(200).json(item);
            }
        });
    },

    POST: function (req, res) {
        new Model(req.body).save(function (err, doc) {
            if (err) {
                onError(err, res);
            } else {
                if (doc.file) {
                    var filepath = path.join(doc.cwd, 'build.sh');
                    if (!fs.existsSync(doc.cwd)) {
                        mkdirp.sync(doc.cwd);
                    }
                    fs.writeFile(filepath, doc.file, function (err) {
                        if (err) {
                            onError(err, res);
                        } else {
                            res.status(200).json(doc);
                        }
                    });
                } else {
                    res.status(200).json(doc);
                }
            }
        });
    },

    // Updates A Service Entry
    PUT: function (req, res) {
        Model.findOne({
            _id: req.params.id
        }).remove(function (err) {
            if (err) {
                onError(err, res);
            } else {
                var service = req.body;
                service._id = req.params.id;
                for (var i = 0; i < service.args.length; i++) {
                    service.args[i] = service.args[i].trim();
                }
                new Model(service).save(function (err, item) {
                    if (err) {
                        onError(err, res);
                    } else {
                        console.log(req.body)
                        if (service.file) {
                            if (!fs.existsSync(service.cwd)) {
                                mkdirp.sync(service.cwd);
                            }
                            fs.writeFile(path.join(service.cwd, 'build.sh'), service.file, function (err) {
                                if (err) {
                                    onError(err, res);
                                } else {
                                    res.status(200).json(item);
                                }
                            });
                        } else {
                            res.status(200).json(item);
                        }
                    }
                });
            }
        });
    },
    // DELETES A Service From The Service List
    DELETE: function (req, res) {
        Model.findOne({
            _id: req.params.id
        }).remove(function (err) {
            if (err) {
                onError(err, res);
            } else {
                res.status(200).json({
                    status: true
                });
            }
        });
    },
    checkStatus: function (req, res) {
        Model.findById(req.params.id, function (err, doc) {
            if (err) {
                res.status(200).json({
                    status: false
                });
            } else {
                if (doc) {
                    if (doc.checkcmd) {
                        require('./proc').exec(doc.checkcmd, doc.cwd, function (alive) {
                            res.status(200).json({
                                status: alive
                            });
                        });
                    } else {
                        res.status(200).json({
                            status: false
                        });
                    }
                } else {
                    res.status(200).json({
                        status: false
                    });
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
                    if (err) {
                        onError(err, res);
                    } else {
                        service = process[0];
                        if (service) {
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
                                res.status(200).json({
                                    needbuild: true,
                                    service: service
                                });
                            }
                        } else {
                            onError('Service not found', res);
                        }
                    }
                });
            }

            function start() {
                var log, pid;
                var svc = require('./proc').start(service, function (stdout) {
                    stdout = stdout.replace(/\n$/, '').replace(/\n/g, '\n' + service.name + ' >  ');
                    console.log(service.name + ' >  ' + stdout);
                    global.io.emit("log", {
                        id: service.id,
                        log: (ansi(stdout) + "<br/>").replace(/\n/g, '<br/>')
                    });
                    log = stdout;
                    // updateProcessPID(req.params.id, pid, log);
                });
                pid = svc.pid;
                // Update PID to database
                updateProcessPID(req.params.id, svc.pid);

                svc.on('close', function (code) {
                    console.log('\n--------------------------------------------------------'.red)
                    console.log((service.name + " has died with code " + code).red);
                    console.log('--------------------------------------------------------\n'.red)

                    // Update PID to database
                    updateProcessPID(req.params.id, '');

                });
                res.status(200).json({
                    service: service
                });
            }
        } else {
            console.log("  > Nimble: Refusing To Start ".red + (req.params.id).red + " Because it is already running".red)
        }
    },

    // Stops A Service By It's ID (HTTP DELETE) path : '/execute/:id',
    StopService: function (req, res) {
        Model.findById(req.params.id, function (err, doc) {
            if (err) {
                onError(err, res);
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
                    res.status(200).json({
                        status: true
                    });
                } else {
                    onError('Service not found', res);
                }
            }
        });
    },
    dashboard: function (req, res) {
        var search = req.query.search;
        if (search) {
            Model.find({ //full text search
                name: new RegExp(search, "i"),
                hidden: false
            }, function (err, services) {
                if (err) {
                    onError(err, res);
                } else {
                    res.status(200).json({
                        processes: services
                    });
                }
            });
        } else {
            Model.find({
                hidden: false
            }, function (err, services) {
                if (err) {
                    onError(err, res);
                } else {
                    res.status(200).json({
                        processes: services
                    });
                }
            });
        }
    }
}

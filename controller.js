require('nimbleservice').colors;

var Model = require('./model').process;
var Note  = require('./model').note;
var _ = require('nimbleservice').lodash,
    pid = [];

function serviceIsRunning (id) {
    var i = 0;

    for (i; i < pid.length; i +=1) {
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
      global.io.emit('pmem', {id : process.model.id, mem : pct});
    });

    proc.pcpu(process.service, function (pct) {
      process.pcpu = pct;
      global.io.emit('pcpu', {id : process.model.id, cpu : pct});
    });

  });

}, 5000);



module.exports = {

    // GETS All Services from the database
    GET : function (req, res) {
        Model.find(function (error, services) {
            res.json(services);
        });
    },

    // GETS A Service from the database
    findOne : function (req, res) {
         Model.find({_id: req.params.id},function (a,b) {
            res.send(b[0]);
        });
    },

    // Creates A New Service
    POST : function (req, res) {
        new Model(req.body).save(function (err, doc) {
            if (err) {
                console.log('oops! Could not save the model'.red);
                res.json({auth : true, error : "Error saving the model"})
            } else {
                res.json({auth : true, results : doc });
            }

        });
    },

    // Updates A Service Entry
    PUT : function (req, res) {

        Model.findOne({_id: req.params.id}).remove(function () {
            req.body._id = req.params.id;
            new Model(req.body).save();
            res.send(req.body);
        });
    },

    // DELETES A Service From The Service List
    DELETE : function (req, res) {
        Model.findOne({_id: req.params.id}).remove(function () {
        });
        res.send(req.params.id)
    },

    // Gets Stats on All Services
    stats : function (req, res) {
        res.json(pid.map(function (process) {
            return {
                model : process.model,
                pcpu : process.pcpu,
                pmem : process.pmem
            }
        }));
    },

    // Gets Stats on Single Service
    findStat : function (req, res) {
        Model.find({_id: req.params.id},function (a,b) {
            res.json({
                stat: 0,
                process : b
            })
        });
    },

    // Starts A Service By It's ID (HTTP POST) path : '/execute/:id',
    StartService : function (req, res) {
        if (!serviceIsRunning(req.params.id) ) {
            Model.find({_id: req.params.id},function (a,b) {
                var service = b[0],
                    svc = require('./proc').start(service, function (stdout) {
                        stdout = stdout.replace(/\n$/, '').replace(/\n/g, '\n' + b[0].name + ' >  ');
                        console.log(b[0].name + ' >  ' +stdout);
                        global.io.emit("log", {
                            id : service.id,
                            log : (ansi(stdout) + "<br/>").replace(/\n/g, '<br/>')
                        });
                    });

                pid.push({
                    model : service,
                    pid : svc.pid,
                    service : svc
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
                    global.io.emit("service_died", service);
                });

                res.json(svc.pid);
                global.io.emit("service_started", service);
            });

        } else {
            console.log("  > Nimble: Refusing To Start ".red + (req.params.id).red + " Because it is already running".red)
        }
    },

    // Stops A Service By It's ID (HTTP DELETE) path : '/execute/:id',
    StopService : function (req, res) {
        var response = "could not find the process";

        pid.forEach(function (entry, index) {
            if (entry.model.id === req.params.id) {
                entry.service.kill('SIGINT');
                pid.splice(index, 1);
                response = "ok";
            }
        });

        res.send(response);
    },

    getLive : function (req, res) {
        var response = [];

        pid.forEach(function (entry) {
            response.push(entry.model);
        });

        res.json(response);
    },

    countLive : function (req, res) {
        res.json({
            process : pid.length,
            group : 0 // coming soon
        });
    },

    startAll : function (req, res) {
        Model.find(function (err, models) {
            models.forEach(function (service) {

                if (! serviceIsRunning(service.id) ) {

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
                        model : service,
                        pid : svc.pid,
                        service : svc
                    });
                } else {
                    console.log("  > Nimble: Refusing To Start ".red + (service.name).red + " Because it is already running".red)
                }
            });

            res.send(200);
        });
    },

    stopAll : function (req, res) {

        pid.forEach(function (entry) {
            entry.service.kill('SIGINT');
        });

        pid = [];
        res.send("ok");
    },

    dashboard : function (req, res) {
        Model.find(function (error, services) {
            res.json({
                processes : services,
                running : pid.map(function (process) { return process.model}),
                runningCount : pid.length
            });
        });
    },

    createNote (req, res) {
      new Note(req.body).save(function (err, doc) {
        if (err) {
          console.log('oops! Could not save the model'.red);
          res.json({error : "Error saving the model"})
        } else {
          res.json(doc);
        }
      });
    },

    getNote (req, res) {
      Note.find({_id: req.params.id},function (a,b) {
       res.send(b[0]);
     });
    },

    getNotes (req, res) {
      Note.find(function (error, services) {
        res.json(services);
      });
    },

    removeNote (req, res) {
      Note.findOne({_id: req.params.id}).remove(function () {
        res.json({ok: 1});
      });
    },

    updateNote (req, res) {
      Note.findOne({_id: req.params.id}).remove(function () {
          req.body._id = req.params.id;
          new Note(req.body).save();
          res.send(req.body);
      });
    }
}

var cp = require('child_process'),
    spawn = cp.spawn,
    exec = cp.exec,
    fork = cp.fork;
// exports.status = function (req, res) {
//     return {
//         logs : logs,
//         stats : stats,
//         status : status
//     };
// };
exports.start = function(proc, stdout) {
    var options = {
        cwd: proc.cwd || undefined
    };
    var process = spawn(proc.command, proc.args, options);
    // var process = spawn('sh', ['build.sh'], {
    //     cwd: '/root/defie/FS/fs-admin-client'
    // });
    process.stdout.setEncoding('utf8');
    process.stdout.on('data', function(chunk) {
        //stdout(chunk.replace(/\[([0-9]*)m/g, ''));
        stdout(chunk);
    });
    return process;
}
exports.exec = function(cmd, cwd, callback) {
    function puts(error, stdout, stderr) {
        if (error) {
            callback(false);
        } else {
            callback(true);
        }
        // console.log('error', error);
        // console.log('stdout', stdout);
        // console.log('stderr', stderr);
        //will be logged on svc.close
    }

    exec(cmd, {
        cwd: cwd
    }, puts);
}
exports.pcpu = function(childSpawn, callback) {
    if (childSpawn) {
        if (childSpawn.pid) {
            exec('ps -p ' + childSpawn.pid + ' -o pcpu', function(error, stdout, stderr) {
                callback(stdout);
            });
        }
    }
}
exports.pmem = function(childSpawn, callback) {
        if (childSpawn) {
            if (childSpawn.pid) {
                exec('ps -p ' + childSpawn.pid + ' -o pmem', function(error, stdout, stderr) {
                    callback(stdout);
                });
            }
        }
    }
    // var processes = {
    //     sync: function() {
    //         var sync = spawn('synchorse', ['sync', '-n', 'Charlie', '-d', '/Users/charlie/ui-development/']);
    //         sync.stdout.setEncoding('utf8');
    //         sync.stdout.on('data', function(chunk) {
    //             console.log(chunk.replace(/(\r?\n)/g, ''));
    //             logs.sync.push(chunk.replace(/\[([0-9]*)m/g, ''));
    //         });
    //         return sync;
    //     },
    //     // compass watch --config  'htdocs/UI/config.rb' --app-dir 'htdocs/UI/'
    //     compass : function () {
    //         var process = spawn('compass', ['watch', '--config', 'htdocs/UI/config.rb', '--app-dir', 'htdocs/UI']);
    //         process.stdout.setEncoding('utf8');
    //         process.stdout.on('data', function(chunk) {
    //             console.log(chunk.replace(/(\r?\n)/g, ''));
    //             logs.compass.push(chunk.replace(/\[([0-9]*)m/g, ''));
    //         });
    //         return process;
    //     },
    //     sailsApi : function () {
    //         var process = fork('../api/app.js', {
    //             cwd : '../api/'
    //         });
    //         process.stdout.setEncoding('utf8');
    //         process.stdout.on('data', function(chunk) {
    //             console.log(chunk.replace(/(\r?\n)/g, ''));
    //             logs.sailsApi.push(chunk.replace(/\[([0-9]*)m/g, ''));
    //         });
    //         return process;
    //     },
    //     filesApi : function () {
    //         var process = fork('../api.file/index.js', {
    //             cwd : '../api.file/'
    //         });
    //         process.stdout.setEncoding('utf8');
    //         process.stdout.on('data', function(chunk) {
    //             console.log(chunk.replace(/(\r?\n)/g, ''));
    //             logs.filesApi.push(chunk.replace(/\[33m/g, '').replace(/\[90m/g, '').replace(/\[39m/g, ''));
    //         });
    //         return process;
    //     },
    //     couchdb : function () {
    //         var process = spawn('sudo', ['-p', 'o', 'couchdb']);
    //         process.stdout.setEncoding('utf8');
    //         process.stdout.on('data', function(chunk) {
    //             console.log(chunk.replace(/(\r?\n)/g, ''));
    //             logs.couchdb.push(chunk.replace(/\[33m/g, '').replace(/\[90m/g, '').replace(/\[39m/g, ''));
    //         });
    //         return process;
    //     },
    //     mongodb : function () {
    //         var process = spawn('sudo', ['-p','o','mongod','-port', '27001']);
    //         process.stdout.setEncoding('utf8');
    //         process.stdout.on('data', function(chunk) {
    //             console.log(chunk.replace(/(\r?\n)/g, ''));
    //             logs.mongodb.push(chunk.replace(/\[33m/g, '').replace(/\[90m/g, '').replace(/\[39m/g, ''));
    //         });
    //         return process;
    //     },
    //     //elasticsearch --config=/usr/local/opt/elasticsearch/config/elasticsearch.yml
    //     elasticSearch : function () {
    //         var process = spawn('elasticsearch', ['--config=/usr/local/opt/elasticsearch/config/elasticsearch.yml']);
    //         process.stdout.setEncoding('utf8');
    //         process.stdout.on('data', function(chunk) {
    //             console.log(chunk.replace(/(\r?\n)/g, ''));
    //             logs.mongodb.push(chunk.replace(/\[33m/g, '').replace(/\[90m/g, '').replace(/\[39m/g, ''));
    //         });
    //         return process;
    //     }
    // }
    // var refreshStats = {
    //     pcpu: function(cp, stat) {
    //         if (cp) {
    //             if (cp.pid) {
    //             exec('ps -p ' + cp.pid + ' -o pcpu', function(error, stdout, stderr) {
    //                 stats[stat].pcpu = stdout;
    //             });
    //             }
    //         }
    //     },
    //     pmem: function(cp, stat) {
    //         if (cp) {
    //             if (cp.pid) {
    //                 exec('ps -p ' + cp.pid + ' -o pmem', function(error, stdout, stderr) {
    //                     stats[stat].pmem = stdout;
    //                 });
    //             }
    //         }
    //     }
    // };
    // var triggers = {
    //     sync : function (trigger) {
    //         if (trigger === "on") {
    //             sync = processes.sync();
    //             status.sync = true;
    //             sync.on('close', function () {
    //                 status.sync = false;
    //             });
    //         } else {
    //             sync.kill('SIGINT');
    //         }
    //     },
    //     compass : function (trigger) {
    //         if (trigger === "on") {
    //             compass = processes.compass();
    //             status.compass = true;
    //             compass.on('close', function() {
    //                 status.compass = false;
    //             });
    //         } else {
    //             compass.kill('SIGINT');
    //         }
    //     },
    //     mongodb : function (trigger) {
    //         if (trigger === "on") {
    //             mongodb = processes.mongodb();
    //             status.mongodb = true;
    //             mongodb.on('close', function() {
    //                 status.mongodb = false;
    //             });
    //         } else {
    //             mongodb.kill('SIGINT');
    //         }
    //     },
    //     couchdb : function (trigger) {
    //         if (trigger === "on") {
    //             couchdb = processes.couchdb();
    //             status.couchdb = true;
    //             couchdb.on('close', function() {
    //                 status.couchdb = false;
    //             });
    //         } else {
    //             couchdb.kill('SIGINT');
    //         }
    //     },
    //     elasticSearch : function (trigger) {
    //         if (trigger === "on") {
    //             elasticSearch = processes.elasticSearch();
    //             status.elasticSearch = true;
    //             elasticSearch.on('close', function() {
    //                 status.elasticSearch = false;
    //             });
    //         } else {
    //             elasticSearch.kill('SIGINT');
    //         }
    //     },
    //     sailsApi : function (trigger) {
    //         if (trigger === "on") {
    //             sailsApi = processes.sailsApi();
    //             status.sailsApi = true;
    //             sailsApi.on('close', function() {
    //                 status.sailsApi = false;
    //             });
    //         } else {
    //             sailsApi.kill('SIGINT');
    //         }
    //     },
    //     filesApi : function (trigger) {
    //         if (trigger === "on") {
    //             filesApi = processes.filesApi();
    //             status.filesApi = true;
    //             filesApi.on('close', function() {
    //                 status.filesApi = false;
    //             });
    //         } else {
    //             filesApi.kill('SIGINT');
    //         }
    //     }
    // };
    // var interval = setInterval(function () {
    //     refreshStats.pcpu(sync, 'sync');
    //     refreshStats.pmem(sync, 'sync');
    //     refreshStats.pcpu(compass, 'compass');
    //     refreshStats.pmem(compass, 'compass');
    //     refreshStats.pcpu(sailsApi, 'sailsApi');
    //     refreshStats.pmem(sailsApi, 'sailsApi');
    //     refreshStats.pcpu(filesApi, 'filesApi');
    //     refreshStats.pmem(filesApi, 'filesApi');
    //     refreshStats.pcpu(couchdb, 'couchdb');
    //     refreshStats.pmem(couchdb, 'couchdb');
    //     refreshStats.pcpu(mongodb, 'mongodb');
    //     refreshStats.pmem(mongodb, 'mongodb');
    //     refreshStats.pcpu(elasticSearch, 'elasticSearch');
    //     refreshStats.pmem(elasticSearch, 'elasticSearch');
    // }, 2000);

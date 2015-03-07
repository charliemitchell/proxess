var momenttz = require('moment-timezone');
exports.fromDate = function (str, format) {
    return str ? momenttz(new Date(str)).tz('America/Los_Angeles').format(format) : "";
};
exports.toDate = function (str, format) {
    return str ? momenttz(new Date(str)).add('d', 1).tz('America/Los_Angeles').format(format) : "";
};
exports.mongoToES = function (modelname, id) {
    var ESclient = global.initESclient();
    var Model = require('./model');
    ESclient.delete({ //delete document in es
        index: modelname + 'idx',
        type: modelname,
        id: id
    }, function (err, response) {
        if (err) {
            console.log(err);
        }
        Model.findById(id, function (err, item) {
            if (err) {
                console.log(err);
            } else {
                var esbody = item;
                esbody._id = item.id;
                ESclient.create({ //create document in es
                    index: modelname + 'idx',
                    type: modelname,
                    id: item.id,
                    body: esbody
                }, function (err, response) {
                    if (err) {
                        console.log(err);
                    }
                });
            }
        });
    });
};
exports.deleteFromES = function (modelname, id) {
    var ESclient = global.initESclient();
    ESclient.delete({
        index: modelname + 'idx',
        type: modelname,
        id: id
    }, function (err, response) {
        //do nothing
    });
};

var Model = require('./model');
require('nimbleservice').colors;
var utils = require('./utils');
module.exports = {
    GET: function (req, res) {
        var ESclient = global.initESclient(),
            string = req.query.string,
            limit = req.query.limit,
            offset = req.query.offset,
            from = req.query.from,
            to = req.query.to,
            queryMore = "";
        if (from) {
            queryMore += " createdat:{" + utils.fromDate(from) + " TO " + utils.toDate(to) + "}";
        }
        var qbody = {
            'query': {
                'query_string': {
                    'query': '*' + string + '*' + queryMore,
                    'fields': ['_all', '_id'],
                    'default_operator': 'AND'
                }
            },
            'sort': {
                'createdat': {
                    'order': 'desc',
                    "ignore_unmapped": true
                }
            }
        };
        var opts = {
            index: 'clientsidx',
            from: offset,
            body: qbody
        };
        if (limit) {
            opts.size = limit;
        }
        var result = {
            auth: true,
            results: [],
            matches: 0
        };
        ESclient.search(opts).then(function (resp) {
            var items = resp.hits.hits,
                newitem;
            result.matches = resp.hits.total;
            for (var i = 0; i < items.length; i++) {
                newitem = items[i]._source;
                result.results.push({
                    "firstname": newitem.firstname,
                    "lastname": newitem.lastname,
                    "company": newitem.company,
                    "phone": newitem.phone,
                    "address": newitem.address,
                    "country": newitem.firstname,
                    "email": newitem.email,
                    "title": newitem.title,
                    "services": newitem.services,
                    "id": newitem.id,
                    "permissions": newitem.permissions
                });
            }
            res.json(result);
        });
    },
    findOne: function (req, res) {
        Model.find({
            _id: req.params.id
        }, function (err, item) {
            if (err) {
                res.json({
                    auth: true,
                    error: "Error saving the model"
                });
            } else {
                res.send({
                    auth: true,
                    results: item
                });
            }
        });
    },
    POST: function (req, res) {
        req.body.createdat = new Date();
        new Model(req.body).save(function (err, item) {
            if (err) {
                res.json({
                    auth: true,
                    error: "Error saving the model"
                })
            } else {
                res.json({
                    auth: true,
                    results: item
                });
                var ESclient = global.initESclient();
                utils.mongoToES('clients', item.id);
            }
        });
    },
    // Using the Upsert method *Works
    PUT: function (req, res) {
        Model.findOne({
            _id: req.params.id
        }).remove(function () {
            req.body._id = req.params.id;
            new Model(req.body).save(function (err, item) {
                if (err) {
                    res.json({
                        auth: true,
                        error: "Error saving the model"
                    })
                } else {
                    res.json({
                        auth: true,
                        results: item
                    });
                    var ESclient = global.initESclient();
                    utils.mongoToES('clients', item.id);
                }
            });
        });
    },
    updatePermission: function (req, res) {
        Model.findOne({
            _id: req.params.id
        }, function (err, item) {
            if (err) {
                res.json({
                    auth: true,
                    error: "Error getting the model"
                });
            } else {
                item.permissions = req.body.permissions;
                item.save(function (err, item) {
                    console.log(item)
                    if (err) {
                        res.json({
                            auth: true,
                            error: "Error getting the model"
                        });
                    } else {
                        res.json({
                            auth: true,
                            results: "Client permissions updated."
                        });
                        utils.mongoToES('clients', item.id);
                    }
                })
            }
        });
    },
    // *works
    DELETE: function (req, res) {
        Model.remove({
            _id: req.params.id
        }, function (err) {
            if (err) {
                res.json({
                    auth: true,
                    error: "Error removing client"
                });
            } else {
                res.send({
                    auth: true,
                    status: true,
                    results: "Client Removed"
                });
                utils.deleteFromES('clients', req.params.id);
            }
        });
    }
}

module.exports = function(app, log) {

    var utils = require('../utils/utils');
    var logMes = require('../utils/logMessages');
    var fms = require('../utils/fmsApi');
    var http = require('http');
    var async = require('async');


    app.get('/dictionaries/assets', function(req, res) {
        var method = "  get[/dictionaries/assets]  ";

        if (typeof req.headers.authorization === 'undefined' || req.headers.authorization === null) {

            return res.status(403).send();
        }
        var ret = {};
        var asyncTasks = [];


        asyncTasks.push(function(cb) {
            fms.getAssetTypes(ret, req.headers.authorization, cb);
        });

        asyncTasks.push(function(cb) {
            fms.getAttrTypes(ret, req.headers.authorization, cb);
        });

        asyncTasks.push(function(cb) {
            fms.getUnitTypes(ret, req.headers.authorization, cb);
        });

        asyncTasks.push(function(cb) {
            fms.getDataTypes(ret, req.headers.authorization, cb);
        });

        async.parallel(asyncTasks, function() {
            return res.status(200).send(ret);
        });
    });

    app.get('/dictionaries/tools', function(req, res) {
        var method = "  get[/dictionaries/tools]  ";

        if (typeof req.headers.authorization === 'undefined' || req.headers.authorization === null) {
            return res.status(403).send();
        }

        fms.getTools(req.headers.authorization, function(data) {
            return res.status(200).send(data);
        });
    });

    app.get('/dictionaries/applications', function(req, res) {
        var method = "  get[/dictionaries/appTypes]  ";

        if (typeof req.headers.authorization === 'undefined' || req.headers.authorization === null) {
            return res.status(403).send();
        }

        fms.getAppTypes(req.headers.authorization, function(data) {
            return res.status(200).send(data);
        });
    });
};
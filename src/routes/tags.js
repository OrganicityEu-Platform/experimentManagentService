module.exports = function(app, log) {

    var utils = require('../utils/utils');
    var logMes = require('../utils/logMessages');
    var tagging = require('../utils/taggingApi');
    var http = require('http');

    app.get('/tags/domains/:exp', function(req, res) {
        var method = "  get[/tags/domains/:exp]  ";
        var subscriber = utils.checkAuth(req.headers);

        if (subscriber === null) {
            return res.status(403).send();
        }

        if (typeof(req.params.exp) === undefined || req.params.exp === null) {
            return res.status(403).send();
        }

        tagging.getAppDomains(subscriber, req.params.exp, success, error);

        function success(data) {
            return res.status(200).send(data);
        }

        function error() {
            return res.status(404).send();
        }
    });

    app.put('/tags/domains/:exp', function(req, res) {
        var method = "  put[/tags/domains/:exp]  ";

        var subscriber = utils.checkAuth(req.headers);

        if (subscriber === null) {
            return res.status(403).send();
        }

        if (typeof(req.params.exp) === undefined || req.params.exp === null) {
            return res.status(403).send();
        }

        var success = function() {};

        var error = function(err) {
        };


        if (typeof(req.body.toAdd) === undefined || req.body.toAdd === null || req.body.toAdd.constructor !== Array ||
            typeof(req.body.toRemove) === undefined || req.body.toRemove === null || req.body.toRemove.constructor !== Array) {
            log.warn(subscriber + method + logMes.badSchema);
            return res.status(400).send();
        }
        for (var i = 0; i < req.body.toAdd.length; i++) {
            tagging.addDomain(subscriber, req.params.exp, req.body.toAdd[i], success, error);
        }


        for (i = 0; i < req.body.toRemove.length; i++) {
            tagging.deleteDomain(subscriber, req.params.exp, req.body.toRemove[i], success, error);
        }

        return res.status(200).send();

    });

    app.get('/tags/domains', function(req, res) {
        var method = "  put[/tags/domains]  ";
        var subscriber = utils.checkAuth(req.headers);


        if (subscriber === null) {
            return res.status(403).send();
        }
        tagging.getAllDomains(success, error);

        function success(data) {
            return res.status(200).send(data);
        }

        function error() {

            return res.status(404).send();
        }
    });
};
module.exports = function(app, log) {

    var Application = require('../models/application');
    var Experiment = require('../models/experiment');

    var utils = require('../utils/utils');
    var logMes = require('../utils/logMessages');

    app.get('/emscheck/experimentowner/:experId/:expId', function(req, res) {
        if (typeof req.params.experId === 'undefined' || req.params.experId === null || typeof req.params.expId === 'undefined' || req.params.expId === null) {
            return res.status(400).send();
        }

        var search = { experimenterIds: req.params.experId, experimentId: req.params.expId };
        Experiment.findOne(search)
            .exec(function(err, item) {
                if (err || item === null) {
                    return res.status(404).send();
                }
                return res.status(200).send();
            });

    });

    app.get('/emscheck/experimentrunning/:expId', function(req, res) {
        if (typeof req.params.expId === 'undefined' || req.params.expId === null) {
            return res.status(400).send();
        }

        Experiment.findById(req.params.expId)
            .exec(function(err, item) {
                if (err || item === null) {
                    return res.status(404).send();
                }

                try {
                    var init = new Date(item.startDate);
                    var end = new Date(item.endDate);
                    var now = new Date();

                    if (now >= init && now <= end && item.status === 'running') {
                        return res.status(200).send();    
                    }
                    return res.status(404).send();
                } catch(e) {
                    return res.status(404).send();
                }
                
            });
    });

    app.get('/emscheck/application-experiment/:expId/:appId', function(req, res) {
        if (typeof req.params.expId === 'undefined' || req.params.expId === null || 
            typeof req.params.appId === 'undefined' || req.params.appId === null) {
            return res.status(400).send();
        }

        if (req.params.appId === process.env.EMS_ID) {
            return res.status(200).send();
        }

        var search = { applicationId: req.params.appId, experimentId: req.params.expId };
        Application.findOne(search)
            .exec(function(err, item) {
                if (err || item === null) {
                    return res.status(404).send();
                }
                return res.status(200).send();
            });
    });

    app.get('/emscheck/assets-public/:expId', function(req, res) {
        if (typeof req.params.expId === 'undefined' || req.params.expId === null ) {
            return res.status(400).send();
        }

        Experiment.findById(req.params.expId)
            .exec(function(err, item) {
                if (err || item === null) {
                    return res.status(404).send();
                }
                if (item.assetsPublic === true) {
                    console.log(item)
                    return res.status(200).send();
                } else {
                    return res.status(404).send();
                }
                
            });
    });

    app.get('/emscheck/participant-experiment/:parId/:expId', function(req, res) {
        if (typeof req.params.expId === 'undefined' || req.params.expId === null || typeof req.params.parId === 'undefined' || req.params.parId === null) {
            return res.status(400).send();
        }
        return res.status(404).send();
    });

};
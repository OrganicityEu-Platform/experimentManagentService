module.exports = function(app, log) {

    var Application = require('../models/application');

    var utils = require('../utils/utils');
    var logMes = require('../utils/logMessages');

    var seAPI = require('../utils/seAPI');
    var Experiment = require('../models/experiment');

    app.get('/experiments/:exp/applications', function(req, res) {
        var method = "  get[/experiments/:exp/applications]  ";

        var subscriber = utils.checkAuth(req.headers);
        if (subscriber === null) {
            log.warn(method + logMes.badToken);
            return res.status(403).send();
        }

        if (typeof(req.params.exp) === undefined || req.params.exp === null) {
            return res.status(403).send();
        }

        Application.find({ experimenterIds: subscriber, experimentId: req.params.exp })
            .select(utils.select)
            .exec(function(err, apps) {
                if (err) {
                    return res.status(403).send();
                }
                return res.status(200).send(apps);
            });
    });

    app.get('/allapplications', function(req, res) {
        var method = "  get[/applications/all]  ";
        Application.find({ })
            .exec(function(err, apps) {
                if (err) {
                    return res.status(403).send();
                }
                return res.status(200).send({applications: apps});
            });
    });

    app.post('/experiments/:exp/applications', function(req, res) {
        var method = "  post[/experiments/:exp/applications]  ";


        var subscriber = utils.checkAuth(req.headers);
        if (subscriber === null) {
            return res.status(403).send();
        }

        if (typeof(req.params.exp) === undefined || req.params.exp === null) {
            return res.status(403).send();
        }

        var search = {experimentId: req.params.exp, experimenterIds: subscriber};
        Experiment.findOne(search)
        .exec(function(err, item){
            if (err || item == null){
                return res.status(404).send();
            }
            req.body.experimenterIds = item.experimenterIds;    
            req.body.experimentId = req.params.exp;

            var app = new Application(req.body);
            app.applicationId = app._id;
            var location = "";
            app.save(function(err, newApp) {
                if (err) {
                    return res.status(409).send(err);
                }
                location = 'experiments/' + req.params.exp + '/applications/' + newApp._id;
                req.body.applicationId = String(newApp._id);

                if (req.body.type === 'smartphone') {
                    var email = utils.getEmail(req.headers);

                    req.body.userId = email;
                    req.body.experimenterId = email;
                    
                    seAPI.createExperiment(req.body, req.headers.authorization, function(ret) {
                        if (ret) {
                            return res.status(201).location(location).send();
                        } 
                        app.remove()
                        return res.status(409).location().send();

                    });
                } else {
                    return res.status(201).location(location).send();
                }
            });
        }); 
    });

    app.get('/experiments/:exp/applications/:appId', function(req, res) {
        var method = "  get[/experiments/:exp/applications/:appId]  ";

        var subscriber = utils.checkAuth(req.headers);
        if (subscriber === null) {
            return res.status(403).send();
        }

        if (typeof(req.params.exp) === undefined || req.params.exp === null ||
            typeof(req.params.appId) === undefined || req.params.appId === null) {
            return res.status(403).send();
        }

        var search = { applicationId: req.params.appId, experimentId: req.params.exp, experimenterIds: subscriber };
        Application.findOne(search)
            .select(utils.select)
            .exec(function(err, app) {
                if (err || app === null) {
                    return res.status(404).send();
                }
                return res.status(200).send(app);
            });
    });

    app.put('/experiments/:exp/applications/:appId', function(req, res) {
        var method = "  get[/experiments/:exp/applications/:appId]  ";

        var subscriber = utils.checkAuth(req.headers);
        if (subscriber === null) {
            return res.status(403).send();
        }

        if (typeof(req.params.exp) === undefined || req.params.exp === null ||
            typeof(req.params.appId) === undefined || req.params.appId === null) {
            return res.status(403).send();
        }

        var search = { applicationId: req.params.appId, experimentId: req.params.exp, experimenterIds: subscriber };
        utils.filterByKeys(req.body, utils.readOnly.APP);


        Application.findOneAndUpdate(search, req.body, utils.updateOptions)
            .select(utils.select)
            .exec(function(err, app) {
                if (err || res === null) {
                    return res.status(404).send();
                }
                if (req.body.type === 'smartphone') {
                    var email = utils.getEmail(req.headers);
                    req.body.experimenterId = email;
                    req.body.applicationId = req.params.appId;
                    seAPI.updateExperiment(req.body, req.headers.authorization, function(ret) {
                        return res.status(200).send();
                    });
                } else {
                    return res.status(200).send();
                }
            });
    });

    app.delete('/experiments/:exp/applications/:appId', function(req, res) {
        var method = "  delete[/experiments/:exp/applications/:appId]  ";

        var subscriber = utils.checkAuth(req.headers);
        if (subscriber === null) {
            return res.status(403).send();
        }

        if (typeof(req.params.exp) === undefined || req.params.exp === null ||
            typeof(req.params.appId) === undefined || req.params.appId === null) {
            return res.status(403).send();
        }

        var search = { applicationId: req.params.appId, experimentId: req.params.exp, experimenterIds: subscriber };
        Application.findOne(search)
            .exec(function(err, app) {
                if (err || app === null) {
                    return res.status(404).send();
                }
                if (app.type === 'smartphone') {
                    seAPI.removeExperiment(app.applicationId, req.headers.authorization, function(ret) {
                        if (ret) {
                            app.remove();
                            return res.status(200).send();
                        } 
                        return res.status(401).send();
                        
                    });
                } else {
                    app.remove();
                    return res.status(200).send();
                }
            });
    });
};
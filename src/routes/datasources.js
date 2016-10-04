module.exports = function(app, log) {

    var DataSource = require('../models/datasource');

    var utils = require('../utils/utils');
    var logMes = require('../utils/logMessages');

    app.get('/experiments/:exp/datasources', function(req, res) {
        var method = '  get[/experiments/:exp/datasources]  ';

        var subscriber = utils.checkAuthUnsafe(req.headers);
        if (subscriber === null) {
            return res.status(403).send();
        }

        if (typeof(req.params.exp) === undefined || req.params.exp === null) {
            return res.status(403).send();
        }

        var search = { experimenterIds: subscriber, experimentId: req.params.exp };
        DataSource.findOne(search)
            .select(utils.select)
            .exec(function(err, item) {
                if (err) {
                    return res.status(403).send();
                }
                return res.status(200).send(item);
            });
    });

    app.put('/experiments/:exp/datasources', function(req, res) {
        var method = '  put[/experiments/:exp/datasources]  ';

        var subscriber = utils.checkAuth(req.headers);
        if (subscriber === null) {
            return res.status(403).send();
        }

        if (typeof(req.params.exp) === undefined || req.params.exp === null) {
            return res.status(403).send();
        }

        utils.filterByKeys(req.body, utils.readOnly.DS);
        DataSource.update({ experimenterIds: subscriber, experimentId: req.params.exp },
                req.body, utils.updateOptions)
            .select(utils.select)
            .exec(function(err, ds) {
                if (err || ds === null) {
                    return res.status(404).send();
                }
                return res.status(200).send();
            });
    });
};

module.exports = function(app, log) {

    var utils = require('../utils/utils');
    var logMes = require('../utils/logMessages');
    var api = require('../utils/seAPI');

    app.get('/se/plugin', function(req, res) {
        var method = '  get[/se/plugins]  ';

        var subscriber = utils.checkAuth(req.headers);
        if (subscriber === null) {
            return res.status(403).send();
        }

        api.getPlugins(req.headers.authorization, function(data) {
            return res.status(200).send(data);
        });

    });

};
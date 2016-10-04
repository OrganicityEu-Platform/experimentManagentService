module.exports = function(app, log) {

    var utils = require('../utils/utils');
    var logMes = require('../utils/logMessages');
    var api = require('../utils/orionAPI');
    var uriTemplates = require('uri-templates');
    var at = require('../utils/accessToken');

    app.get('/experiments/:exp/devices', function(req, res) {
        var method = '  get[/experiments/:exp/devices]  ';
        var subscriber = utils.checkAuth(req.headers);


        if (subscriber === null) {
            return res.status(403).send();
        }

        if (typeof(req.params.exp) === undefined || req.params.exp === null) {
            return res.status(403).send();
        }


        //api.getDevices(req.params.exp, function(data) {
        api.getDevices('cf2c1723-3369-4123-8b32-49abe71c0e57', function(data) {          
            if (data === null) {
                return res.status(404).send();
            }
            return res.status(200).send(data);
        });

    });

    app.post('/experiments/:exp/devices', function(req, res) {
        var method = '  post[/experiments/:exp/devices]  ';
         var subscriber = utils.checkAuth(req.headers);

         if (subscriber === null) {

             return res.status(403).send();
         }

         if (typeof(req.params.exp) === undefined || req.params.exp === null) {

             return res.status(403).send();
         }
        
         var template = uriTemplates("urn:oc:entity:experimenters:{experId}:{expId}:{asset*}");
         try {
              if (!req.body.id) {
                  return res.status(403).send();
              }
              var params = template.fromUri(req.body.id);
              if (params.experId !== subscriber || params.expId !== req.params.exp) {
                  return res.status(403).send();
              }
         } catch (e) {
             return res.status(403).send();
        }


        api.postDevice(req.body, req.headers.authorization, req.params.exp, function(data) {
            if (!data) {

                return res.status(409).send();
            }
            return res.status(201).send(data);
        });
    });

};
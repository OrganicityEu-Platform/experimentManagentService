module.exports = function(app, log) {

    var Invitation = require('../models/invitations');
    var Experiment = require('../models/experiment');

    var utils = require('../utils/utils');
    var invEmail = require('../utils/invitations');
    var async = require('async');

    function filterByExpId (array, id) {
        for (var i = 0; i < array.length; i++) {
            if (JSON.stringify(array[i].experimentId) === JSON.stringify(id)) {
                return array[i];
            }
        }
        return null;
    };

    function extractEmails (emails)
    {
        return emails.match(/([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9._-]+)/gi);
    }

    app.get('/invitations/:exp', function(req, res) {
        var method = '  get[/experiments/:exp/datasources]  ';
        console.log('HERE!!')
        var subscriber = utils.checkAuthUnsafe(req.headers);
        if (subscriber === null) {
            return res.status(403).send();
        }

        if (typeof(req.params.exp) === undefined || req.params.exp === null) {
            return res.status(403).send();
        }

        var search = { experimentId: req.params.exp };
        Invitation.find(search)
        .select(utils.select)
        .exec(function(err, items) {
            if (err) {
                return res.status(403).send();
            }
            return res.status(200).send({invitations: items});
        });
    });

    app.post('/invitations/:exp', function(req, res) {
        var method = '  post[/invitations]  ';

        var subscriber = utils.checkAuth(req.headers);
        if (subscriber === null) {
            return res.status(403).send();
        }

        if (typeof(req.params.exp) === undefined || req.params.exp === null) {
            return res.status(403).send();
        }

        var emails = extractEmails(req.body.emails);
        invEmail.sendInvitations(req.body.emails, req.body.name, req.body.description, function (ret) {
            if (ret === null) {
                return res.status(404).send();
            }
            var asyncTasks = [];
            for (var i = 0; i < emails.length; i++) {
                var item = new Invitation();
                item.experimentId = req.params.exp;
                item.email = emails[i];   
                item.description = req.body.description;   
                item.name = req.body.name;   
                asyncTasks.push(function(cb) {item.save(function (err, newItem) {cb();})});
                async.parallel(asyncTasks, function() {return res.status(200).send();});
            }
        });
    });
    // take the invitation of a participant with the experiments
    app.get('/par-invitations', function(req, res) {
         var method = '  get[/invitations]  ';
        var subscriber = utils.checkAuth(req.headers);

         if (subscriber === null) {
             return res.status(403).send();
         }
         var email = utils.getEmail(req.headers);
         var search = { email: email };
         Invitation.find(search)
         .exec(function(err, items) {
            if (err) {
                return res.status(404).send();
            }       

            return res.status(200).send(items)
         });
     });


    app.put('/par-invitations', function(req, res) {
         var subscriber = utils.checkAuth(req.headers);
         if (subscriber === null) {
             return res.status(403).send();
         }

         var email = utils.getEmail(req.headers);
         var search = { email: email };

         Invitation.find(search)
         .exec(function(err, items) {
            if (err) {
                return res.status(404).send();
            }       
            var asyncTasks = [];
            for (var i = 0; i < items.length; i++) {
                var aux = filterByExpId(req.body, items[i].experimentId);
                if (aux !== null) {
                    items[i].state = aux.state;
                }
            }
            var asyncTasks = [];
            for (var i = 0; i < items.length; i++) {
                items[i].save (); 
            }
            
            return res.status(200).send();
        });
    });

};

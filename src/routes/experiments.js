module.exports = function(app, log, multipartyMiddleware) {
    var fs = require('fs');
    var Experiment = require('../models/experiment');
    var DataSource = require('../models/datasource');
    var Application = require('../models/application');

    var utils = require('../utils/utils');
    var logMes = require('../utils/logMessages');
    var tagging = require('../utils/taggingApi');
    var path = require('path');
    var seAPI = require('../utils/seAPI');
    var async = require('async');
    var tokenAPI = require('../utils/accessToken');

    app.get('/experiments', function(req, res) {
        var method = "  get[/experiments]  ";

        var subscriber = utils.checkAuth(req.headers);
        if (subscriber === null) {
            return res.status(403).send();
        }

        Experiment.find({ experimenterIds: subscriber })
            .select(utils.select)
            .exec(function(err, exps) {
                if (err) {
                    return res.status(404).send(err);
                }
                return res.status(200).send({ experiments: exps });
            });
    });

    app.get('/allexperiments', function(req, res) {
        Experiment.find({ })
            .exec(function(err, apps) {
                if (err) {
                    return res.status(403).send();
                }
                return res.status(200).send({experiments: apps});
            });
    });

    app.post('/experiments/addexperimenter/:expId/:email', function(req, res) {
         var method = "  post[/addexperimenter/:exp/:email]  ";

         var subscriber = utils.checkAuth(req.headers);
         if (subscriber === null) {
             return res.status(403).send();
         }

        // to change the IDS in the experiment, selected assets and applications 

        tokenAPI.getIdFromEmail (req.params.email, function (newId) {
            if (newId === null) {
                return res.status(404).send();
            }

            var search = {experimenterIds: subscriber, experimentId: req.params.expId};
            var asyncTasks = [];

        asyncTasks.push(function(cb) {
            Experiment.findOne(search)
            .exec(function(err, item) {
                if(err) { 
                    return cb();
                }
                if (item !== null && item.experimenterIds.indexOf(newId) < 0) {
                    item.experimenterIds.push(newId);
                    item.save();
                }
                return cb();
            });
        });

        
        asyncTasks.push(function(cb) {
            Application.find(search)
                .exec(function(err, apps) {
                if(err) {return cb();}
                if (apps !== null) {
                    for (i=0; i<apps.length; i++) {
                        if (apps[i].experimenterIds.indexOf(newId) < 0)
                        {
                            apps[i].experimenterIds.push(newId);
                            apps[i].save()    
                        }
                    }
                }
                return cb();
            });
        });

        asyncTasks.push(function(cb) {
            DataSource.findOne(search)
            .exec(function(err, item) {
                if(err) {return cb()}
                if (item !== null && item.experimenterIds.indexOf(newId) < 0) {
                    item.experimenterIds.push(newId);
                    item.save();
                }
                return cb()
            });
        });                

        async.parallel(asyncTasks, function() {
            return res.status(200).send();
        }); 
    });    

        });
        

    app.post('/experiments/removeexperimenter/:expId/:experId', function(req, res) {
         var method = "  post[/deleteexperimenter/:expId/:experId]  ";

         var subscriber = utils.checkAuth(req.headers);
         if (subscriber === null) {
             return res.status(403).send();
         }

        // to change the IDS in the experiment, selected assets and applications 
        var search = {experimenterIds: subscriber, experimentId: req.params.expId};
        var asyncTasks = [];

        asyncTasks.push(function(cb) {
            Experiment.findOne(search)
            .exec(function(err, item) {
                if(err) { 
                    return cb()
                }
                if (item !== null){
                    var idx = item.experimenterIds.indexOf(req.params.experId)
                    if (idx  >= 0) {
                        item.experimenterIds.splice(idx, 1);
                        item.save();
                   }
                }
                return cb()
            });
        });

        
        asyncTasks.push(function(cb) {
            Application.find(search)
                .exec(function(err, apps) {
                if(err) {return cb()}
                if (apps != null) {
                    for (i=0; i<apps.length; i++) {
                        var idx = apps[i].experimenterIds.indexOf(req.params.email);
                        if ( idx >= 0)
                        {
                            apps[i].experimenterIds.splice(idx, 1);
                            apps[i].save()    
                        }
                    }
                }
                return cb();
            });
        });

        asyncTasks.push(function(cb) {
            DataSource.findOne(search)
            .exec(function(err, item) {
                if(err) {return cb()}
                if (item !== null){ 
                    var idx =  item.experimenterIds.indexOf(req.params.email);
                    if (idx >= 0) {
                       item.experimenterIds.push(req.params.email);
                        item.save();
                    }
                }
                return cb()
            });
        });                

        async.parallel(asyncTasks, function() {
            return res.status(200).send();
        }); 
    });
    
    app.post('/experiments', function(req, res) {
        var method = "  post[/experiments]  ";

        var subscriber = utils.checkAuth(req.headers);
        if (subscriber === null) {
            return res.status(403).send();
        }

        ///// first create a client for the experiment
        tokenAPI.newClient (req.body.name, req.body.redirect_uris, function (info) {
            if (info === null) {
                return res.status(403).send();
            }
            req.body.clientInfo = 
             {
                 client_id: info.client_id,
                 client_secret: info.secret
                 //redirect_uris: [], //info.redirect_uris,
                 //registration_client_uri: "", //info.registration_client_uri,
                 //registration_access_token: "", //info.registration_access_token,
             };
            
            Experiment.find({ name: req.body.name })
            .exec(function(err, exps) {
                if (err) {
                    return res.status(409).send(err);
                }
                if (exps.length > 0) {
                    return res.status(409).send("Experiment name repeated");
                } else {
                    var exp = new Experiment(req.body);
                    exp.experimenterIds = subscriber;
                    exp.mainExperimenterId = subscriber;
                    exp.experimentId = exp._id;

                    exp.save(function(err, newExp) {
                        if (err) {
                            return res.status(409).send(err);
                        }
                        var location = '/experiments/' + newExp._id;

                        var item = new DataSource();
                        item.experimentId = exp._id;
                        item.mainExperimenterId = subscriber;
                        item.experimenterIds = subscriber;

                        item.save(function(err, newItem) {
                            if (err) {
                                return res.status(409).send();
                            }
                        });
                        tagging.createApp(subscriber, newExp._id, newExp.description, req.headers.authorization,
                            function() {
                                return res.status(201).location(location).send();
                            },
                            function() {
                                return res.status(201).location(location).send();
                            });
                    });
                }
            });
        });
    });

    app.get('/experiments/:exp', function(req, res) {
        var method = "  get[/experiments/:exp]  ";
        var subscriber = utils.checkAuth(req.headers);
        if (subscriber === null) {
            return res.status(403).send();
        }

        if (typeof(req.params.exp) === undefined || req.params.exp === null) {
            return res.status(403).send();
        }

        var search = {experimenterIds: subscriber, experimentId: req.params.exp};
        Experiment.findOne(search)
            .select(utils.select)
            .exec(function(err, exp) {
                if (err || exp === null) {
                    return res.status(404).send();
                }
                return res.status(200).send(exp);
            });
    });

    app.put('/experiments/:exp', function(req, res) {
        var method = "  put[/experiments/:exp]  ";


        var subscriber = utils.checkAuth(req.headers);
        if (subscriber === null) {
            return res.status(403).send();
        }

        if (typeof(req.params.exp) === undefined || req.params.exp === null) {
            return res.status(403).send();
        }

        utils.filterByKeys(req.body, utils.readOnly.EXP);
        var search = {experimentId: req.params.exp, experimenterIds: subscriber};
        Experiment.findOneAndUpdate(search, req.body, utils.updateOptions)
            .exec(function(err, exp) {
                if (err || exp === null) {
                    return res.status(404).send();
                }

                Application.find({ experimentId: req.params.exp, type: 'smartphone' }).
                exec(function(err, apps) {
                    if (err || apps.length === 0) {
                        return res.status(200).send(exp);
                    }
                    seAPI.updateRegions(apps, exp, req.headers.authorization, function() {
                        return res.status(200).send(exp);
                    });
                });


            });
    });

    app.delete('/experiments/:exp', function(req, res) {
        var method = "  delete[/experiments/:exp]  ";

        var subscriber = utils.checkAuth(req.headers);
        if (subscriber === null) {
            return res.status(403).send();
        }

        if (typeof(req.params.exp) === undefined || req.params.exp === null) {
            return res.status(403).send();
        }

        // delete applications
        // delete sel assets
        // delete SA experiments
        var search = { experimentId: req.params.exp };
        
        DataSource.find(search).exec (function (err, ds) {
            if (err){
                return;
            }
            if (ds.length === 1) {
                ds[0].remove();
            }
        })
        

         Application.find(search).exec(function(err, apps) {
             if (err) {
                 return res.status(404).send();
             }

             for (var i = 0; i < apps.length; i++) {
                 if (apps[i].type === 'smartphone') {
                    seAPI.removeExperiment(apps[i].applicationId, req.headers.authorization, function() {});
                 }
                 apps[i].remove();
             }


              Experiment.findById(req.params.exp)
              .exec(function(err, exp) {
                  if (err || exp === null) {
                      return res.status(404).send();
                  }
                  exp.remove();
                  return res.status(200).send();
              });
         });
    });

    app.post('/experiments/:exp/logo', multipartyMiddleware, function(req, res) {
        var method = "  get[/experiments/:exp/logo]  ";
        var subscriber = utils.checkAuth(req.headers);

        if (subscriber === null) {
            return res.status(403).send();
        }

        if (typeof(req.params.exp) === 'undefined' || req.params.exp === null) {
            return res.status(403).send();
        }

        var file = req.files.file;
        if (file === undefined) {
            return res.status(100).send();
        }
        var newName = req.params.exp + path.extname(file.originalFilename);
        var logoUrl = req.protocol + '://' + req.get('host') + '/expLogos/' + newName;


        Experiment.findByIdAndUpdate(req.params.exp, { logo: logoUrl }, utils.updateOptions)
            .exec(function(err, exp) {
                if (err || exp === null) {
                    return res.status(404).send();
                }
                saveImage();
            });

        var saveImage = function() {
            fs.rename(file.path, './public/experimentLogos/' + newName, function(err) {
                if (err) {
                    return res.status(403).send();
                }
                return res.status(200).send();
            });

        };
    });

    app.get('/experiments/:expId/mainexperimenter', function (req, res){
        var method = "  get[/experiments/:expId/mainexperimenter]  ";
      
        if (typeof(req.params.expId) === 'undefined' || req.params.expId === null) {
            return res.status(403).send();
        }

        Experiment.findById(req.params.expId)
       .exec(function(err, exp) {
            if (err || exp === null) {
                return res.status(404).send();
            }
            return res.status(200).send({mainExperimenter: exp.mainExperimenterId});
        });
    }); 

    app.get('/experiments/:expId/quota', function (req, res){
        var method = "  get[/experiments/:expId/quota]  ";
       
        if (typeof(req.params.expId) === 'undefined' || req.params.expId === null) {
            return res.status(403).send();
        }

        Experiment.findById(req.params.expId)
       .exec(function(err, exp) {
            if (err || exp === null) {
                return res.status(404).send();
            }
            return res.status(200).send({quota: exp.quota});
        });
    }); 

    app.get('/experiments/:expId/remainingquota', function (req, res){
        var method = "  get[/experiments/:expId/quota]  ";
      
        if (typeof(req.params.expId) === 'undefined' || req.params.expId === null) {
            return res.status(403).send();
        }

        Experiment.findById(req.params.expId)
       .exec(function(err, exp) {
            if (err || exp === null) {
                return res.status(404).send();
            }
            return res.status(200).send({remainingQuota: exp.remQuota});
        });
    }); 

    app.post('/experiments/:expId/decreaseremquota', function (req, res){
        var method = "  get[/experiments/:expId/quota]  ";
       
        if (typeof(req.params.expId) === 'undefined' || req.params.expId === null) {
            return res.status(403).send();
        }

        Experiment.findById(req.params.expId)
       .exec(function(err, exp) {
            if (err || exp === null) {
                return res.status(404).send();
            }
            if (exp.remQuota === 0) {
                return res.status(409).send();  
            } 
            exp.remQuota = exp.remQuota - 1;

            exp.save(function (err, newItem) {
                if (err) {
                    return res.status(409).send();
                }
                return res.status(200).send({remainingQuota: newItem.remQuota});
            });

        });
    }); 

    app.post('/experiments/:expId/increaseremquota', function (req, res){
        var method = "  get[/experiments/:expId/quota]  ";

        if (typeof(req.params.expId) === 'undefined' || req.params.expId === null) {
            return res.status(403).send();
        }

        Experiment.findById(req.params.expId)
       .exec(function(err, exp) {
            if (err || exp === null) {
                return res.status(404).send();
            }
            if (exp.remQuota === exp.quota) {
                return res.status(409).send();  
            } 
            exp.remQuota = exp.remQuota + 1;

            exp.save(function (err, newItem) {
                if (err) {
                    return res.status(409).send();
                }
                return res.status(200).send({remainingQuota: newItem.remQuota});
            });

        });
    }); 


};
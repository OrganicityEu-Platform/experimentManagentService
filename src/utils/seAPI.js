var request = require('request');
var qs = require('querystring');
var utils = require('../utils/utils');
var Experiment = require('../models/experiment');


module.exports = {
    host: process.env.SE_HOST,
    //port: process.env.SE_PORT,
    getPlugins: function(token, cb) {
        url = 'https://' + this.host + '/api/v1/plugin';
        request.get(url, function(err, response, body) {
            if (err || response.statusCode !== 200) {
                return cb({});
            }
            return cb(body);
        });
    },

    updateExperiment: function(data, token, cb) {
        var seData = {
            name: data.name,
            description: data.description,
            urlDescription: data.more.urlDescription,
            sensorDependencies: data.more.sensorDependencies,
            url: data.more.codeRepository,
        };

        url = 'https://' + this.host + '/v1/experiment/' + data.applicationId + '?' +
            qs.stringify(seData);

        var options = {
            url: url,
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Authorization': token
            }
        };

        request.post(options, function(err, response, body) {
            if (err) {
                return cb(false);
            } else if (response.statusCode !== 200) {
                return cb(false);
            }
            return cb(true);
        });

    },
    createExperiment: function(data, token, cb) {
        var seData = {
            id: data.applicationId,
            name: data.name,
            description: data.description,
            userId: data.experimenterId,
            urlDescription: data.more.urlDescription,
            sensorDependencies: data.more.sensorDependencies,
            url: data.more.codeRepository,
        };


        var self = this;
        self.postExperiment(seData, token, function(ret) {
            if (!ret) {
                return cb(false);
            }
            self.getRegionsData(data.experimentId, function(area) {
                if (area === null) {

                    return cb(false);
                }
                self.putRegions(data.applicationId, area, token, function(ret) {
                    return cb(ret);
                });
            });
        });
    },
    getRegionsData: function(expId, cb) {
        Experiment.findById(expId)
            .select(utils.select)
            .exec(function(err, exp) {
                if (err || exp === null) {
                    return cb(null);
                }

                var area = [];
                for (i = 0; i < exp.area.length; i++) {
                    var aux = exp.area[i];
                    var region = {
                        startDate: aux.startDate.toISOString().slice(0, 10),
                        endDate: aux.endDate.toISOString().slice(0, 10),
                        weight: aux.weight || null,
                        name: aux.name,
                        maxMeasurements: aux.max || null,
                        minMeasurements: aux.min || null,
                        coordinates: JSON.stringify(aux.coordinates)
                    };
                    area.push(region);
                }
                return cb({ regions: area });
            });
    },
    putRegions: function(seExpId, data, token, cb) {

        url = 'https://' + this.host + '/v1/experiment/' +
            seExpId + '/region';
        var options = {
            method: 'PUT',
            url: url,
            body: JSON.stringify(data),
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Authorization': token
            }
        };

        request(options, function(err, response, body) {
            if (err) {
                cd(false);
            } else if (response.statusCode !== 200) {
                cd(false);
            }
            return cb(true);
        });
    },
    updateRegions: function(apps, exp, token, cb) {
        var area = [];
        for (i = 0; i < exp.area.length; i++) {
            var aux = exp.area[i];
            var region = {
                startDate: aux.startDate.toISOString().slice(0, 10),
                endDate: aux.endDate.toISOString().slice(0, 10),
                weight: aux.weight || null,
                name: aux.name,
                maxMeasurements: aux.max || null,
                minMeasurements: aux.min || null,
                coordinates: JSON.stringify(aux.coordinates)
            };
            area.push(region);
        }

        for (var j = 0; j < apps.length; j++) {
            var idx = j;
            this.putRegions(apps[j].applicationId, { regions: area }, token, function(ret) {
                if (idx === (apps.length - 1)) {
                    return cb();
                }
            });

        }

    },
    postExperiment: function(data, token, cb) {
        url = 'https://' + this.host + '/v1/experiment?' +
            qs.stringify(data);

        var options = {
            url: url,
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Authorization': token
            }
        };

        request.post(options, function(err, response, body) {
            if (err) {
                return cb(false);
            } else if (response.statusCode !== 200) {
                return cb(false);
            }
            return cb(true);
        });
    },

    removeExperiment: function(id, token, cb) {
        
        var url = 'https://' + this.host + '/v1/experiment/' + id;


        var options = {
            url: url,
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Authorization': token
            }
        };

        request.delete(options, function(err, response, body) {

            if (err) {
                return cb(false);    
            }
            
            if (response.statusCode !== 200) {
                return cb(false);
            }

            return cb(true);
        });
    }



};
var request = require('request');

module.exports = {
    getDevices: function(id, cb) {
        var options = {
            url: 'http://discovery.organicity.eu/v0/assets/experiments/' + id,
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            }
        }

        request.get(options, function(err, response, body) {
            if (err) {
                return cb(null);
            } else if (response.statusCode !== 200) {
                return cb(null);
            }
            cb(body)
        });
    },
    postDevice: function(data, token, expId, cb) {
        var options = {
            url: 'https://exp.orion.organicity.eu/v2/entities',
            body: JSON.stringify(data),
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Authorization': token,
                'X-Organicity-Application': process.env.EMS_ID,
                'X-Organicity-Experiment': expId

            }
        }



        request.post(options, function(err, response, body) {
            if (err) {
                return cb(false);
            } else if (response.statusCode !== 201) {
                return cb(false);
            }
            return cb(true);
        });
    }
};
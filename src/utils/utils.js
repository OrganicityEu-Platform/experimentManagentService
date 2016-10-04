var jwtDec = require('jwt-node-decoder');
var request = require('request');
var querystring = require('querystring');

module.exports = {

    filterByKeys: function(obj, keep) {
        var result = {};
        for (var property in obj) {
            if (keep.indexOf(property) != -1) {
                delete obj[property];
            }
        }
    },
    updateOptions: {
        safe: true,
        upsert: true,
        new: true,
        runValidators: true
    },
    readOnly: {
        EXP: ['experimentId', 'experimenterId', 'registered'],
        APP: ['experimentId', 'experimenterId', 'applicationId'],
        DS: ['experimentId', 'experimenterId']
    },
    select: '-_id -_v -__v',
    checkAuth: function(headers) {
        var token = headers.authorization;
       
        try {
            if (jwtDec.isTokenExpired(token)) {
                return null;
            }
            var decTok = jwtDec.decodeToken(token);
            //var aux = decTok.realm_access.roles;
            //if (idx === -1) {
            //    return null;
            //}
            return decTok.sub;

        } catch (e) {
            return null;
        }
    },
    getEmail: function(headers) {
        var email = null;
        try {
            var token = jwtDec.decodeToken(headers.authorization);
            email = token.email;
        } catch (e) {
            return null;
        }
        return email;
    },
    checkAuthUnsafe: function(headers) {
        var subscriber = null;

        try {
            subscriber = jwtDec.decodeToken(headers.authorization).sub;

        } catch (e) {

            subscriber = null;
        }

        if (subscriber === null) {
            return this.unsafe_id;
        }
        return subscriber;
    },
    unsafe_id: '86d7edce-5092-44c0-bed8-da4beaa3fbc6',
    hashCode: function(str) {
        var hash = 0;
        if (str.length === 0) return hash;
        for (i = 0; i < str.length; i++) {
            char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32bit integer
        }
        return hash;
    },
    getAccessToken: function (cb) {

        
        var options = {
            url: 'https://accounts.organicity.eu/realms/organicity/protocol/openid-connect/token',
            body: 'grant_type=client_credentials',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Authorization':'Basic ZXhwZXJpbWVudC1tYW5hZ2VtZW50LXNlcnZpY2U6MGEyMDA3ZWMtMmNmZi00NDBiLWIxZGEtNzkx ZGUwMDg2MDU0'
            }
        }

        request.post(options, function(err, response, body) {
            console.log('something received')
            if (err) {
                console.log(err);
                cb(null);
            } else if (response.statusCode !== 200) {
                console.log('Status code ' + response.statusCode)
                console.log(response)
                return cb(null);
            }
            var bb = JSON.parse(body)
            console.log(bb)
            return cb(bb.access_token);
        });
    } 
};
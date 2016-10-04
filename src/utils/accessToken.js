var request = require('request');
var qs = require('querystring');
var jwtDec = require('jwt-node-decoder');
var token = null;
var refreshToken = null;


var updateOptions = {
    url: 'https://accounts.organicity.eu/realms/organicity/protocol/openid-connect/token',
    body: 'grant_type=client_credentials',
    headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization':'Basic ZXhwZXJpbWVudC1tYW5hZ2VtZW50LXNlcnZpY2U6MGEyMDA3ZWMtMmNmZi00NDBiLWIxZGEtNzkx ZGUwMDg2MDU0'
        }
    }

var refreshOptions = {
    url: 'https://accounts.organicity.eu/realms/organicity/protocol/openid-connect/token',
    body: qs.stringify({'grant_type':'refresh_token', 
    		'refresh_token': refreshToken
    	}),
    headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization':'Basic ZXhwZXJpbWVudC1tYW5hZ2VtZW50LXNlcnZpY2U6MGEyMDA3ZWMtMmNmZi00NDBiLWIxZGEtNzkx ZGUwMDg2MDU0'
        }
    }

 

function updateToken (cb) {
    request.post(updateOptions, 
    function(err, response, body) {
        if (err) {
        	return cb(null);
        } else if (response.statusCode !== 200) {
            return cb(null);
        }
        var bb = JSON.parse(body)
        token = bb.access_token;

        refreshToken = bb.refresh_token;
        cb(token);
    });
}



 function getToken (cb) {
 	if (token === null || jwtDec.isTokenExpired(token)) {
 		return updateToken(cb);
 	}
 	return cb(token);
 }

 function newClient (expName, uri, cb) {
  data = {
    clientName: expName,
    clientUri: "",
    redirectUri: ""
    //grant_types: ["authorization_code", "refresh_token"]
  };
  
  getToken (function (token) {
    if (token === null) {
      return cb(null);
    }


    var options = {
      //url: 'https://accounts.organicity.eu/realms/organicity/clients-registrations/openid-connect',
      url: 'https://accounts.organicity.eu/permissions/clients/create',
      body: JSON.stringify(data),
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': 'Bearer ' + token
      }
    };


    request.post(options, function(err, response, body) {
      if (err) {
        return cb(null);
      } else if (response.statusCode !== 201) {
        return cb(null);
      }

      return cb(JSON.parse(body));
    });
  });
 }

 function getIdFromEmail (email, cb) {
    getToken (function (token) {
      if (token === null) {
        return cb(null);
      }
      var options = {
        url: 'https://accounts.organicity.eu/permissions/users?email=' + email,
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': 'Bearer ' + token
        }
      };
      request.get(options, function(err, response, body) {
        if (err) {
          return cb(null);
        } else if (response.statusCode !== 200) {
          return cb(null);
        } 

        var pbody = JSON.parse(body);
        if (pbody.length !== 1) {
          return cb(null);
        }
        return cb(pbody[0].id);
      });
  });
 }

module.exports = {
	getToken: getToken,
  newClient: newClient,
  getIdFromEmail: getIdFromEmail
}
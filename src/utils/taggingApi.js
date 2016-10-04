var http = require('http');
var request = require('request');

module.exports = {
    host: process.env.TAGS_HOST,
    port: process.env.TAGS_PORT,
    urnHead: 'urn:oc:entity:experimenters:',
    createAppOpt: function() {
        var options = {
            host: this.host,
            port: this.port,
            path: '/admin/applications',
            method: 'POST',
            json: true,
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            }
        };
        return options;
    },
    deleteAppOpt: function(urn) {
        var options = {
            host: this.host,
            port: this.port,
            path: '/admin/applications/' + urn,
            method: 'DELETE',
            json: true,
            headers: {
                'Content-Type': 'application/json',
                'Accept': '*/*',
            }
        };
        return options;
    },
    getAllDomainsOpt: function() {
        var options = {
            host: this.host,
            port: this.port,
            path: '/tagDomains',
            method: 'GET',
            json: true,
            headers: {
                'Content-Type': 'application/json',
                'Accept': '*/*',
            }
        };
        return options;
    },
    getDomainsOpt: function(urn) {
        var options = {
            host: this.host,
            port: this.port,
            path: '/admin/applications/' + urn + '/tagDomains',
            method: 'GET',
            json: true,
            headers: {
                'Content-Type': 'application/json',
                'Accept': '*/*',
            }
        };
        return options;
    },
    postDomainsOpt: function(urn, domain) {
        var options = {
            host: this.host,
            port: this.port,
            path: '/admin/applications/' + urn + '/tagDomains?tagDomainUrn=' + domain,
            method: 'POST',
            json: true,
            headers: {
                'Content-Type': 'application/json',
                'Accept': '*/*',
            }
        };
        return options;
    },
    deleteDomainsOpt: function(urn, domain) {
        var options = {
            host: this.host,
            port: this.port,
            path: '/admin/applications/' + urn + '/tagDomains?tagDomainUrn=' + domain,
            method: 'DELETE',
            json: true,
            headers: {
                'Content-Type': 'application/json',
                'Accept': '*/*',
            }
        };
        return options;
    },
    // actual calls
    addDomain: function(experId, expId, domain, success, error) {
        var urn = this.urnHead + experId + ':' + expId;
        var options = this.postDomainsOpt(urn, domain);
        var req = http.request(options, function(res) {
            res.setEncoding('utf8');
            var body = "";
            res.on('data', function(chunk) {
                body += chunk;
            });
            res.on('end', function(chunk) {
                if (res.statusCode !== 200) {
                    return error('Status Code ' + res.statusCode);
                }
                return success();
            });
        }).on('error', function(err) {
            return error(err);
        });
        req.end();
    },
    deleteDomain: function(experId, expId, domain, error) {
        var urn = this.urnHead + experId + ':' + expId;
        var options = this.deleteDomainsOpt(urn, domain);

        var req = http.request(options, function(res) {
            res.setEncoding('utf8');
            var body = "";
            res.on('data', function(chunk) {
                body += chunk;
            });
            res.on('end', function(chunk) {
                if (res.statusCode !== 200) {
                    return error('Status Code ' + res.statusCode);
                }
                return success();
            });
        }).on('error', function(err) {
            return error(err);
        });
        req.end();
    },
    getAllDomains: function(success, error) {
        var options = this.getAllDomainsOpt();
        var req = http.request(options, function(res) {
            res.setEncoding('utf8');
            var body = "";
            res.on('data', function(chunk) {
                body += chunk;
            });
            res.on('end', function(chunk) {
                try {
                    if (res.statusCode !== 200) {
                        return error();
                    }
                    return success(JSON.parse(body));

                } catch (exp) {
                    return error(bull);

                }
            });
        }).on('error', function(err) {
            return error(null);
        });
        req.end();
    },
    getAppDomains: function(experId, expId, success, error) {
        var urn = this.urnHead + experId + ':' + expId;
        var options = this.getDomainsOpt(urn);
        var req = http.request(options, function(res) {
            res.setEncoding('utf8');
            var body = "";
            res.on('data', function(chunk) {
                body += chunk;
            });
            res.on('end', function(chunk) {
                try {
                    if (res.statusCode !== 200) {
                        return error();
                    }
                    return success(JSON.parse(body));

                } catch (exp) {
                    return error(bull);

                }
            });
        }).on('error', function(err) {
            return error(null);
        });
        req.end();
    },
    createApp: function(experId, expId, desc, token, success, error) {
        var urn = this.urnHead + experId + ':' + expId;
        var data = {
            "description": desc,
            "tagDomain": [],
            "urn": urn
        };

        var options = {
            url: 'http://annotations.organicity.eu:8084/admin/applications',
            body: JSON.stringify(data),
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Authorization': token
            }
        };

        console.log(token)

        request.post(options, function(err, response, body) {
        if (err) {
            console.log('Error')
            console.log(err)
            return error();
        } else if (response.statusCode !== 201) {
            console.log('error status')
            console.log(body)
            console.log(response.statusCode)
            return error();
        }
            console.log('All ok!')
            return success(JSON.parse(body));
        });
    },
    deleteApp: function(experId, expId, success, error) {
        var urn = this.urnHead + experId + ':' + expId;
        var url = 'http://' + this.host + ':' + this.port + '/admin/applications/' + urn;

        request.del(url, function(err, response, body) {
            if (err || response.statusCode !== 200) {
                error();
            }
            success();
        });
    }

};
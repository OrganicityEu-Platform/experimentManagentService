var http = require('http');

module.exports = {
    host: process.env.FMS_HOST,
    port: process.env.FMS_PORT,
    getAssetTypes: function(data, token, cb) {
        var options = {
            host: this.host,
            port: this.port,
            path: '/v1/dictionary/assettypes',
            headers: {
                'Accept': 'application/json',
                'Authorization': token
            }
        };
        data.assetTypes = [];
        var req = http.get(options, function(res) {
            res.setEncoding('utf8');
            var body = "";
            res.on('data', function(chunk) {
                body += chunk;
            });
            res.on('end', function() {
                try {
                    if (res.statusCode === 200) {
                        data.assetTypes = JSON.parse(body);
                    }
                    return cb();
                } catch (exp) {
                    return cb();
                }
            });
        }).on('error', function(err) {
            return cb();
        });
        req.end();
    },
    getAttrTypes: function(data, token, cb) {
        var options = {
            host: this.host,
            port: this.port,
            path: '/v1/dictionary/attributetypes',
            headers: {
                'Accept': 'application/json',
                'Authorization': token
            }
        };
        data.attributeTypes = [];
        var reqOut = http.get(options, function(resOut) {
            resOut.setEncoding('utf8');
            var body = "";
            resOut.on('data', function(chunk) {
                body += chunk;
            });

            resOut.on('end', function() {
                try {
                    if (resOut.statusCode === 200) {
                        data.attributeTypes = JSON.parse(body);
                    }
                    return cb();
                } catch (exp) {
                    return cb();
                }
            });
        }).on('error', function(err) {
            return cb();
        });
        reqOut.end();
    },
    getUnitTypes: function(data, token, cb) {
        var options = {
            host: this.host,
            port: this.port,
            path: '/v1/dictionary/units',
            headers: {
                'Accept': 'application/json',
                'Authorization': token
            }
        };
        data.unitTypes = [];
        var reqOut = http.get(options, function(resOut) {
            resOut.setEncoding('utf8');
            var body = "";
            resOut.on('data', function(chunk) {
                body += chunk;
            });
            resOut.on('end', function() {
                try {
                    if (resOut.statusCode === 200) {
                        data.unitTypes = JSON.parse(body);
                    }
                    return cb();
                } catch (exp) {
                    return cb();
                }
            });
        }).on('error', function(err) {
            return cb();
        });
        reqOut.end();
    },
    getDataTypes: function(data, token, cb) {
        var options = {
            host: this.host,
            port: this.port,
            path: '/v1/dictionary/datatypes',
            headers: {
                'Accept': 'application/json',
                'Authorization': token
            }
        };
        data.dataTypes = [];
        var reqOut = http.get(options, function(resOut) {
            resOut.setEncoding('utf8');
            var body = "";
            resOut.on('data', function(chunk) {
                body += chunk;
            });
            resOut.on('end', function() {
                try {
                    if (resOut.statusCode === 200) {
                        data.dataTypes = JSON.parse(body);
                    }
                    return cb();
                } catch (exp) {
                    return cb();
                }
            });
        }).on('error', function(err) {
            return cb();
        });
        reqOut.end();
    },
    getTools: function(token, cb) {
        var options = {
            host: this.host,
            port: this.port,
            path: '/v1/dictionary/tools',
            headers: {
                'Accept': 'application/json',
                'Authorization': token
            }
        };
        var reqOut = http.get(options, function(resOut) {
            resOut.setEncoding('utf8');
            var body = "";
            resOut.on('data', function(chunk) {
                body += chunk;
            });
            resOut.on('end', function() {
                try {
                    if (resOut.statusCode === 200) {
                        return cb(JSON.parse(body));
                    } else {
                        return cb([]);
                    }
                } catch (exp) {
                    return cb([]);
                }
            });
        }).on('error', function(err) {
            return cb([]);
        });
        reqOut.end();
    },
    getAppTypes: function(token, cb) {
        var options = {
            host: this.host,
            port: this.port,
            path: '/v1/dictionary/applicationtypes',
            headers: {
                'Accept': 'application/json',
                'Authorization': token
            }
        };
        var reqOut = http.get(options, function(resOut) {
            resOut.setEncoding('utf8');
            var body = "";
            resOut.on('data', function(chunk) {
                body += chunk;
            });
            resOut.on('end', function() {
                try {
                    if (resOut.statusCode === 200) {
                        console.log(JSON.parse(body))
                        return cb(JSON.parse(body));
                    } else {
                        console.log(resOut.statusCode)
                        return cb([]);
                    }

                } catch (exp) {
                    return cb([]);
                }
            });
        }).on('error', function(err) {
            return cb([]);
        });
        reqOut.end();
    },
};
// app.js
var express = require('express');
var app = express(); // server instance
var bodyParser = require('body-parser', ({ uploadDir: './uploads' }));
var mongoose = require('mongoose');
var multiparty = require('connect-multiparty');
multipartyMiddleware = multiparty();

var fs = require('fs');
var http = require('http');
var https = require('https');

var SwaggerExpress = require('swagger-express-mw');
var app = require('express')();
var SwaggerUi = require('swagger-tools/middleware/swagger-ui');

var log = require("./src/utils/logger");
var textFormat = require('./src/utils/logMessages').textFormat;


/*CONFIGURATION */
var dbPort = 27017;
var dbAddr = 'localhost';
var logLevel = 'silly';
var fmsHost = 'ec2-52-40-19-99.us-west-2.compute.amazonaws.com';
var fmsPort = 8080;
var tagsHost = 'http://annotations.organicity.eu';
var tagsPort = 8084;
var seHost = 'api.smartphone-experimentation.eu';
var sePort = 8080;


process.env.EMS_ID = 'experiment-management-service';
process.env.HTTP_PORT = 8081;
process.env.HTTPS_PORT = 8443;
process.env.DB_ADDR = dbAddr;
process.env.DB_PORT = dbPort;
process.env.FMS_HOST = fmsHost;
process.env.FMS_PORT = fmsPort;
process.env.TAGS_HOST = tagsHost;
process.env.TAGS_PORT = tagsPort;

process.env.SE_HOST = seHost;
process.env.SE_PORT = sePort;

/**
 * Swagger stuff
 */
SwaggerExpress.create({ appRoot: __dirname }, function(err, swaggerExpress) {
    if (err) {
        throw err;
    }
    app.use(SwaggerUi(swaggerExpress.runner.swagger));
    swaggerExpress.register(app);
});



var router = express.Router();

require('./src/routes/experiments')(router, log, multipartyMiddleware);
require('./src/routes/applications')(router, log);
require('./src/routes/devices')(router, log);
require('./src/routes/datasources')(router, log);
require('./src/routes/tags')(router, log);
require('./src/routes/fms')(router, log);
require('./src/routes/se')(router, log);
require('./src/routes/check')(router, log);
require('./src/routes/invitations')(router, log);


app.use("/expLogos", express.static(__dirname + '/public/experimentLogos'));
app.use("/appLogos", express.static(__dirname + '/public/applicationLogos'));


/**
 * Data base connection
 */
mongoose.connection.on('open', function(ref) {
    console.log(textFormat.FgGreen, 'Connected to mongo db!', textFormat.Reset);
    return setupServer();
});

mongoose.connection.on('error', function(err) {
    console.log(textFormat.FgRed, 'Could not connect to mongo db!', textFormat.Reset);
    return console.log(textFormat.FgRed, err.message, textFormat.Reset);
});
var mongoAddr = process.env.DB_ADDR || "localhost";
var mongoPort = process.env.DB_PORT || 27017;
var dbName = 'ems';

try {
    var db = 'mongodb://' + mongoAddr + ':' + mongoPort + '/' + dbName;
    mongoose.connect(db);
    console.log(textFormat.FgCyan, 'Started connection on [' + db + '] waiting for it to open...', textFormat.Reset);
} catch (e) {
    console.log(textFormat.FgRed, 'Setting up failed to connect to [' + db + '], ' + err.message, textFormat.Reset);
}

/**
 * Server configuration
 */
function setupServer() {
    app.use(bodyParser.urlencoded({ extended: true }));
    app.use(bodyParser.json());

    var port = process.env.HTTP_PORT || 8081;
    var httpsPort = process.env.HTTPS_PORT || 8443;
    app.use(function(req, res, next) {
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
        res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With, content-type, Authorization');
        next();
    });

    app.use('/', router);
    var httpServer = http.createServer(app);
    httpServer.listen(port);

    var privateKey  = fs.readFileSync('/etc/letsencrypt/live/experimenters.organicity.eu/privkey.pem');
    var certificate = fs.readFileSync('/etc/letsencrypt/live/experimenters.organicity.eu/cert.pem');
    var caf = fs.readFileSync('/etc/letsencrypt/live/experimenters.organicity.eu/chain.pem');
    var credentials = {key: privateKey, cert: certificate, ca: caf};

    //var privateKey  = fs.readFileSync('sslcert/key.pem');
    //var certificate = fs.readFileSync('sslcert/cert.pem');
    //var credentials = {key: privateKey, cert: certificate};

    var httpsServer = https.createServer(credentials, app);
    httpsServer.listen(httpsPort);

    console.log(textFormat.FgGreen, 'HTTP Server listening in PORT ' + port, textFormat.Reset)
    console.log(textFormat.FgGreen, 'HTTPS Server listening in PORT ' + httpsPort, textFormat.Reset)
    return;
}
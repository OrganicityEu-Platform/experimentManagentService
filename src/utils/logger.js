var winston = require('winston');
winston.transports.DailyRotateFile = require('winston-daily-rotate-file');
winston.emitErrs = true;

var logger = new winston.Logger({
    transports: [
        new winston.transports.DailyRotateFile({
            level: process.env.LOG || 'silly',
            datePattern: '.yyyy-MM-ddTdd',
            filename: './logs/em.log',
            handleExceptions: true,
            timestamp: function() {
                return (new Date()).toLocaleString();
            },
            json: true,
            maxsize: 5242880, //5MB
            maxFiles: 5,
            colorize: true
        })
    ],
    exitOnError: false
});

module.exports = logger;
module.exports.stream = {
    write: function(message, encoding) {
        logger.info(message);
    }
};

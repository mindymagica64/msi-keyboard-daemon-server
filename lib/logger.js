// Load modules

var Hoek = require('hoek');
var Syslog = require('node-syslog');


// Declare internals

var internals = {
    logtypes: ['syslog', 'console']
};


module.exports = internals.logger = function (logtype) {

    Hoek.assert(Hoek.contain(internals.logtypes, logtype), 'Logtype must be one of ' + JSON.stringify(internals.logtypes));
    Syslog.init('msi-kbd', Syslog.LOG_PID, Syslog.LOG_DAEMON);
    this.logtype = logtype;

    return this;
};


internals.logger.prototype.log = function (msg) {

    if (this.logtype === 'syslog') {
        Syslog.log(Syslog.log_INFO, msg)
    }

    if (this.logtype === 'console') {
        console.log(msg);
    }
};

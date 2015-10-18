// Load modules

var Hoek = require('hoek');


// Declare internals

var internals = {
    logtypes: ['console']
};


module.exports = internals.logger = function (logtype) {

    Hoek.assert(Hoek.contain(internals.logtypes, logtype), 'Logtype must be one of ' + JSON.stringify(internals.logtypes));
    this.logtype = logtype;

    return this;
};


internals.logger.prototype.log = function (msg) {

    if (this.logtype === 'console') {
        console.log(msg);
    }
};

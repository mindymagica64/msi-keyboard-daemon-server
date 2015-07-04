// Load modules

var Boom = require('boom');
var Hapi = require('hapi');
var Joi = require('joi');

var Kb = require('msi-keyboard');
var Syslog = require('node-syslog');

var Package = require('../../package.json');


// Declare internals

var internals = {
    colors: ['off', 'red', 'orange', 'yellow', 'green', 'sky', 'blue', 'purple', 'white'],
    intensities: ['light', 'low', 'med', 'high'],
    modes: ['normal', 'gaming', 'breathe', 'demo', 'wave'],
    regions: ['left', 'middle', 'right'],
    version: Package.version,
    port: 7070,
    logtype: 'syslog',
    daemon: true,
    colors_called: false
};


internals.log = function (prio, msg) {

    if (internals.logtype === 'syslog') {
        Syslog.log(prio, msg)
    }
    else if (internals.logtype === 'console') {
        console.log(msg);
    }
};


if (internals.daemon) {
    require('daemon')();
}


if (internals.logtype === 'syslog') {
    if (internals.daemon) {
        Syslog.init('msi-kbd', Syslog.log_PID, Syslog.LOG_DAEMON);
    }
}


// Create hapi server

var server = new Hapi.Server();
server.connection({ port: internals.port });


// Add routes

server.route({
    method: 'POST',
    path: '/color',
    config: {
        validate: {
            payload: {
                region: Joi.string().valid(internals.regions).required(),
                color: Joi.string().valid(internals.colors).required(),
                intensity: Joi.string().valid(internals.intensities).required()
            }
        }
    },
    handler: function (request, reply) {

        var msg = 'Got request to change ' + request.payload.region + ' to color ' + request.payload.color + ' with ' + request.payload.intensity + ' intensity';
        internals.log(Syslog.log_INFO, msg);

        var options = {
            color: request.payload.color,
            intensity: request.payload.intensity
        };

        Kb.color(request.payload.region, options);
        internals.colors_called = true;

        return reply({ code: 200, message: 'ok!' });
    }
});


// Add `/color` route

server.route({
    method: 'POST',
    path: '/mode',
    config: {
        validate: {
            payload: {
                mode: Joi.string().valid(internals.modes).required()
            }
        }
    },
    handler: function (request, reply) {

        var msg = 'got request to change mode to ' + request.payload.mode;
        internals.log(Syslog.log_INFO, msg);

        Kb.mode(request.payload.mode);

        return reply({ code: 200, message: 'ok!' });
    }
});


// Add `/blink` route

server.route({
    method: 'POST',
    path: '/blink',
    config: {
        validate: {
            payload: {
                millis: Joi.number().integer().required(),
                regions: Joi.array().items(Joi.string().valid(internals.regions)).min(1).max(2),
                timeout: Joi.number().integer().required()
            }
        }
    },
    handler: function (request, reply) {

        var msg = 'Got valid blink request. interval: ' + request.payload.millis + '. regions: ' + request.payload.regions + '. timeout: ' + request.payload.timeout;
        internals.log(Syslog.log_INFO, msg);

        if (internals.colors_called) {
            return reply(Boom.internal('must call colors before blink!'));
        }

        var regions = request.payload.regions;
        var millis = request.payload.millis;
        request.payload.regions ? Kb.blink(regions, millis) : Kb.blink(millis);

        if (request.payload.timeout) {
            setTimeout(Kb.stopBlink, request.payload.timeout);
        }

        return reply({ code: 200, message: 'ok!' });
    }
});


// Start Hapi server

server.start(function() {

    var msg = 'starting msi-kdb-server version ' + internals.version + ' at ' + server.info.uri;
    internals.log(Syslog.log_INFO, msg)
});

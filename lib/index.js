// Load modules

var Bossy = require('bossy');
var Hapi = require('hapi');
var Hoek = require('hoek');

var Controllers = require('./controllers');
var Logger = require('./logger');


// Declare internals

var internals = {
    config: {
        logtype: 'console',
        port: 7070
    },
    definition: {
        h: {
            alias: 'help',
            description: 'Show help',
            type: 'boolean'
        },
        port: {
            alias: 'p',
            description: 'Select server port',
            type: 'number',
            default: 7070
        },
        daemon: {
            alias: 'd',
            description: 'Start server as daemon',
            type: 'boolean',
            default: false
        },
        logtype: {
            alias: 'log',
            description: 'Select log type',
            default: 'console',
            type: 'string'
        }
    }
};


var initalizeBossy = function () {

    var args = Bossy.parse(internals.definition);

    if (args instanceof Error) {
        console.error(args.message);
        process.exit(1);
    }

    if (args.h) {
        console.log(Bossy.usage(internals.definition, 'node index.js'));
        process.exit(0);
    }

    return args;
};


var boss = initalizeBossy();

if (boss.daemon) {
    require('daemon')();
}

var server = new Hapi.Server();
server.connection({ port: boss.port });


server.bind({
    logger: new Logger(boss.logtype),
    settings: {
        colors_called: false
    }
});


server.route([
    { method: 'POST', path: '/blink', config: Controllers.blink },
    { method: 'POST', path: '/color', config: Controllers.color },
    { method: 'POST', path: '/mode', config: Controllers.mode }
]);


server.start();

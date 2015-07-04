var Kb = require('msi-keyboard');
var Hapi = require('hapi');
var Syslog = require('node-syslog');
var Joi = require('joi');
var Boom = require('boom');

var internals = {
	'colors': 
	[
	  'off',
	  'red',
	  'orange',
	  'yellow',
	  'green',
	  'sky',
	  'blue',
	  'purple',
	  'white'
	],
	'intensities': ['light', 'low', 'med', 'high'],
	'modes': ['normal', 'gaming', 'breathe', 'demo', 'wave'],
	'regions': ['left', 'middle', 'right'],
	'version': '1.0.0',
	'port': 7070,
	'logtype': 'syslog',
	'daemon': false,
	'log': function (prio, msg){
		if(internals.logtype === 'syslog'){
			Syslog.log(prio, msg)
		} else if(internals.logtype === 'console'){
			console.log(msg);
		} else{

		}
	},
	'colors_called': false
};

if(internals.daemon) {
	require('daemon')();
}

if(internals.logtype === 'syslog'){
	if(internals.daemon){
		Syslog.init('msi-kbd', Syslog.LOG_PID, Syslog.LOG_DAEMON);
	} else{
		Syslog.init('msi-kbd', Syslog.LOG_PID, Syslog.LOG_DAEMON);
	}
}


var server = new Hapi.Server();
server.connection({port: internals.port});

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
	handler: function(request, reply){
		internals.log(Syslog.log_INFO, 'got request to change ' + request.payload.region + ' to color ' + request.payload.color + ' with ' + request.payload.intensity + ' intensity');
		Kb.color(request.payload.region, 
			{
				color: request.payload.color, 
				intensity: request.payload.intensity
			});
		internals.colors_called = true
		reply({
				statusCode: 200,
				message: 'ok!'
			});
	}
});

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
	handler: function(request, reply){
		internals.log(Syslog.log_INFO, 'got request to change mode to ' + request.payload.mode);
		Kb.mode(request.payload.mode);
		reply({
				statusCode: 200,
				message: 'ok!'
			});
	}
});

server.route({
	method: 'POST',
	path: '/blink',
	config: {
		validate: {
			payload: {
				millis: Joi.number().integer().required(),
				regions: Joi.array().items(Joi.string().valid(internals.regions)).min(1).max(2),
				timeout: Joi.number().integer()
			}
		}
	},
	handler: function(request, reply){
		internals.log(Syslog.log_INFO, 'got valid blink request. interval: ' + request.payload.millis + '. regions: ' + request.payload.regions + '. timeout: ' + request.payload.timeout);
		if(!internals.colors_called){
			reply(Boom.preconditionFailed('must call colors at least once before calling blink!'));
		} else{
			if(request.payload.regions){
				Kb.blink(request.payload.regions, request.payload.millis);
			} else{
				Kb.blink(request.payload.millis);
			}
			if(request.payload.timeout){
				setTimeout(Kb.stopBlink, request.payload.timeout);
			}
			reply({
					statusCode: 200,
					message: 'ok!'
				});
		}
		
	}
});

server.start(function(){
	internals.log(Syslog.log_INFO, 'starting msi-kdb-server version ' + 
		internals.version + ' at ' + server.info.host + ':' + server.info.port)
});
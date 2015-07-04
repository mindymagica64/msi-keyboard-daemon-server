// Load modules

var Boom = require('boom');
var Joi = require('joi');


// Declare internals

var internals = {
    regions: ['left', 'middle', 'right']
};


module.exports = internals.blink = {
    description: 'Does something related to blinking',
    tags: ['api'],
    validate: {
        payload: {
            millis: Joi.number().integer().required(),
            regions: Joi.array().items(Joi.string().valid(internals.regions)).min(1).max(2),
            timeout: Joi.number().integer().required()
        }
    },
    handler: function (request, reply) {

        var millis = request.payload.millis;
        var regions = request.payload.regions;
        var timeout = request.payload.timeout;

        this.logger.log('Got valid blink request. interval: ' + millis + '. regions: ' + regions + '. timeout: ' + timeout);

        if (this.settings.colors_called) {
            return reply(Boom.internal('must call colors before blink!'));
        }

        var Kb = require('msi-keyboard');
        regions ? Kb.blink(regions, millis) : Kb.blink(millis);

        if (timeout) {
            setTimeout(Kb.stopBlink, timeout);
        }

        return reply({ code: 200, message: 'ok!' });
    }
};

// Load modules

var Joi = require('joi');


// Declare internals

var internals = {
    modes: ['normal', 'gaming', 'breathe', 'demo', 'wave']
};


module.exports = internals.mode = {
    description: 'Does something related to mode',
    tags: ['api'],
    validate: {
        payload: {
            mode: Joi.string().valid(internals.modes).required()
        }
    },
    handler: function (request, reply) {

        this.logger.log('got request to change mode to ' + request.payload.mode);

        var Kb = require('msi-keyboard');
        Kb.mode(request.payload.mode);

        return reply({ code: 200, message: 'ok!' });
    }
};

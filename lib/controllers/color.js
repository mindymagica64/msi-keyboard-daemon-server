// Load modules

var Joi = require('joi');



// Declare internals

var internals = {
    colors: ['off', 'red', 'orange', 'yellow', 'green', 'sky', 'blue', 'purple', 'white'],
    intensities: ['light', 'low', 'med', 'high'],
    regions: ['left', 'middle', 'right']
};


module.exports = internals.color = {
    description: 'Does something related to color',
    tags: ['api'],
    validate: {
        payload: {
            color: Joi.string().valid(internals.colors).required(),
            intensity: Joi.string().valid(internals.intensities).required(),
            region: Joi.string().valid(internals.regions).required()
        }
    },
    handler: function (request, reply) {

        var color = request.payload.color;
        var intensity = request.payload.intensity;
        var regions = request.payload.regions;

        this.logger.log('Got request to change ' + region + ' to color ' + color + ' with ' + intensity + ' intensity');

        var Kb = require('msi-keyboard');
        Kb.color(region, { color: color, intensity: intensity });
        this.settings.colors_called = true;

        return reply({ code: 200, message: 'ok!' });
    }
};

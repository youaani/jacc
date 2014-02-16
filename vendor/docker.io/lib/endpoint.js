//var clone = require('node-v8-clone').clone,
var extend = require('util')._extend,
    validator = require('../vendor/flat-validator'),
    parse = require('url').parse;

var Endpoint = function(type, o) {
    var API;

    this.path = o.path

    this.isStream = o.isStream;

    this.forceURLParams = o.forceURLParams;
    this.urlParams = o.urlParams;
    this.args = o.args;
    this.modem = o.modem;
    this.method = o.method;
    this.statusCodes = o.statusCodes;
    this.type = type;

    (function(endpointThis) {
        API = function() {
            if (!(this instanceof API)) {
                var args = Array.prototype.concat.apply([null], arguments);
                return new(Function.prototype.bind.apply(API, args));
            }

//            var endpoint = clone(endpointThis);
            var endpoint = extend({},endpointThis);

            var self = this,
                data,
                validArgs;

            this.callback = arguments[arguments.length - 1];

            // assign argumets to a named var
            switch (type) {
                case 'id':
                    this.id = arguments[0];

                    // make sure arguments are passed in correctly
                    //
                    if (typeof this.id !== 'string' || this.id === "") {
                        return endpoint.error('The first argument "ID" should be a string...');
                    }

                    endpoint.path = endpoint.path.replace('${id}', this.id);

                    // allow for options or ignore them
                    if (arguments.length > 2) {
                        endpoint.options = arguments[1];
                    }

                    break;
                case 'file':
                    endpoint.file = arguments[0];

                    // allow for options or ignore them
                    if (arguments.length > 2) {
                        if (typeof(arguments[1]) === 'string') {
                            endpoint.options = {};
                            endpoint.options.t = arguments[1];
                        } else {
                            endpoint.options = arguments[1];
                        }
                    }
                    break;
                case 'options':
                    if (arguments.length > 1) {
                        endpoint.options = arguments[0];
                    } else {
                        endpoint.options = {};
                    }
                    break;
            }
            //endpoint.path.replace('${id}', this.id);
            var validParams = validator.validate(endpoint.options, endpoint.args);

            // note that we dont check if(validParams) because a fail returns an object
            if (validParams === true) {
                endpoint.modem.dial(endpoint, function(err, data) {
                    self.callback(err, data);
                });
            } else {
                endpoint.error(validParams.fieldName + ' Is a ' + validParams.ruleName + ' property for this API, and was not found or did not pass validation.');
            }
        };
    })(this);

    return API;
};

Endpoint.prototype.error = function(message) {
    throw message;
};

module.exports = Endpoint;

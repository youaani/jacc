var Endpoint = require('./endpoint'),
    Modem = require('../vendor/docker-modem'),
    validator = require('../vendor/flat-validator');


var Docker = function(opts) {
    opts = opts || {};

    opts.version = opts.version || "v1.7",
    opts.port = opts.port || '4243',
    opts.host = opts.host || "http://localhost";

    // If socketPath is false, use TCP
    // otherwise, use the socketPath specified or the default.
    if (opts.socketPath !== false) {
        opts.socketPath = opts.socketPath || '/var/run/docker.sock';
    }

    modem = new Modem(opts);

    return {
        demuxStream: modem.demuxStream,
        containers: {
            list: new Endpoint('options', {
                path: '/containers/json',
                method: 'GET',
                statusCodes: {
                    200: true,
                    400: "bad parameter",
                    500: "server error"
                },
                modem: modem
            }),
            create: new Endpoint('options', {
                path: '/containers/create',
                method: 'POST',
                urlParams: ['name'],
                args: {
                    Image: {
                        required: true,
                        type: 'string'
                    },
                    Cmd: {
                        required: true,
                        type: 'array'
                    }
                },
                statusCodes: {
                    201: true,
                    404: "no such container",
                    500: "server error"
                },
                modem: modem
            }),
            inspect: new Endpoint('id', {
                path: '/containers/${id}/json',
                method: 'GET',
                statusCodes: {
                    200: true,
                    404: "no such container",
                    500: "server error"
                },
                modem: modem
            }),
            inspectChanges: new Endpoint('id', {
                path: '/containers/${id}/changes',
                method: 'GET',
                statusCodes: {
                    200: true,
                    404: "no such container",
                    500: "server error"
                },
                modem: modem
            }),
            runExport: new Endpoint('id', {
                path: '/containers/${id}/export',
                method: 'GET',
                statusCodes: {
                    200: true,
                    404: "no such container",
                    500: "server error"
                },
                modem: modem
            }),
            start: new Endpoint('id', {
                path: '/containers/${id}/start',
                method: 'POST',
                statusCodes: {
                    204: true,
                    404: "no such container",
                    500: "server error"
                },
                modem: modem
            }),
            stop: new Endpoint('id', {
                path: '/containers/${id}/stop',
                method: 'POST',
                statusCodes: {
                    204: true,
                    404: "no such container",
                    500: "server error"
                },
                modem: modem
            }),
            restart: new Endpoint('id', {
                path: '/containers/${id}/restart',
                method: 'POST',
                statusCodes: {
                    204: true,
                    404: "no such container",
                    500: "server error"
                },
                modem: modem
            }),
            kill: new Endpoint('id', {
                path: '/containers/${id}/kill',
                method: 'POST',
                statusCodes: {
                    204: true,
                    400: "bad parameter",
                    404: "no such container",
                    500: "server error"
                },
                modem: modem
            }),
            remove: new Endpoint('id', {
                path: '/containers/${id}',
                method: 'DELETE',
                statusCodes: {
                    204: true,
                    400: "bad parameter",
                    404: "no such container",
                    406: "no container found", // docker bug
                    500: "server error"
                },
                modem: modem
            }),
            attach: new Endpoint('id', {
                path: '/containers/${id}/attach?',
                method: 'POST',
                forceURLParams: true,
                isStream: true,
                statusCodes: {
                    200: true,
                    404: "no such container",
                    500: "server error"
                },
                modem: modem
            }),
            top: new Endpoint('id', {
                path: '/containers/${id}/top',
                method: 'GET',
                forceURLParams: true,
                isStream: true,
                statusCodes: {
                    200: true,
                    404: "no such container",
                    500: "server error"
                },
                modem: modem
            }),
            copy: new Endpoint('id', {
                path: '/containers/${id}/copy',
                method: 'GET',
                forceURLParams: true,
                isStream: true,
                statusCodes: {
                    200: true,
                    404: "no such container",
                    500: "server error"
                },
                modem: modem
            }),
            ps: new Endpoint('options', {
                path: '/containers/ps',
                method: 'GET',
                forceURLParams: true,
                isStream: true,
                statusCodes: {
                    200: true,
                    404: "no such container",
                    500: "server error"
                },
                modem: modem
            }),
            diff: new Endpoint('id', {
                path: '/containers/${id}/changes',
                method: 'GET',
                forceURLParams: true,
                isStream: true,
                statusCodes: {
                    200: true,
                    404: "no such container",
                    500: "server error"
                },
                modem: modem
            }),
            wait: new Endpoint('id', {
                path: '/containers/${id}/wait',
                method: 'POST',
                statusCodes: {
                    200: true,
                    404: "no such container",
                    500: "server error"
                },
                modem: modem
            })

        },
        images: {
            list: new Endpoint('options', {
                path: '/images/json',
                method: 'GET',
                statusCodes: {
                    200: true,
                    400: "bad parameter",
                    500: "server error"
                },
                modem: modem
            }),
            insert: new Endpoint('id', {
                path: '/images/${id}/insert?',
                method: 'POST',
                isStream: true,
                statusCodes: {
                    200: true,
                    500: "server error"
                },
                modem: modem
            }),
            history: new Endpoint('id', {
                path: 'images/${id}/history',
                method: 'GET',
                statusCodes: {
                    200: true,
                    404: "no such container",
                    500: "server error"
                },
                modem: modem
            }),
            inspect: new Endpoint('id', {
                path: '/images/${id}/json',
                method: 'GET',
                statusCodes: {
                    200: true,
                    500: "server error",
                    404: "no such image"
                },
                modem: modem
            }),
            push: new Endpoint('id', {
                path: '/images/${id}/push',
                method: 'POST',
                isStream: true,
                statusCodes: {
                    200: true,
                    500: "server error",
                    404: "no such image"
                },
                modem: modem
            }),
            tag: new Endpoint('id', {
                path: '/images/${id}/tag?',
                method: 'POST',
                options: opts,
                isStream: true,
                statusCodes: {
                    200: true,
                    404: "bad parameter",
                    404: "no such image",
                    409: "conflict",
                    500: "server error"
                },
                modem: modem
            }),
            remove: new Endpoint('id', {
                path: '/images/${id}',
                method: 'DELETE',
                options: opts,
                statusCodes: {
                    204: true,
                    400: 'bad parameter',
                    404: "no such image",
                    409: "conflict",
                    500: "server error"
                },
                modem: modem
            })
        },
        info: new Endpoint('options', {
            path: '/info',
            method: 'GET',
            statusCodes: {
                200: true,
                500: "server error"
            },
            modem: modem
        }),
        version: new Endpoint('options', {
            path: '/version',
            method: 'GET',
            statusCodes: {
                200: true,
                500: "server error"
            },
            modem: modem
        }),
        setAuth: new Endpoint('options', {
            path: '/auth',
            method: 'POST',
            args: {
                username: {
                    required: true,
                    type: 'string'
                },
                email: {
                    required: true,
                    type: 'string',
                    regex: validator.regex.email
                },
                password: {
                    required: true,
                    type: 'string'
                }
            },
            statusCodes: {
                200: true,
                204: true,
                500: "server error"
            },
            modem: modem
        }),
        commit: new Endpoint('id', {
            path: '/commit?container=${id}',
            method: 'POST',
            args: {
                repo: {
                    required: true,
                    type: 'string'
                },
                tag: {
                    required: true,
                    type: 'string'
                },
                message: {
                    required: true,
                    type: 'string'
                }
            },
            statusCodes: {
                201: true,
                404: "no such container",
                500: "server error"
            },
            modem: modem
        }),
        build: new Endpoint('file', {
            path: '/build?',
            method: 'POST',
            statusCodes: {
                200: true,
                500: "server error"
            },
            modem: modem
        }),
        events: new Endpoint('options', {
            path: '/events',
            method: 'GET',
            isStream: true,
            statusCodes: {
                200: true,
                500: "server error"
            },
            modem: modem
        }),
    };
};

module.exports = Docker;

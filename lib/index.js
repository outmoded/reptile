'use strict';

// Load modules

const Net = require('net');
const Hoek = require('hoek');
const Repl = require('repl');
const Package = require('../package.json');


// Declare internals

const internals = {
    defaults: {
        port: 9000,
        localOnly: true
    }
};


exports.register = function (server, options, next) {

    const settings = Hoek.applyToDefaults(internals.defaults, options);

    const tcp = Net.createServer((socket) => {

        if (settings.localOnly) {
            const address = socket.address();
            if ((address.family === 'IPv6' && address.address !== '::1' && address.address !== '::ffff:127.0.0.1')
            || (address.family === 'IPv4' && address.address !== '127.0.0.1')) {
                socket.destroy();
                return;
            }
        }

        const context = Hoek.applyToDefaults({ socket: socket, server: tcp }, options.context || {});

        const replOptions = Hoek.applyToDefaults({ useGlobal: false, terminal: true }, settings.replOptions || {});
        replOptions.input = socket;
        replOptions.output = socket;
        const repl = Repl.start(replOptions);

        repl.once('exit', () => {

            socket.end();
        });

        Hoek.merge(repl.context, context);

    });

    tcp.once('listening', () => {

        next();
    });

    tcp.listen(settings.port);
};


exports.register.attributes = {
    pkg: Package
};

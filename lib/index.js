'use strict';

// Load modules

const Net = require('net');
const Util = require('util');
const Repl = require('repl');
const Barrier = require('cb-barrier');
const Hoek = require('hoek');
const Package = require('../package.json');


// Declare internals

const internals = {
    defaults: {
        port: 9000,
        localOnly: true
    }
};


exports.register = async function (server, options) {

    const settings = Hoek.applyToDefaults(internals.defaults, options);

    const barrier = new Barrier();
    const tcp = Net.createServer((socket) => {

        if (settings.localOnly) {
            const address = socket.address();
            if ((address.family === 'IPv6' && address.address !== '::1' && address.address !== '::ffff:127.0.0.1')
                || (address.family === 'IPv4' && address.address !== '127.0.0.1')) {

                socket.destroy();
                return;
            }
        }

        const context = Hoek.applyToDefaults({ socket, server: tcp }, options.context || {});

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

        barrier.pass();
    });

    // Keep track of all connections
    const sockets = [];
    tcp.on('connection', (socket) => {

        sockets.push(socket);
        socket.once('close', () => {

            sockets.splice(sockets.indexOf(socket), 1);
        });
    });

    // Close all connections when Hapi server is stopped
    server.ext({
        type: 'onPostStop',
        method: async () => {

            // Close server (which keeps existing connections)
            Util.promisify(tcp.close.bind(tcp))();

            // Close all sockets
            await Promise.all(sockets.map((socket) => {

                return Util.promisify(socket.end.bind(socket))('\n', 'utf8');
            }));

            return null;
        }
    });

    tcp.listen(settings.port);
    await barrier;
};


exports.pkg = Package;

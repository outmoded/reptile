// Load modules

var Net = require('net');
var Hoek = require('hoek');
var Repl = require('repl');
var Package = require('../package.json');


// Declare internals

var internals = {
    defaults: {
        port: 9000,
        localOnly: true
    }
};


exports.register = function (server, options, next) {

    var settings = Hoek.applyToDefaults(internals.defaults, options);

    var tcp = Net.createServer(function (socket) {

        if (settings.localOnly) {
            var address = socket.address();
            if ((address.family === 'IPv6' && address.address !== '::1') || (address.family === 'IPv4' && address.address !== '127.0.0.1')) {
                socket.destroy();
                return;
            }
        }

        var context = Hoek.applyToDefaults({ socket: socket, server: tcp }, options.context || {});

        var repl = Repl.start({
            input: socket,
            output: socket,
            terminal: true,
            useGlobal: false
        });

        repl.once('exit', function () {

            socket.end();
        });

        Hoek.merge(repl.context, context);

    });

    tcp.once('listening', function () {

        next();
    });

    tcp.listen(settings.port);
};


exports.register.attributes = {
    pkg: Package
};

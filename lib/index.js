// Load modules

var Net = require('net');
var Hoek = require('hoek');
var Repl = require('repl');


// Declare internals

var internals = {
    defaults: {
        port: 9000,
        localOnly: true
    }
};


exports.register = function (pack, options, next) {

    var settings = Hoek.applyToDefaults(internals.defaults, options || {});

    var server = Net.createServer(function (socket) {

        if (settings.localOnly && socket.address().address !== '127.0.0.1') {
            socket.destroy();
            return;
        }

        var repl = Repl.start({
            input: socket,
            output: socket,
            terminal: true,
            useGlobal: true
        });

        repl.once('exit', function () {

            socket.end();
        });

        repl.context.socket = socket;
        repl.context.pack = pack;
    });

    server.once('listening', function () {

        next();
    });

    server.listen(settings.port);
};

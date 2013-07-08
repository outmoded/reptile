// Load modules

var Hoek = require('hoek');
var Net = require('net');
var Repl = require('repl');


// Declare internals

var internals = {
    defaults: {
        port: 8039
    }
};


exports.register = function (pack, options, next) {

    var settings = Hoek.applyToDefaults(internals.defaults, options || {});

    var server = Net.createServer(function (socket) {

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

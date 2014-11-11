var Hapi = require('hapi');
var Reptile = require('../');


var server = new Hapi.Server(8080);
server.pack.register({ plugin: Reptile }, function (err) {

    if (err) {
        console.error(err);
        process.exit(1);
    }

    console.log('REPL available on port 9000');
});

server.start(function () {

    console.log('Server started at http://localhost:' + server.info.port);
});
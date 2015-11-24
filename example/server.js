'use strict';

const Hapi = require('hapi');
const Reptile = require('../');

const server = new Hapi.Server();
server.connection({ port: 8080 });
server.register(Reptile, (err) => {

    if (err) {
        console.error(err);
        process.exit(1);
    }

    console.log('REPL available on port 9000');
});

server.start(() => {

    console.log('Server started at http://localhost:' + server.info.port);
});

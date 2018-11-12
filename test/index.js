'use strict';

// Load modules

const Net = require('net');
const Barrier = require('cb-barrier');
const Code = require('code');
const Hapi = require('hapi');
const Lab = require('lab');
const Reptile = require('../');


// Declare internals

const internals = {};


// Test shortcuts

const lab = exports.lab = Lab.script();
const it = lab.it;
const expect = Code.expect;


internals.availablePort = function () {

    const barrier = new Barrier();
    const server = Net.createServer();
    server.listen(0, () => {

        const port = server.address().port;
        server.close(() => {

            barrier.pass(port);
        });
    });

    return barrier;
};

it('creates a REPL that a client can connect to over TCP IPv4', async () => {

    const barrier = new Barrier();
    const server = Hapi.server();
    const port = await internals.availablePort();

    await server.register({ plugin: Reptile, options: { port } });

    const address = Net.Socket.prototype.address;
    Net.Socket.prototype.address = function () {

        Net.Socket.prototype.address = address;
        return {
            family: 'IPv4',
            address: '127.0.0.1'
        };
    };

    const sock = Net.connect(port);
    let state = 0;

    sock.on('readable', () => {

        const buffer = sock.read();
        if (!buffer) {
            return;
        }

        const result = buffer.toString('ascii');

        if (state === 0) {
            expect(result.indexOf('>')).to.not.equal(-1);
            sock.write('server.hapi\n');
        }
        else if (state === 1) {
            sock.write('.exit\n');
        }
        else if (state === 2) {
            barrier.pass();
        }

        state++;
    });

    return barrier;
});

it('creates a REPL that a client can connect to over TCP IPv6', async () => {

    const barrier = new Barrier();
    const server = Hapi.server();
    const port = await internals.availablePort();

    await server.register({ plugin: Reptile, options: { port } });

    const address = Net.Socket.prototype.address;
    Net.Socket.prototype.address = function () {

        Net.Socket.prototype.address = address;
        return {
            family: 'IPv6',
            address: '::1'
        };
    };

    const sock = Net.connect(port);
    let state = 0;

    sock.on('readable', () => {

        const buffer = sock.read();
        if (!buffer) {
            return;
        }

        const result = buffer.toString('ascii');

        if (state === 0) {
            expect(result.indexOf('>')).to.not.equal(-1);
            sock.write('pack.hapi\n');
        }
        else if (state === 1) {
            sock.write('.exit\n');
        }
        else if (state === 2) {
            barrier.pass();
        }

        state++;
    });

    return barrier;
});

it('creates a REPL that a client can connect to over TCP IPv6 with format ::ffff:127.0.0.1', async () => {

    const barrier = new Barrier();
    const server = Hapi.server();
    const port = await internals.availablePort();

    await server.register({ plugin: Reptile, options: { port } });

    const address = Net.Socket.prototype.address;
    Net.Socket.prototype.address = function () {

        Net.Socket.prototype.address = address;
        return {
            family: 'IPv6',
            address: '::ffff:127.0.0.1'
        };
    };

    const sock = Net.connect(port);
    let state = 0;

    sock.on('readable', () => {

        const buffer = sock.read();
        if (!buffer) {
            return;
        }

        const result = buffer.toString('ascii');

        if (state === 0) {
            expect(result.indexOf('>')).to.not.equal(-1);
            sock.write('pack.hapi\n');
        }
        else if (state === 1) {
            sock.write('.exit\n');
        }
        else if (state === 2) {
            barrier.pass();
        }

        state++;
    });

    await barrier;
});

it('does not allow remote access by default IPv4', async () => {

    const barrier = new Barrier();
    const server = Hapi.server();
    const port = await internals.availablePort();

    await server.register({ plugin: Reptile, options: { port } });

    const address = Net.Socket.prototype.address;
    Net.Socket.prototype.address = function () {

        Net.Socket.prototype.address = address;
        return {
            family: 'IPv4',
            address: '192.168.0.1'
        };
    };

    const sock = Net.connect(port);

    sock.once('close', () => {

        barrier.pass();
    });

    sock.on('readable', () => {

        expect(sock.read()).to.not.exist();
    });

    await barrier;
});

it('does not allow remote access by default IPv6', async () => {

    const barrier = new Barrier();
    const server = Hapi.server();
    const port = await internals.availablePort();

    await server.register({ plugin: Reptile, options: { port } });

    const address = Net.Socket.prototype.address;
    Net.Socket.prototype.address = function () {

        Net.Socket.prototype.address = address;
        return {
            family: 'IPv6',
            address: '3ffe:1900:4545:3:200:f8ff:fe21:67cf'
        };
    };

    const sock = Net.connect(port);

    sock.once('close', () => {

        barrier.pass();
    });

    sock.on('readable', () => {

        expect(sock.read()).to.not.exist();
    });

    await barrier;
});

it('does allow remote access when localOnly is false IPv4', async () => {

    const barrier = new Barrier();
    const server = Hapi.server();
    const port = await internals.availablePort();

    await server.register({ plugin: Reptile, options: { port, localOnly: false } });

    const address = Net.Socket.prototype.address;
    Net.Socket.prototype.address = function () {

        Net.Socket.prototype.address = address;
        return {
            family: 'IPv4',
            address: '192.168.0.1'
        };
    };

    const sock = Net.connect(port);
    let state = 0;

    sock.on('readable', (size) => {

        const buffer = sock.read();
        if (!buffer) {
            return;
        }

        const result = buffer.toString('ascii');

        if (state === 0) {
            expect(result.indexOf('>')).to.not.equal(-1);
            sock.write('pack.hapi\n');
        }
        else if (state === 1) {
            sock.write('.exit\n');
        }
        else if (state === 2) {
            barrier.pass();
        }

        state++;
    });

    await barrier;
});

it('does allow remote access when localOnly is false IPv6', async () => {

    const barrier = new Barrier();
    const server = Hapi.server();
    const port = await internals.availablePort();

    await server.register({ plugin: Reptile, options: { port, localOnly: false } });

    const address = Net.Socket.prototype.address;
    Net.Socket.prototype.address = function () {

        Net.Socket.prototype.address = address;
        return {
            family: 'IPv6',
            address: '3ffe:1900:4545:3:200:f8ff:fe21:67cf'
        };
    };

    const sock = Net.connect(port);
    let state = 0;

    sock.on('readable', (size) => {

        const buffer = sock.read();
        if (!buffer) {
            return;
        }

        const result = buffer.toString('ascii');

        if (state === 0) {
            expect(result.indexOf('>')).to.not.equal(-1);
            sock.write('pack.hapi\n');
        }
        else if (state === 1) {
            sock.write('.exit\n');
        }
        else if (state === 2) {
            barrier.pass();
        }

        state++;
    });

    await barrier;
});

it('allows the context of the REPL to be customized', async () => {

    const barrier = new Barrier();
    const config = {
        localOnly: false,
        context: {
            helloWorld: 'hola mundo'
        }
    };

    const server = Hapi.server();
    const port = await internals.availablePort();

    config.port = port;

    await server.register({ plugin: Reptile, options: config });

    const address = Net.Socket.prototype.address;
    Net.Socket.prototype.address = function () {

        Net.Socket.prototype.address = address;
        return {
            family: 'IPv4',
            address: '192.168.0.1'
        };
    };

    const sock = Net.connect(port);
    let result = '';
    let state = 0;

    sock.on('readable', (size) => {

        const buffer = sock.read();
        if (!buffer) {
            return;
        }

        result += buffer.toString('ascii');
        if (state === 0) {
            sock.write('helloWorld\n');
        }
        else if (state === 1) {
            sock.write('.exit\n');
        }
        else {
            expect(result).to.contain('hola mundo');
            barrier.pass();
        }

        state++;
    });

    await barrier;
});

it('allows the use of extra repl start options', async () => {

    const barrier = new Barrier();
    const config = {
        replOptions: {
            prompt: 'neat> '
        }
    };

    const server = Hapi.server();
    const port = await internals.availablePort();

    config.port = port;

    await server.register({ plugin: Reptile, options: config });

    const address = Net.Socket.prototype.address;
    Net.Socket.prototype.address = function () {

        Net.Socket.prototype.address = address;
        return {
            family: 'IPv4',
            address: '127.0.0.1'
        };
    };

    const sock = Net.connect(port);
    let state = 0;

    sock.on('readable', () => {

        const buffer = sock.read();
        if (!buffer) {
            return;
        }

        const result = buffer.toString('ascii');

        if (state === 0) {
            expect(result.indexOf('neat>')).to.not.equal(-1);
            sock.write('pack.hapi\n');
        }
        else if (state === 1) {
            sock.write('.exit\n');
        }
        else if (state === 2) {
            barrier.pass();
        }

        state++;
    });

    return barrier;
});

it('closes all connections when the server is stopped', async () => {

    const barrier = new Barrier();
    const server = Hapi.server();
    const port = await internals.availablePort();

    await server.register({ plugin: Reptile, options: { port } });

    const address = Net.Socket.prototype.address;
    Net.Socket.prototype.address = function () {

        Net.Socket.prototype.address = address;
        return {
            family: 'IPv4',
            address: '127.0.0.1'
        };
    };

    const sock = Net.connect(port);
    let state = 0;

    sock.once('close', () => {

        barrier.pass();
    });

    sock.on('readable', () => {

        const buffer = sock.read();
        if (!buffer) {
            return;
        }

        if (state === 0) {
            server.stop();
        }

        state++;
    });

    return barrier;
});

'use strict';

// Load modules

const Code = require('code');
const Hapi = require('hapi');
const Lab = require('lab');
const Net = require('net');
const Reptile = require('../');


// Declare internals

const internals = {};


// Test shortcuts

const lab = exports.lab = Lab.script();
const it = lab.it;
const expect = Code.expect;


internals.availablePort = function (callback) {

    const server = Net.createServer();
    server.listen(0, () => {

        const port = server.address().port;
        server.close(() => {

            callback(port);
        });
    });
};

it('creates a REPL that a client can connect to over TCP IPv4', (done) => {

    const server = new Hapi.Server();
    internals.availablePort((port) => {

        server.register({ register: Reptile, options: { port: port } }, (err) => {

            expect(err).to.not.exist();

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
                    done();
                }

                state++;
            });
        });
    });
});

it('creates a REPL that a client can connect to over TCP IPv6', (done) => {

    const server = new Hapi.Server();
    internals.availablePort((port) => {

        server.register({ register: Reptile, options: { port: port } }, (err) => {

            expect(err).to.not.exist();

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
                    done();
                }

                state++;
            });
        });
    });
});

it('does not allow remote access by default IPv4', (done) => {

    const server = new Hapi.Server();
    internals.availablePort((port) => {

        server.register({ register: Reptile, options: { port: port } }, (err) => {

            expect(err).to.not.exist();

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

                done();
            });

            sock.on('readable', () => {

                expect(sock.read()).to.not.exist();
            });
        });
    });
});

it('does not allow remote access by default IPv6', (done) => {

    const server = new Hapi.Server();
    internals.availablePort((port) => {

        server.register({ register: Reptile, options: { port: port } }, (err) => {

            expect(err).to.not.exist();

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

                done();
            });

            sock.on('readable', () => {

                expect(sock.read()).to.not.exist();
            });
        });
    });
});

it('does allow remote access when localOnly is false IPv4', (done) => {

    const server = new Hapi.Server();
    internals.availablePort((port) => {

        server.register({ register: Reptile, options: { port: port, localOnly: false } }, (err) => {

            expect(err).to.not.exist();

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
                    done();
                }

                state++;
            });
        });
    });
});

it('does allow remote access when localOnly is false IPv6', (done) => {

    const server = new Hapi.Server();
    internals.availablePort((port) => {

        server.register({ register: Reptile, options: { port: port, localOnly: false } }, (err) => {

            expect(err).to.not.exist();

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
                    done();
                }

                state++;
            });
        });
    });
});

it('allows the context of the REPL to be customized', (done) => {

    const config = {
        localOnly: false,
        context: {
            helloWorld: 'hola mundo'
        }
    };

    const server = new Hapi.Server();
    internals.availablePort((port) => {

        config.port = port;

        server.register({ register: Reptile, options: config }, (err) => {

            expect(err).to.not.exist();

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
                    done();
                    done = function () {};
                }

                state++;
            });
        });
    });
});

it('allows the use of extra repl start options', (done) => {

    const config = {
        replOptions: {
            prompt: 'neat> '
        }
    };

    const server = new Hapi.Server();
    internals.availablePort((port) => {

        config.port = port;

        server.register({ register: Reptile, options: config }, (err) => {

            expect(err).to.not.exist();

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
                    done();
                }

                state++;
            });
        });
    });
});

// Load modules

var Lab = require('lab');
var Hapi = require('hapi');
var Net = require('net');
var Reptile = require('../');


// Declare internals

var internals = {};


// Test shortcuts

var lab = exports.lab = Lab.script();
var before = lab.before;
var after = lab.after;
var describe = lab.describe;
var it = lab.it;
var expect = Lab.expect;


describe('Reptile', function () {

    internals.availablePort = function (callback) {

        var server = Net.createServer();
        server.listen(0, function () {

            var port = server.address().port;
            server.close(function () {

                callback(port);
            });
        });
    };

    it('creates a REPL that a client can connect to over TCP', function (done) {

        var server = new Hapi.Server();
        internals.availablePort(function (port) {

            server.pack.register({ plugin: Reptile, options: { port: port } }, function (err) {

                expect(err).to.not.exist;

                var address = Net.Socket.prototype.address;
                Net.Socket.prototype.address = function () {

                    Net.Socket.prototype.address = address;
                    return {
                        address: '127.0.0.1'
                    };
                };
                var sock = Net.connect(port);
                var state = 0;

                sock.on('readable', function () {

                    var buffer = sock.read();
                    if (!buffer) {
                        return;
                    }

                    var result = buffer.toString('ascii');

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

    it('does not allow remote access by default', function (done) {

        var server = new Hapi.Server();
        internals.availablePort(function (port) {

            server.pack.register({ plugin: Reptile, options: { port: port } }, function (err) {

                expect(err).to.not.exist;

                var address = Net.Socket.prototype.address;
                Net.Socket.prototype.address = function () {

                    Net.Socket.prototype.address = address;
                    return {
                        address: '192.168.0.1'
                    };
                };
                var sock = Net.connect(port);

                sock.once('close', function () {

                    done();
                });

                sock.on('readable', function () {

                    expect(sock.read()).to.not.exist;
                });
            });
        });
    });

    it('does allow remote access when localOnly is false', function (done) {

        var server = new Hapi.Server();
        internals.availablePort(function (port) {

            server.pack.register({ plugin: Reptile, options: { port: port, localOnly: false } }, function (err) {

                expect(err).to.not.exist;

                var address = Net.Socket.prototype.address;
                Net.Socket.prototype.address = function () {

                    Net.Socket.prototype.address = address;
                    return {
                        address: '192.168.0.1'
                    };
                };

                var sock = Net.connect(port);
                var state = 0;

                sock.on('readable', function (size) {

                    var buffer = sock.read();
                    if (!buffer) {
                        return;
                    }

                    var result = buffer.toString('ascii');

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

    it('allows the context of the REPL to be customized', function (done) {

        var config = {
            localOnly: false,
            context: {
                helloWorld: 'hola mundo'
            }
        };

        var server = new Hapi.Server();
        internals.availablePort(function (port) {

            config.port = port;

            server.pack.register({ plugin: Reptile, options: config }, function (err) {

                expect(err).to.not.exist;

                var address = Net.Socket.prototype.address;
                Net.Socket.prototype.address = function () {

                    Net.Socket.prototype.address = address;
                    return {
                        address: '192.168.0.1'
                    };
                };

                var sock = Net.connect(port);
                var result = '';
                var state = 0;

                sock.on('readable', function (size) {

                    var buffer = sock.read();
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
                    }

                    state++;
                });
            });
        });
    });
});

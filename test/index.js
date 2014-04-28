// Load modules

var Lab = require('lab');
var Hapi = require('hapi');
var Net = require('net');


// Declare internals

var internals = {};


// Test shortcuts

var expect = Lab.expect;
var before = Lab.before;
var after = Lab.after;
var describe = Lab.experiment;
var it = Lab.test;


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

            server.pack.require('../', { port: port }, function (err) {

                expect(err).to.not.exist;

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

    it('does not allow remote access by default', function (done) {

        var server = new Hapi.Server();
        internals.availablePort(function (port) {

            server.pack.require('../', { port: port }, function (err) {

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

            server.pack.require('../', { port: port, localOnly: false }, function (err) {

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
});
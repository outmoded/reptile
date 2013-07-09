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

    it('creates a REPL that a client can connect to over TCP', function (done) {

        var server = new Hapi.Server();
        server.pack.require('../', function (err) {

            expect(err).to.not.exist;

            var sock = Net.connect(9000);
            var state = 0;

            sock.on('readable', function () {

                var result = sock.read().toString('ascii');

                if (state === 0) {
                    expect(result.indexOf('>')).to.not.equal(-1);
                    sock.write('pack.hapi\n');
                }
                else if (state === 1) {
                    expect(result.indexOf('hapi')).to.equal(5);
                    sock.write('.exit\n');
                }
                else if (state === 2) {
                    done();
                }

                state++;
            });
        });
    });

    it('doesn\'t allow remote access by default', function (done) {

        var server = new Hapi.Server();
        server.pack.require('../', { port: 9001 }, function (err) {

            expect(err).to.not.exist;

            var address = Net.Socket.prototype.address;
            Net.Socket.prototype.address = function () {

                Net.Socket.prototype.address = address;
                return {
                    address: '192.168.0.1'
                };
            };
            var sock = Net.connect(9001);

            sock.once('close', function () {

                done();
            });

            sock.on('readable', function () {

                expect(sock.read()).to.not.exist;
            });
        });
    });
});
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

            var sock = Net.connect(8039);
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
});
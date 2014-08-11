# reptile

[**hapi**](https://github.com/hapijs/hapi) plugin for creating a REPL

[![Build Status](https://secure.travis-ci.org/hapijs/reptile.png)](http://travis-ci.org/hapijs/reptile)

[![NPM](https://nodei.co/npm/reptile.png?downloads=true&stars=true)](https://nodei.co/npm/reptile/)

Lead Maintainer: [Wyatt Preul](https://github.com/wpreul)

The following options are available when configuring _'reptile'_:

- `port` - the port to use to connect to the REPL.  Defaults to port 9000.
- `localOnly` - determines if only traffic from localhost is allowed to connect to the REPL.  Defaults to true.
- `context` - an object whose properties will be added to the REPL context

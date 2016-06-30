/* vim: set expandtab tabstop=4 shiftwidth=4 softtabstop=4: */
/*jslint devel: true, node: true, nomen: true, stupid: true */
/*global before, describe, it */
'use strict';



// Variables
let secret;
const crypto = require('crypto'),
    bodyParser = require('body-parser'),
    expect = require('expect.js'),
    express = require('express'),
    loggers = require('proteus-logger'),
    activity = require('../'),
    config = {
        appenders: {
            console: {
                type: 'console',
                layout: {
                    json: {
                        time_key: 'time',
                        message_key: 'message'
                    }
                }
            }
        },
        loggers: {
            default: {
                appenders: ['console'],
                level: 'debug'
            }
        }
    },
    options = {
        api_key: 'TEST_API_KEY',
        secret: 'TEST_API_SECRET',
        hostname: 'localhost',
        port: 30000,
        path: '/api'
    },
    activity_logger = activity(options);



// Before
before(function (done) {
    const app = express(),
        hmac = crypto.createHmac('sha256', options.secret);
    hmac.update(options.api_key);
    app.use(bodyParser.json());
    app.use(function (req, res) {
        res.status(200).json({
            api_key: req.get('X-API-Key'),
            secret: req.get('X-API-Secret'),
            data: req.body.data
        });
    });

    loggers.configure(config);
    secret = hmac.digest('base64');
    app.listen(options.port);

    done();
});


// Test
describe('Test', function () {
    it('Test', function (done) {
        const key = 'TEST_KEY',
            data = {
                value: {},
                extra: {}
            };
        activity_logger.log(loggers, key, data, function (error, result) {
            if (error) {
                return done(error);
            }

            expect(result.api_key).to.be(options.api_key);
            expect(result.secret).to.be(secret);
            expect(result.data).to.eql({
                key: key,
                value: data
            });

            done();
        });
    });
});



/*
 * Local variables:
 * tab-width: 4
 * c-basic-offset: 4
 * c-hanging-comment-ender-p: nil
 * End:
 */

/* vim: set expandtab tabstop=4 shiftwidth=4 softtabstop=4: */
/*jslint devel: true, node: true, nomen: true, stupid: true */
'use strict';



// Variables
const crypto = require('crypto'),
    http = require('http'),
    url = require('url');


/**
 * Activity logger
 *
 * @class
 */
class EqActivity {
    /**
     * Constructor
     *
     * @constructs EqActivity
     */
    constructor(options) {
        const self = this,
            url_object = url.parse(options.url || ''),
            hmac = crypto.createHmac('sha256', options.secret);
        self.options = options;
        self.url = options.url;
        self.api_key = options.api_key;
        self.hostname = options.hostname || url_object.hostname || 'localhost';
        self.port = options.port || url_object.port || 3000;
        self.path = options.path || url_object.path || '/api';

        hmac.update(options.api_key);
        self.secret = hmac.digest('base64');
    }

    /**
     * Send API request
     *
     * @param {Object} data
     * @param {Function} callback
     */
    request(data, callback) {
        const self = this,
            parameters = JSON.stringify({
                method: 'log',
                data: data || {}
            }),
            options = {
                hostname: self.hostname,
                port: self.port,
                path: self.path,
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Content-Length': Buffer.byteLength(parameters),
                    'X-API-Key': self.api_key,
                    'X-API-Secret': self.secret
                }
            },
            request = http.request(options, function (res) {
                res.setEncoding('UTF-8');
                res.on('data', function (chunk) {
                    res.text = (res.text || '') + chunk;
                });
                res.on('end', function () {
                    callback(null, JSON.parse(res.text));
                });
            });

        request.write(parameters);
        request.end();
    }

    /**
     * Log activity
     *
     * @param {Object} loggers
     * @param {string} key
     * @param {Object} value
     * @param {Function} callback
     */
    log(loggers, key, value, callback) {
        const self = this,
            logger = loggers.get('activity'),
            parameters = {
                key: key,
                value: value
            };
        logger.info(parameters);
        self.request(parameters, callback);
    }
}


// Export module
module.exports = function (options) {
    return new EqActivity(options || {});
};



/*
 * Local variables:
 * tab-width: 4
 * c-basic-offset: 4
 * c-hanging-comment-ender-p: nil
 * End:
 */

var _ = require('lodash');
var fs = require('fs');
var path = require('path');
var file = require('./file');
var Execution = require('execution');
var Record = require('record');

var Request = Execution.extend({
    name: "request",
    description: "Request data from remote",
    options: {
        url: {
            description: "url path"
        },
        method: {
            description: "http method"
        }
    },
    execute: function (resolve, reject) {
        var options = this.options;
        var logger = this.logger;
        var inputs = this.inputs;

        logger.log(this.name, options.url);

        var request = require('request');
        request(options, function (error, response, body) {
            if (!error && response.statusCode == 200) {
                var record = new Record({
                    path: options.url,
                    contents: body
                });
                resolve(inputs.concat(record));
            } else {
                reject(error)
            }
        })

    }
});

module.exports = function (records, options, logger) {
    if (_.isString(options)) {
        options = {url: options};
    }
    var request = new Request;
    return request.run(records, options, logger)
};

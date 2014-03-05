var _ = require('lodash');
var fs = require('fs');
var Execution = require('execution');
var Record = require('record');

var Read = Execution.extend({
    name: "read",
    description: "Read data from file",
    options: {
        paths: {
            description: "Files path"
        },
        encoding: {
            default: "utf8",
            description: "File encoding"
        },
        mode: {
            description: "File mode"
        },
        flag: {
            description: "File flag"
        }
    },
    execute: function (resolve, reject) {
        var options = this.options;
        var logger = this.logger;
        var inputs = this.inputs;

        var paths = options.paths;
        var self = this;

        var records = paths.map(function (filepath) {
            logger.log(self.name, filepath);
            return new Record({
                path: filepath,
                contents: fs.readFileSync(filepath, options)
            })
        });

        resolve(inputs.concat(records));
    }

});

module.exports = function (records, options, logger) {
    if (_.isString(options) || _.isArray(options)) {
        options = {paths: [].concat(options)};
    }
    var read = new Read;
    return read.run(records, options, logger)
};

var _ = require('lodash');
var fs = require('fs');
var path = require('path');
var file = require('./file');
var Execution = require('execution');
var Record = require('record');

var Write = Execution.extend({
    name: "write",
    description: "Writes data to a file, replacing the file if it already exists",
    options: {
        path: {
            description: "File path"
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

        // TODO path is directory
        var filepath = options.path;
        var self = this;

        var records = inputs.map(function (record) {
            var filename = record.path;
            var contents = record.contents;

            logger.log(self.name, filepath);

            return new Record({
                path: self.write(filepath, contents, options),
                contents: contents
            })
        });

        resolve(records);
    },
    write: function (filepath, contents, options) {

        // Make sure destination directories exist.
        var parentDir = path.dirname(filepath);
        if (!fs.existsSync(parentDir)) {
            file.mkdir(parentDir);
        }
        // filter query string
        filepath = file.normalize(filepath);
        fs.writeFileSync(filepath, contents, options);
        return filepath;
    }

});

module.exports = function (records, options, logger) {
    if (_.isString(options)) {
        options = {path: options};
    }
    var write = new Write;
    return write.run(records, options, logger)
};

var path = require('path');
var Execution = require('execution');
var _ = require('lodash');
var file = require('./file');

var Copy = Execution.extend({
    name: 'copy',
    description: "Copy one or more files to another location",
    options: {
        path: {
            description: "File path"
        },
        "flatten": {
            description: "remove all path parts from generated dest paths"
        },
        "recursive": {
            default: true, description: "copy directories recursively"
        },
        "verbose": {
            default: true, description: "shows file/directory names after they are copied"
        },
        "force": {
            default: true, description: "force overwriting the existing files"
        },
        "update": {
            default: false, description: "copy only when the SOURCE file is newer than the destination file or when the destination file is missing"
        },
        "backup": {
            default: true, description: "make a backup of each existing destination file"
        },
        "parents": {
            default: false, description: "full path to be copied to the destination directory"
        }
    },
    execute: function (resolve, reject) {

        var options = this.options;
        var logger = this.logger;
        var inputs = this.inputs;

        var dest = options.path;
        var verbose = options.verbose;
        var parents = options.parents;

        if (!dest) {
            throw Error('copy task dest is null');
        }

        var records = inputs.map(function (record) {
            var filepath = record.path;
            // eg. source/path/file.js -> dest/path => dest/path/source/path/file.js
            if (parents) {
                if (!file.isDir(dest)) {
                    throw new Error('With parents options, the copy destination "' + dest + '" must be a directory')
                }
                dest = path.join(dest, filepath);
            }

            var target = dest;

            if (file.isFile(filepath) && file.isDir(dest)) {
                var filename = file.basename(filepath);
                target = path.join(dest, filename);
            }

            file.copy(filepath, target, options);
            verbose && logger.log('copy', filepath + " > " + target);

            record.clone();
            record.path = target;
            return record;
        });

        resolve(records);
    }
});

module.exports = function (records, options, logger) {
    if (_.isString(options)) {
        options = {path: options};
    }
    return (new Copy).run(records, options, logger)
};

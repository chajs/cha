var fs = require('fs');
var path = require('path');
var Execution = require('execution');
var Record = require('record');

var UglifyJS = Execution.extend({
    name: "uglifyjs",
    description: "Minify javascript files with uglifyjs",
    options: {
        fromString: true
    },
    execute: function (resolve, reject) {
        var options = this.options;
        var logger = this.logger;
        var inputs = this.inputs;

        var records = inputs.map(function (record) {
            var input = record.contents.toString();
            // {code: "", map: ""}
            // Minify files, fail on error.
            try {
                var UglifyJS = require('uglify-js');
                var result = UglifyJS.minify(input, options);
            } catch (e) {
                var err = new Error('Uglification failed.');
                if (e.message) {
                    err.message += '\n' + e.message + '. \n';
                    if (e.line) {
                        err.message += 'Line ' + e.line + ' in ' + record.path + '\n';
                    }
                }
                err.origError = e;
                throw err;
            }

            return new Record({
                path: record.path,
                contents: result.code
            })

        });

        resolve(records);
    }
})

module.exports = UglifyJS;

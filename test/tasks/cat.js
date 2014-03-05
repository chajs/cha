var _ = require('lodash');
var fs = require('fs');
var path = require('path');
var Execution = require('execution');
var Record = require('record');

var Concat = Execution.extend({
    name: 'concat',
    description: 'Concatenate files',
    options: {
        banner: {
            default: '',
            description: 'The string will be prepended to the beginning of the contents'
        },
        endings: {
            default: '\n',
            description: 'Make sure each file endings with newline'
        },
        footer: {
            default: '',
            description: 'The string will be append to the end of the contents'
        }
    },
    execute: function (resolve, reject) {
        var options = this.options;
        var logger = this.logger;
        var inputs = this.inputs;

        var endings = options.endings;
        var banner = options.banner;
        var footer = options.footer;

        var paths = _.pluck(inputs, 'path');
        logger.log(this.name, paths.join(','));

        var contents = this.concat(inputs, endings);

        resolve(new Record({
            contents: banner + contents + footer
        }));
    },
    concat: function (inputs, endings) {

        return inputs.map(function (record, index, array) {
            var contents = record.contents.toString();
            if (!RegExp(endings + '$').test(contents)) {
                contents += endings;
            }
            return contents;
        }).reduce(function (previousContents, currentContents, index, array) {
                return previousContents + currentContents;
            }, '');

    }
});

module.exports = Concat;

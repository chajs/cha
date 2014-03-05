var _ = require('lodash');
var Record = require('record');
var Execution = require('execution');

var Replace = Execution.extend({
    name: "replace",
    description: "Replace the contents of files",
    options: {
        "search": {
            description: 'A string or regular expression that will be replaced by the new value'
        },

        "replace": {
            description: 'A string that replaces the search string or a function to be invoked to create the new string'
        },

        "flags": {
            default: 'gm', description: 'A String containing any combination of the RegExp flags: g - global match, i - ignore case, m - match over multiple lines. This parameter is only used if the search parameter is a string'
        }
    },

    /**
     * Escape strings that are going to be used in a regex.
     * Escapes punctuation that would be incorrect in a regex.
     * @param str
     * @returns {string}
     */
    escapeRegExp: function (str) {
        if (str == null) return '';
        return String(str).replace(/([.*+?^=!:${}()|[\]\/\\])/g, '\\$1');
    },

    execute: function (resolve) {
        var options = this.options;
        var logger = this.logger;
        var inputs = this.inputs;

        var search = options.search;
        var replace = options.replace;
        var flags = options.flags;
        var escapeRegExp = this.escapeRegExp;

        var records = inputs.map(function (record) {
            var input = record.contents.toString();
            if (_.isString(search)) {
                search = new RegExp(escapeRegExp(search), flags);
            }
            var output = input.replace(search, replace);
            return new Record({
                path: record.path,
                contents: output
            })
        })

        resolve(records);
    }
})

module.exports = Replace;

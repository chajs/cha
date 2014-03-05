var Execution = require('execution');
var Record = require('Record');

var CoffeeScript = Execution.extend({
    name: "coffee",
    description: "Compile CoffeeScript files to JavaScript",
    options: {},
    execute: function (resolve) {
        var options = this.options;
        var inputs = this.inputs;
        var logger = this.logger;

        var records = inputs.map(function (record) {
            var code = record.contents.toString();
            var compiled = require('coffee-script').compile(code, options);
            return new Record({
                path: record.path,
                contents: compiled
            })
        })

        resolve(records)
    }
})

module.exports = CoffeeScript

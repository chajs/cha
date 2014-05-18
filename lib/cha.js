var _ = require('lodash');
var path = require('path');
var Promise = require('./promise');

module.exports = cha;

function cha(exprs) {
    var promises = [];

    if (exprs != null) {
        exprs = [].concat(exprs);
        exprs = _.map(exprs, function (expr) {
            var rule = new RegExp("\\s*(\\w+)\\s*:\\s*(.*)");
            var match = rule.exec(expr);

            if (match) {
                return {
                    task: match[1],
                    options: match[2]
                }
            } else {
                throw new SyntaxError("Unrecognized expression: " + expr);
            }
        });

        promises = _.map(exprs, function (expr) {
            var task = cha.task[expr.task];
            if(!task) throw new Error("Unregistered task: " + expr.task);
            return cha.run(task, null, expr.options);
        })
    }

    // Chaining tasks.
    chaining(Promise, cha.task);
    // Flatten results.
    return Promise.all(promises).then(function (results) {
        return _.flatten(results);
    })
}

function chaining(constructor, fns, logger) {
    // Make task chaining.
    var fn = constructor.prototype;
    // Custom tasks.
    _.each(fns, function (task, name) {
        fn[name] = function (options, settings) {
            return this.then(function (records) {
                return new constructor(function (resolve) {
                    var thenable = cha.run(task, records, options, logger, settings);
                    resolve(thenable);
                });
            });
        }
    });
}

/**
 * Plugins register.
 */
cha.in = function (name, task) {
    if (_.isObject(task) || _.isFunction(task)) {
        cha.task[name] = task;
        return this;
    } else {
        throw new Error("Unrecognized task: " + task);
    }
};

/**
 * Task collection.
 */
cha.task = {};

/**
 * Logging object.
 */
cha.logger = console;

/**
 * Run task
 */
cha.run = function (task, records, options, logger, settings) {
    var run;
    logger = logger || cha.logger;

    if (_.isFunction(task) && task.prototype.run) {
        var t = new task;
        run = t.run.bind(t);
    } else if (_.isObject(task) && task.run) {
        run = task.run.bind(task);
    } else if (_.isFunction(task)) {
        run = task;
    } else {
        throw new TypeError("Unrecognized task");
    }

    var thenable = run(records, options, logger, settings);

    if (!_.isFunction(thenable.then)) {
        throw new TypeError("Must return a thenable");
    }

    return thenable;
};

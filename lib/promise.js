// Based on Promises/A+ implementation

module.exports = Promise

function Handler(onFulfilled, onRejected, resolve, reject){
    this.onFulfilled = typeof onFulfilled === 'function' ? onFulfilled : null
    this.onRejected = typeof onRejected === 'function' ? onRejected : null
    this.resolve = resolve
    this.reject = reject
}

function Promise(resolver) {
    if (typeof this !== 'object') throw new TypeError('Promises must be constructed via new')
    if (typeof resolver !== 'function') throw new TypeError('not a function')
    var state = null
    var value = null
    var deferreds = []
    var self = this

    function handle(deferred) {
        if (state === null) {
            deferreds.push(deferred)
            return
        }

        var cb = state ? deferred.onFulfilled : deferred.onRejected
        if (cb === null) {
            (state ? deferred.resolve : deferred.reject)(value)
            return
        }
        var ret
        try {
            ret = cb(value)
        }
        catch (e) {
            deferred.reject(e)
            return
        }
        deferred.resolve(ret)

    }

    function resolve(newValue) {
        try { //Promise Resolution Procedure: https://github.com/promises-aplus/promises-spec#the-promise-resolution-procedure
            if (newValue === self) throw new TypeError('A promise cannot be resolved with itself.')
            if (newValue && (typeof newValue === 'object' || typeof newValue === 'function')) {
                var then = newValue.then
                if (typeof then === 'function') {
                    invokeResolver(then.bind(newValue), resolve, reject)
                    return
                }
            }
            state = true
            value = newValue
            finale()
        } catch (e) { reject(e) }
    }

    function reject(newValue) {
        state = false
        value = newValue
        finale()
    }

    function finale() {
        for (var i = 0, len = deferreds.length; i < len; i++)
            handle(deferreds[i])

        deferreds = null

    }

    this.then = function(onFulfilled, onRejected) {
        return new Promise(function(resolve, reject) {
            handle(new Handler(onFulfilled, onRejected, resolve, reject))
        })
    }

    invokeResolver(resolver, resolve, reject)

    /**
     * Take a potentially misbehaving resolver function and make sure
     * onFulfilled and onRejected are only called once.
     * Makes no guarantees about asynchrony.
     */
    function invokeResolver(resolver, onFulfilled, onRejected) {
        var done = false;
        try {
            resolver(function (value) {
                if (done) return
                done = true
                onFulfilled(value)
            }, function (reason) {
                if (done) return
                done = true
                onRejected(reason)
            })
        } catch (ex) {
            if (done) return
            done = true
            onRejected(ex)
        }
    }
}

Promise.prototype.catch = function (onRejected) {
    return this.then(null, onRejected);
}

function ValuePromise(value) {
    this.then = function (onFulfilled) {
        if (typeof onFulfilled !== 'function') return this
        return new Promise(function (resolve, reject) {
            asap(function () {
                try {
                    resolve(onFulfilled(value))
                } catch (ex) {
                    reject(ex);
                }
            })
        })
    }
}

ValuePromise.prototype = Object.create(Promise.prototype)

var TRUE = new ValuePromise(true)
var FALSE = new ValuePromise(false)
var NULL = new ValuePromise(null)
var UNDEFINED = new ValuePromise(undefined)
var ZERO = new ValuePromise(0)
var EMPTYSTRING = new ValuePromise('')

Promise.cast = function (value) {
    if (value instanceof Promise) return value

    if (value === null) return NULL
    if (value === undefined) return UNDEFINED
    if (value === true) return TRUE
    if (value === false) return FALSE
    if (value === 0) return ZERO
    if (value === '') return EMPTYSTRING

    if (typeof value === 'object' || typeof value === 'function') {
        try {
            var then = value.then
            if (typeof then === 'function') {
                return new Promise(then.bind(value))
            }
        } catch (ex) {
            return new Promise(function (resolve, reject) {
                reject(ex)
            })
        }
    }

    return new ValuePromise(value)
}

Promise.all = function () {
    var args = Array.prototype.slice.call(arguments.length === 1 && Array.isArray(arguments[0]) ? arguments[0] : arguments)

    return new Promise(function (resolve, reject) {
        if (args.length === 0) return resolve([])
        var remaining = args.length
        function res(i, val) {
            try {
                if (val && (typeof val === 'object' || typeof val === 'function')) {
                    var then = val.then
                    if (typeof then === 'function') {
                        then.call(val, function (val) { res(i, val) }, reject)
                        return
                    }
                }
                args[i] = val
                if (--remaining === 0) {
                    resolve(args);
                }
            } catch (ex) {
                reject(ex)
            }
        }
        for (var i = 0; i < args.length; i++) {
            res(i, args[i])
        }
    })
}

Promise.resolve = function (value) {
    return new Promise(function (resolve) {
        resolve(value);
    });
}

Promise.reject = function (value) {
    return new Promise(function (resolve, reject) {
        reject(value);
    });
}

Promise.race = function (values) {
    return new Promise(function (resolve, reject) {
        values.map(function(value){
            Promise.cast(value).then(resolve, reject);
        })
    });
}

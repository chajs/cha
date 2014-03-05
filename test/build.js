// Load cha library.
var cha = require('../')

// Register tasks that should chaining.
cha.in('glob', require('./tasks/glob'))
    .in('cat', require('./tasks/cat'))
    .in('replace', require('./tasks/replace'))
    .in('write', require('./tasks/write'))
    .in('uglifyjs', require('./tasks/uglifyjs'))
    .in('copy', require('./tasks/copy'))
    .in('request', require('./tasks/request'))

cha()
    .glob({
        patterns: './fixtures/js/*.js',
        cwd: __dirname
    })
    .replace({
        search: 'TIMESTAMP',
        replace: +new Date
    })
    .replace({
        search: /DEBUG/g,
        replace: true
    })
    .replace({
        search: /v(\d+)/,
        replace: function (match, v) {
            var v = Number(v);
            return 'v' + ++v
        }
    })
    .request('http://underscorejs.org/underscore-min.js')
    .cat()
    .uglifyjs()
    .write('./out/foobar.js')
    .copy('./out/foobar2.js')
    .catch(function (err) {
        console.log(err.stack || err)
    })

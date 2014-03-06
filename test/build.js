// Load cha library.
var cha = require('../')
var tasks = require('./tasks')

// Register tasks that should chaining.
cha.in('glob',     tasks.glob)
    .in('cat',     tasks.cat)
    .in('replace', tasks.replace)
    .in('write',   tasks.write)
    .in('uglifyjs',tasks.uglifyjs)
    .in('copy',    tasks.copy)
    .in('request', tasks.request)

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

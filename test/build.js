// Load cha library.
var cha = require('../')

// Register tasks that should chaining.
cha.in('glob',     require('task-glob'))
    .in('combine', require('task-combine'))
    .in('replace', require('task-replace'))
    .in('writer',   require('task-writer'))
    .in('uglifyjs',require('task-uglifyjs'))
    .in('copy',    require('task-copy'))
    .in('request', require('task-request'))

// Define task via chaining calls.
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
    .request('http://underscorejs.org/underscore-min.js')
    .combine()
    .uglifyjs()
    .writer('./test/out/foobar.js')
    .copy('./test/out/foobar2.js')
    .catch(function (err) {
        console.log(err.stack || err)
    })

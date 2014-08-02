// Load cha library.
var cha = require('../')

// Register tasks that should chaining.
cha.in('glob',     require('task-glob'))
    .in('combine', require('task-combine'))
    .in('replace', require('task-replace'))
    .in('writer',   require('task-writer'))
    .in('uglifyjs',require('task-uglifyjs'))
    .in('request', require('task-request'))

// Start with cha expressions.
cha(['glob:./fixtures/js/*.js', 'request:http://underscorejs.org/underscore-min.js'])
    .replace({
        search: 'TIMESTAMP',
        replace: +new Date
    })
    .replace({
        search: /DEBUG/g,
        replace: true
    })
    .combine()
    .uglifyjs()
    .writer('./test/out/foobar.js')

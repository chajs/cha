// Load cha library.
var cha = require('../')
var tasks = require('./tasks')

// Register tasks that should chaining.
cha.in('glob',      tasks.glob)
    .in('request',  tasks.request)
    .in('cat',      tasks.cat)
    .in('replace',  tasks.replace)
    .in('write',    tasks.write)
    .in('uglifyjs', tasks.uglifyjs)

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
    .cat()
    .uglifyjs()
    .write('./out/foobar.js')
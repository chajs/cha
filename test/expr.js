// Load cha library.
var cha = require('../')

// Register tasks that should chaining.
cha.in('glob',     require('./tasks/glob'))
    .in('request',  require('./tasks/request'))
    .in('cat',      require('./tasks/cat'))
    .in('replace',  require('./tasks/replace'))
    .in('write',    require('./tasks/write'))
    .in('uglifyjs', require('./tasks/uglifyjs'))

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
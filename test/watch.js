// Load cha library.
var cha = require('../')

// Register tasks that should chaining.
cha.in('read', require('./tasks/read'))
   .in('cat', require('./tasks/cat'))
   .in('coffee', require('./tasks/coffee'))
   .in('write', require('./tasks/write'))
   .in('uglifyjs', require('./tasks/uglifyjs'))
   .in('copy', require('./tasks/copy'))

cha.watch = require('./tasks/watch')

cha.watch('./fixtures/coffee/*.coffee', {
    cwd: __dirname,
    immediately: true
}, function(filepath, event, watched){

    cha().read(watched)
        .coffee()
        .cat()
        .uglifyjs()
        .write('./out/foobar3.js')
})

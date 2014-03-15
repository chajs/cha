var cha = require('../')
var tasks = require('./tasks')

// Require target extension.
cha.target = require('./extensions/target')

cha.in('read',     tasks.read)
    .in('glob',    tasks.glob)
    .in('cat',     tasks.cat)
    .in('coffee',  tasks.coffee)
    .in('write',   tasks.write)
    .in('uglifyjs',tasks.uglifyjs)


function input(source){
    source
        .coffee()
        .cat()
        .uglifyjs()
        .write('./out/foobar3.js')
}

// Setting a "dev" target.
cha.target('dev', function(){

    // Require watch extension.
    cha.watch = require('./extensions/watch')

    // Start watcher.
    cha.watch('./fixtures/coffee/*.coffee', {
        cwd: __dirname,
        immediately: true
    }, function(filepath, event, watched){

        input(cha().read(watched))

    })
})

cha.target('test', function(){
    console.log('Testing')
})

// Setting a "dist" target.
cha.target('dist', function(){

    input(cha().glob({
        patterns: './fixtures/coffee/*.coffee',
        cwd: __dirname
    }))
ç
})

// Setting a "build" target.
cha.target('build', ['test', 'dist'])

// Running target.
// cha.target.run('build')

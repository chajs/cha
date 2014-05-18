<p align="center">
  <img height="256" width="256" src="https://f.cloud.github.com/assets/677114/2333826/7f36d7ea-a471-11e3-99ea-fd8567069b7d.png"/>
</p>

cha [![NPM version](https://badge.fury.io/js/cha.png)](http://npm.org/cha) [![Build Status](https://travis-ci.org/chajs/cha.png?branch=master)](http://travis-ci.org/chajs/cha)
===
> Make task chaining.

Cha allows tasks to be connected together into a chain that makes better readability and easier to maintain.

## Getting Started

Installing cha via NPM, this will install the latest version of cha in your project folder
and adding it to your `devDependencies` in `package.json`:
```sh
npm install cha --save-dev
```

Touch a tasks file and naming whatever you love like `build.js`:
```js
// Load cha library.
var cha = require('cha')
// Load tasks directory with an index.js that exports ./tasks/glob.js, etc.
var tasks = require('./tasks')

// Register tasks that should chaining.
cha.in('glob',     tasks.glob)
    .in('cat',     tasks.cat)
    .in('replace', tasks.replace)
    .in('write',   tasks.write)
    .in('uglifyjs',tasks.uglifyjs)
    .in('copy',    tasks.copy)
    .in('request', tasks.request)

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
    .map(function(record){
        console.log(record.path)
        return record;
    })
    .cat()
    .uglifyjs()
    .write('./out/foobar.js')
    .copy('./out/foobar2.js')
```

Add a arbitrary command to the `scripts` object:
```json
{
  "name": "cha-example",
  "scripts": {
    "build": "node ./build.js"
  },
  "devDependencies": {
    "cha": "~0.1.0"
  }
}
```

To run the command we prepend our script name with run:
```sh
$ npm run build

> cha@0.0.1 build
> node ./test/build

request http://underscorejs.org/underscore-min.js
concat ./test/fixtures/bar.js,./test/fixtures/foo.js,http://underscorejs.org/underscore-min.js
write ./out/foobar.js
copy out/foobar.js > ./out/foobar2.js
```

## How to set file watcher?

Install watch extension for cha:
```sh
npm install cha-watch --save-dev
```

Once the extension has been installed, it should required inside your scripts with this line of JavaScript:
```js
cha.watch = require('cha-watch')
```

Example script:

```js
var cha = require('cha')
var tasks = require('./tasks')

// Require watch extension.
cha.watch = require('cha-watch')

cha.in('read',    tasks.read)
   .in('cat',     tasks.cat)
   .in('coffee',  tasks.coffee)
   .in('write',   tasks.write)
   .in('uglifyjs',tasks.uglifyjs)

// Start watcher.
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

```

To run the command we prepend our script name with run:
```sh
$ npm run watch

> cha@0.0.1 watch
> node ./test/watch

read /test/fixtures/coffee/bar.coffee
read /test/fixtures/coffee/foo.coffee
concat /test/fixtures/coffee/bar.coffee,/test/fixtures/coffee/foo.coffee
write ./out/foobar3.js
```

## How to set targets?

Install target extension for cha:
```sh
npm install cha-target --save-dev
```

Once the extension has been installed, it should required inside your scripts with this line of JavaScript:
```js
cha.target = require('cha-target')
```

Example script:
```js
var cha = require('cha')
var tasks = require('./tasks')

// Require target extension.
cha.target = require('cha-target')

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
    cha.watch = require('cha-watch')

    // Start watcher.
    cha.watch('./fixtures/coffee/*.coffee', {
        cwd: __dirname,
        immediately: true
    }, function(filepath, event, watched){

        input(cha().read(watched))

    })
})

// Setting a "dist" target.
cha.target('dist', function(){

    input(cha().glob({
        patterns: './fixtures/coffee/*.coffee',
        cwd: __dirname
    }))

})

// Setting a "all" target.
cha.target('all', ['dev', 'dist'])

// Running target.
// cha.target.run('all')
```

Add a arbitrary command to the `scripts` object:

```json
{
  "name": "cha-example",
  "scripts": {
    "dev": "node ./test/target dev",
    "dist": "node ./test/target dist",
    "all": "node ./test/target all",
  }
}
```

To run the command we prepend our script name with run:
```sh
$ npm run dev

> cha@0.1.1 dev /cha
> node ./test/target dev

read /cha/test/fixtures/coffee/bar.coffee
read /cha/test/fixtures/coffee/foo.coffee
concat /cha/test/fixtures/coffee/bar.coffee,/cha/test/fixtures/coffee/foo.coffee
write ./out/foobar3.js
```

## How to enjoy cha expressions?

```js
// Load cha library.
var cha = require('cha')
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
```

To run the command we prepend our script name with run:
```sh
$ npm run expr

> cha@0.0.1 expr
> node ./test/expr

request http://underscorejs.org/underscore-min.js
concat http://underscorejs.org/underscore-min.js
write ./out/foobar.js
```

## How to setting task?

```js
// Load cha library.
var cha = require('cha')
var tasks = require('./tasks')

// Register tasks that should chaining.
cha.in('request',   tasks.request)
    .in('glob',      tasks.glob)
    .in('uglifyjs', tasks.uglifyjs)
    .in('write',    tasks.write)

// Start with cha expressions.
cha()
    .glob({
        patterns: './fixtures/js/*.js'
    })
    .request({
        url: 'http://underscorejs.org/underscore.js'
    }, {
        ignore: true, // Ignore task inputs.
        timeout: 2000 // 2000ms timeout.
    })
    .uglifyjs()
    .write('./underscore-min.js')
```

## How to creating custom task?

Chaining task should based on the [Task.JS](https://github.com/taskjs/spec) specification.

The following example creating a task concatenate files from the inputs. It extend from `Execution` class and define `execute` method:

```js
var _ = require('lodash');
var fs = require('fs');
var path = require('path');
var Execution = require('execution');
var Record = require('record');

var Concat = Execution.extend({
    // Naming your task.
    name: 'concat',
    // Task description.
    description: 'Concatenate files',
    // Task options.
    options: {
        banner: {
            default: '',
            description: 'The string will be prepended to the beginning of the contents'
        },
        endings: {
            default: '\n',
            description: 'Make sure each file endings with newline'
        },
        footer: {
            default: '',
            description: 'The string will be append to the end of the contents'
        }
    },
    // Override `execution` method.
    execute: function (resolve, reject) {
        var options = this.options;
        var logger = this.logger;
        var inputs = this.inputs;

        var endings = options.endings;
        var banner = options.banner;
        var footer = options.footer;

        var paths = _.pluck(inputs, 'path');
        logger.log(this.name, paths.join(','));

        var contents = this.concat(inputs, endings);

        // Return new record object.
        resolve(new Record({
            contents: banner + contents + footer
        }));
    },
    concat: function (inputs, endings) {

        return inputs.map(function (record, index, array) {
            var contents = record.contents.toString();
            if (!RegExp(endings + '$').test(contents)) {
                contents += endings;
            }
            return contents;
        }).reduce(function (previousContents, currentContents, index, array) {
                return previousContents + currentContents;
            }, '');

    }
});

module.exports = Concat
```

## Release History

* 2014-05-19    0.2.1    Task accept `settings` param with general options.
* 2014-05-18    0.2.0    Remove Internal methods.
* 2014-03-17    0.1.2    Extensions for cha.
* 2014-03-10    0.1.1    Custom tasks could override internal methods.
* 2014-03-05    0.1.0    Initial release.

<p align="center">
  <img height="256" width="256" src="https://f.cloud.github.com/assets/677114/2333826/7f36d7ea-a471-11e3-99ea-fd8567069b7d.png"/>
</p>

cha ![NPM version](https://badge.fury.io/js/cha.png)
===
> Make task chaining.

Cha allows tasks to be connected together into a chain that makes better readability and easier to maintain.

## How to getting started?

Installing cha via NPM, this will install the latest version of cha in your project folder
and adding it to your `devDependencies` in `package.json`:
```sh
npm install cha --save-dev
```

Touch a tasks file and naming whatever you love like `build.js`:
```js
// Load cha library.
var cha = require('cha')

// Register tasks that should chaining.
cha.in('glob',     require('./tasks/glob'))
   .in('cat',      require('./tasks/cat'))
   .in('replace',  require('./tasks/replace'))
   .in('write',    require('./tasks/write'))
   .in('uglifyjs', require('./tasks/uglifyjs'))
   .in('copy',     require('./tasks/copy'))
   .in('request',  require('./tasks/request'))

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

## How to use watch task?

```js
var cha = require('../')

// Set a watcher.
cha.watch = require('./tasks/watch')

cha.in('read', require('./tasks/read'))
   .in('cat', require('./tasks/cat'))
   .in('coffee', require('./tasks/coffee'))
   .in('write', require('./tasks/write'))
   .in('uglifyjs', require('./tasks/uglifyjs'))
   .in('copy', require('./tasks/copy'))

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

## How to enjoy cha expressions?

```js
// Load cha library.
var cha = require('cha')

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

* 2014-03-05    0.1.0    Initial release

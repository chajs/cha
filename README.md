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

// Register tasks that should chaining.
cha.in('glob',     require('task-glob'))
    .in('combine', require('task-combine'))
    .in('replace', require('task-replace'))
    .in('writer',  require('task-writer'))
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
    .writer('./out/foobar.js')
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

## Cha Extensions

* [cha-load](https://github.com/chajs/cha-load)     - Automatically load cha and register tasks.
* [cha-watch](https://github.com/chajs/cha-watch)   - File watcher.
* [cha-target](https://github.com/chajs/cha-target) - Target runner.
* [cha-gulp](https://github.com/chajs/cha-gulp)     - Gulp plugin adapter.

## Cha Expressions

```js
// Load cha library.
var cha = require('cha')

// Register tasks that should chaining.
cha.in('glob',     require('task-glob'))
    .in('combine', require('task-combine'))
    .in('replace', require('task-replace'))
    .in('writer',  require('task-writer'))
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

## Task Settings

```js
// Load cha library.
var cha = require('cha')

// Register tasks that should chaining.
cha.in('glob',     require('task-glob'))
    .in('writer',  require('task-writer'))
    .in('uglifyjs',require('task-uglifyjs'))
    .in('request', require('task-request'))

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
    .writer('./underscore-min.js')
```

## JavaScript Tasks

All register task should based on the [JavaScript Task](https://github.com/taskjs/spec) specification.
You could get available tasks from [JavaScript Task Packages] (http://taskjs.github.io/packages/) website.

## Release History

* 2014-05-19    0.2.1    Task accept `settings` param with general options.
* 2014-05-18    0.2.0    Remove Internal methods.
* 2014-03-17    0.1.2    Extensions for cha.
* 2014-03-10    0.1.1    Custom tasks could override internal methods.
* 2014-03-05    0.1.0    Initial release.

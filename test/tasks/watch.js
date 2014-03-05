var _ = require('lodash');
var Promise = require('es6-promise').Promise;
/**
 * @param patterns
 * @param options
 *   - all
 *   - changed
 *   - immediately
 *   - interval {integer} Interval to pass to fs.watchFile
 *   - debounce {integer} Delay for events called in succession for the same file/event
 * @returns {Promise}
 */
module.exports = function (patterns, options, callback) {

    return new Promise(function (resolve, reject) {
        var Watcher = require('gaze');
        var watcher = new Watcher(patterns, options);

        function watched() {
            var watched = watcher.watched();
            var records = Object.keys(watched).map(function (watchedDir) {
                return watched[watchedDir];
            });
            return _.flatten(records);
        }

        // Files have all started watching
        watcher.on('ready', function (watcher) {
            if (options.immediately) {
                var watchedFiles = watched();
                resolve(watchedFiles)
                callback(watchedFiles, 'ready', watchedFiles)
            }
        });

        // A file has been added/changed/deleted has occurred
        watcher.on('all', function (event, filepath) {
            var record = new Record({
                path: filepath,
                contents: fs.readFileSync(filepath)
            })
            callback(filepath, event, watched())
        });

        watcher.on('nomatch', function () {
            console.log('No file watched.');
            watcher.close()
        })
    })
}

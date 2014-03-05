var fs = require('fs');
var url = require('url');
var path = require('path');
var mkdirp = require('mkdirp');

var file = module.exports;

file.exists = fs.existsSync;

file.normalize = function (filepath) {
    filepath = path.normalize(filepath);
    filepath = filepath.replace(/\\/g, '/');
    return path.join(path.dirname(filepath), file.basename(filepath) + file.extname(filepath))
};

file.extname = function (filepath) {
    return path.extname(url.parse(filepath).pathname);
};

file.basename = function (filepath) {
    return path.basename(filepath, path.extname(filepath));
};

/**
 * Is the given path a file? Returns a boolean.
 * @method file.isFile(filepath)
 * @param filepath
 * @returns {*}
 */
file.isFile = function (filepath) {
    try {
        return fs.statSync(filepath).isFile();
    } catch (e) {
        return false;
    }
};

/**
 * Is the given path a directory? Returns a boolean.
 * @method file.isDir(filepath)
 * @param filepath
 * @returns {*}
 */
file.isDir = function (filepath) {
    try {
        return filepath.slice(-1) === '/' || fs.statSync(filepath).isDirectory();
    } catch (e) {
        return false;
    }
};

/**
 * Synchronous rename
 * @mothod file.rename(oldpath, newpath)
 */
file.rename = function () {
    return fs.renameSync.apply(this, arguments);
};

/**
 * copy a source file or directory to a destination path, creating intermediate directories if necessary
 * @method file.copy(src, dest)
 * @param src
 * @param dest
 * @param opts
 * @returns {boolean|array}
 */
file.copy = function (src, dest, opts) {
    opts = opts || {};
    if (file.isFile(src)) {
        return copyFile(src, dest, opts);
    } else if (file.isDir(src)) {
        return copydir(src, dest, opts);
    }
};

/**
 * copy dir
 * @param srcDir
 * @param destDir
 * @param opts
 * @returns {Array}
 */
function copydir(srcDir, destDir, opts, copiedFiles) {
    // Normalize the directory names, but keep front slashes.
    srcDir = file.normalize(srcDir + "/");
    destDir = file.normalize(destDir + "/");
    copiedFiles = copiedFiles || [];

    var files = fs.readdirSync(srcDir),
        i,
        srcFileName,
        destFileName;

    for (i = 0; i < files.length; i++) {

        srcFileName = path.join(srcDir, files[i]);

        if (file.isFile(srcFileName)) {
            srcFileName = file.normalize(srcFileName);
            // The filename at root dir not contains './', so append './' prefix for filename replace,
            // otherwise that will be wrong when copy file from root dir to one other dir
            if (srcDir == './') srcFileName = srcDir + srcFileName;
            destFileName = srcFileName.replace(srcDir, destDir);

            if (copyFile(srcFileName, destFileName, opts)) {
                copiedFiles.push(destFileName);
            }

        } else if (opts.recursive || opts.recursive === undefined) {
            // if dir and allow copy recursively
            var subDirDest = destDir;
            if (!opts.flatten) {
                subDirDest = file.normalize(path.join(destDir, path.basename(srcFileName)));
            }
            copydir(srcFileName, subDirDest, opts, copiedFiles);
        }
    }

    return copiedFiles;
}

/**
 * copy file
 * @param srcFile
 * @param destFile
 * @param opts
 * @returns {boolean}
 */
function copyFile(srcFile, destFile, opts) {
    srcFile = file.normalize(srcFile);
    destFile = file.normalize(destFile);

    // If force is new, then compare dates and only copy if the src is newer than dest.
    if (opts.update
        && file.exists(destFile)
        && fs.statSync(destFile).mtime.getTime() >= fs.statSync(srcFile).mtime.getTime()) {
        return false;
    }

    if (opts.force && file.exists(destFile)) {
        if (opts.backup) {
            var backupBasePath = destFile + ".~";
            var backupPath = backupBasePath;
            for (var i = 1; ; i++) {
                backupPath = backupBasePath + i;
                if (!file.exists(backupPath)) {
                    break;
                }
            }

            copyFile(destFile, backupPath, opts);
        }
    }

    //Make sure destination dir exists.
    var parentDir = path.dirname(destFile);
    if (!file.exists(parentDir)) {
        file.mkdir(parentDir);
    }

    fs.writeFileSync(destFile, fs.readFileSync(srcFile, 'binary'), 'binary');

    return true;
}

/**
 * given a path to a directory, create it, and all the intermediate directories as well
 * @method file.mkdir(dirpath [, mode])
 * @param dirpath the path to create
 * @param mode
 * @example
 *  file.mkdir("/tmp/dir", 755)
 */
file.mkdir = function (dirpath, mode) {
    mkdirp.sync(dirpath, mode);
    return dirpath;
};

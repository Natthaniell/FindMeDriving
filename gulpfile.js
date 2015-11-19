// jshint ignore: start
var plugins = {};

// require GULP plugins
var gulp = require('gulp');
plugins.gutil           = require('gulp-util');
plugins.browserSync     = require('browser-sync');
plugins.reload          = plugins.browserSync.reload;
plugins.ngAnnotate      = require('gulp-ng-annotate');
plugins.merge           = require('merge-stream');
plugins.autoprefixer    = require('gulp-autoprefixer');
plugins.postcss         = require('gulp-postcss');
plugins.cssgrace        = require('cssgrace');
plugins.runSequence     = require('run-sequence');
plugins.minifycss       = require('gulp-minify-css');
plugins.compass         = require('gulp-compass');
plugins.templateCache   = require('gulp-angular-templatecache');
plugins.concat          = require('gulp-concat');
plugins.chalk           = require('chalk');
plugins.exec            = require('gulp-exec');
plugins.rename          = require('gulp-rename');
plugins.babel           = require('gulp-babel');
plugins.ts              = require('gulp-typescript');
plugins.wait            = require('gulp-wait');

/**
 * Main variables
 */
var settings = {
    debug : false,
    build_type : '',
    output_folder : ''
};

// load tasks
watches = require('./buildTasks/watchers.js')(gulp, plugins, settings);
builds = require('./buildTasks/build.js')(gulp, plugins, settings);
//jsTasks = require('./buildTasks/jsTasks.js')(gulp, plugins, settings);
//cssTasks = require('./buildTasks/cssTasks.js')(gulp, plugins, settings);
//testTasks = require('./buildTasks/testTasks.js')(gulp, plugins, settings);
//versionsTasks = require('./buildTasks/versionsTasks.js')(gulp, plugins, settings);



/**
 * Main build sequences
 * Those are beeing run on start and on every watch executed
 * - src
 * - dist
 * - dest
 */


gulp.task('mainBuildSource', function(cb) {
    settings.build_type             = 'src';
    settings.output_html_folder     = './src/';
    settings.html_paths             = '';
    plugins.gutil.log(plugins.chalk.yellow.bgBlack.bold('Task: mainBuildSource'));
    return plugins.runSequence('typescript', 'babel', 'compass',  cb);
});


/**
 * Main tasks
 * - src
 * - dist
 * - dev
 */


// src build
gulp.task('default', function(cb) {
    plugins.gutil.log(plugins.chalk.black.bgWhite.bold('-----------------------------------------------------'));
    plugins.gutil.log(plugins.chalk.black.bgWhite.bold('- Src build.    Use gulp dist or gulp dev for others.'));
    plugins.gutil.log(plugins.chalk.black.bgWhite.bold('-----------------------------------------------------'));
    plugins.gutil.log(plugins.chalk.yellow.bgBlack.bold('Task: default'));
    return plugins.runSequence('mainBuildSource', 'browser-sync', 'watchTypescript', 'watchCompass',  cb); //  'watchES6',
});

'use strict';

var gulp = require('gulp');
var gutil = require('gulp-util');
var nodemon = require('gulp-nodemon');
var notify = require('gulp-notify');
var changed = require('gulp-changed');
var del = require('del');
var plumber = require('gulp-plumber');
var rev = require('gulp-rev');
var jshint = require('gulp-jshint');
var env = require('gulp-env');
var mkdirp = require('mkdirp');
var textFormat = require('./src/utils/logMessages').textFormat;
process.env.SUPPRESS_NO_CONFIG_WARNING = 'y';



// create a default task and just log a message
gulp.task('default', function() {
    return gutil.log('Gulp is running!');
});

var paths = {
    fontsSrc: ['src/'],
    buildDir: 'build/src/',
    revDir: 'dist',
    distDir: 'dist',
    logsDir: 'logs',
    publicDir: 'public',
    expLogosDir: 'public/experimentLogos',
    appLogosDir: 'public/applicationLogos'
};

var onError = function(err) {
    gutil.beep();
    gutil.log(gutil.colors.green(err));
};
var nodemonServerInit = function() {

    env({
        vars: {}
    });

    nodemon({
        script: 'app.js',
        ext: 'js'
    }).on('restart', function() {
        gulp.src('app.js').pipe(notify({
            message: "Restarting server: <%= file.relative %> @ <%= options.date %>",
            templateOptions: {
                date: new Date()
            }
        }));
    });
};

gulp.task('serve', ['build-js', 'dirs', 'watch'], function(cb) {
    nodemonServerInit();
});

gulp.task('deploy', ['dist-js', 'dirs'], function(cb) {
    nodemonServerInit();
});

gulp.task('clean', function(cb) {
    del([paths.buildDir, paths.distDir, 'node_modules', 'logs', 'build', 'public'], cb);
});

/*
JS Tasks
*/
gulp.task('dirs', function() {
    mkdirp(paths.logsDir, function(err) {
        if (err) {
            console.log(textFormat.FgRed, 'Failed to create /logs folder', textFormat.Reset);
            throw new Error("This folder is required");
        } else {
            console.log(textFormat.FgGreen, '/logs folder created', textFormat.Reset);
        }
    });
    mkdirp(paths.publicDir, function(err) {
        if (err) {
            console.log(textFormat.FgRed, 'Failed to create /public folder', textFormat.Reset);
            throw new Error("This folder is required");
        } else {
            console.log(textFormat.FgGreen, '/public folder created', textFormat.Reset);
        }
    });
    mkdirp(paths.expLogosDir, function(err) {
        if (err) {
            console.log(textFormat.FgRed, 'Failed to create /public/experimentLogos folder', textFormat.Reset);
            throw new Error("This folder is required");
        } else {
            console.log(textFormat.FgGreen, '/public/experimentLogos folder created', textFormat.Reset);
        }
    });
    mkdirp(paths.appLogosDir, function(err) {
        if (err) {
            console.log(textFormat.FgRed, 'Failed to create /public/applicationLogos folder', textFormat.Reset);
            throw new Error("This folder is required");
        } else {
            console.log(textFormat.FgGreen, '/public/applicationLogos folder created', textFormat.Reset);
        }
    });
});

gulp.task('build-js', function() {
    return gulp.src([paths.fontsSrc + '**/*.js'])
        .pipe(plumber({ errorHandler: onError }))
        .pipe(changed(paths.buildDir))
        .pipe(jshint())
        .pipe(jshint.reporter('jshint-stylish'))
        .pipe(gulp.dest(paths.buildDir));
});

gulp.task('dist-js', ['build-js'], function() {
    logLevel = 'warn';
    return gulp.src(paths.buildDir + '**/*.js')
        .pipe(rev())
        .pipe(gulp.dest(paths.distDir))
        .pipe(rev.manifest())
        .pipe(gulp.dest(paths.revDir));
});

gulp.task('watch', ['build-js'], function() {
    gulp.watch(['app.js', 'src/**/*.js'], ['build-js']);
});
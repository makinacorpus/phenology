var APP_ROOT, ENV_GLOBALS, GLOBALS, LOCAL_IP, PUBLIC_GLOBALS_KEYS, Q, android_release_file, cache, changed, child_process, clean, cmd, coffee, concat, deploy_release_cmd, destinations, ecstatic, ejs, gulp, gutil, http, ios_deploy_release_tasks, ios_release_file, jade, k, livereload, notify, open, open_qrcode_cmd, options, path, paths, phantomChild, phantomDefer, protractor, ripple, runSequence, sass, shell, v;

var gulp = require('gulp');
var bower = require('bower');
var sass = require('gulp-sass');
var minifyCss = require('gulp-minify-css');
var rename = require('gulp-rename');
var sh = require('shelljs');
var karma = require('karma').server;
var protractor = require("gulp-protractor").protractor;
var os=require('os');

APP_ROOT = require("execSync").exec("pwd").stdout.trim() + "/";

LOCAL_IP = "0.0.0.0";

var paths = {
  sass: ['./scss/**/*.scss']
};

/*
 * Default
 */
gulp.task('default', ['sass', 'watch']);

/*
 * Sass
 */
gulp.task('sass', function(done) {
  gulp.src('./scss/ionic.app.scss')
    .pipe(sass())
    .pipe(gulp.dest('./www/css/'))
    .pipe(minifyCss({
      keepSpecialComments: 0
    }))
    .pipe(rename({ extname: '.min.css' }))
    .pipe(gulp.dest('./www/css/'))
    .on('end', done);
});

gulp.task('watch', function() {
  gulp.watch(paths.sass, ['sass']);
});

/*
 * Install
 */
gulp.task('install', ['git-check'], function() {
  return bower.commands.install()
    .on('log', function(data) {
      gutil.log('bower', gutil.colors.cyan(data.id), data.message);
    });
});

/*
 * Karma : Unit Test
 */
gulp.task('test', function (done) {
  karma.start({
    configFile: __dirname + '/test/karma.conf.js',
    singleRun: true
  }, done);
});

/*
 * Protractor
 */
gulp.task('e2e', function (done) {
gulp.src(["./src/tests/*.js"])
    .pipe(protractor({
        configFile: "test/protractor.conf.js",
        args: ['--baseUrl', 'http://' + LOCAL_IP + ':8100', '--seleniumAddress', "http://localhost:4444/wd/hub"]
    })) 
    .on('error', function(e) { throw e })
});

/*
 * Protractor with sauce lab
 */
gulp.task('e2e_sauce', function (done) {
gulp.src(["./src/tests/*.js"])
    .pipe(protractor({
        configFile: "test/protractor.conf.js",
        args: ['--baseUrl', 'http://' + LOCAL_IP + ':8100']
    })) 
    .on('error', function(e) { throw e })
});

/*
 * 
 */
gulp.task('git-check', function(done) {
  if (!sh.which('git')) {
    console.log(
      '  ' + gutil.colors.red('Git is not installed.'),
      '\n  Git, the version control system, is required to download Ionic.',
      '\n  Download git here:', gutil.colors.cyan('http://git-scm.com/downloads') + '.',
      '\n  Once git is installed, run \'' + gutil.colors.cyan('gulp install') + '\' again.'
    );
    process.exit(1);
  }
  done();
});

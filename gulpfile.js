var APP_ROOT, ENV_GLOBALS, GLOBALS, LOCAL_IP, PUBLIC_GLOBALS_KEYS, Q, android_release_file, cache, changed, child_process, clean, cmd, coffee, concat, deploy_release_cmd, destinations, ecstatic, ejs, gulp, gutil, http, ios_deploy_release_tasks, ios_release_file, jade, k, livereload, notify, open, open_qrcode_cmd, options, path, paths, phantomChild, phantomDefer, protractor, ripple, runSequence, sass, shell, v;

var gulp = require('gulp');
var gutil = require('gulp-util');
var bower = require('bower');
var concat = require('gulp-concat');
var sass = require('gulp-sass');
var minifyCss = require('gulp-minify-css');
var rename = require('gulp-rename');
var sh = require('shelljs');
var argv = require('minimist')(process.argv.slice(2));
var karma = require('karma').server;
var protractor = require("gulp-protractor").protractor;
var os=require('os');

APP_ROOT = require("execSync").exec("pwd").stdout.trim() + "/";


LOCAL_IP = process.env.LOCAL_IP || "127.0.0.1";
var ifaces=os.networkInterfaces();
for (var dev in ifaces) {
  var alias=0;
  ifaces[dev].forEach(function(details){
    if (details.family=='IPv4') {
      if(details.address != LOCAL_IP){
        LOCAL_IP = details.address;
      }
    }
  });
}

//LOCAL_IP = process.env.LOCAL_IP || require('execSync').exec("(ifconfig wlan 2>/dev/null || ifconfig en0) | grep inet | grep -v inet6 | awk '{print $2}' | sed 's/addr://g'").stdout.trim().replace("adr:", "");

var paths = {
  sass: ['./scss/**/*.scss']
};

/*
 * Watch
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
        configFile: "test/protractor.config.js",
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

/**
 * cheers https://gist.github.com/mitchelkuijpers/11281981
 */

var gulp = require('gulp');
var source = require('vinyl-source-stream');
var gStreamify = require('gulp-streamify');
var browserify = require('browserify');
var envify = require('envify');
var uglifyify = require('uglifyify');
var uglify = require('gulp-uglify');
var watchify = require('watchify');
var reactify = require('reactify');
var browserSync = require('browser-sync');
var notify = require('gulp-notify');
var gutil = require('gulp-util');
// var openWebpage = require('open');

// process.env.NODE_ENV = 'production';
var production = process.env.NODE_ENV === 'production';

function handleError(task) {
  return function(err) {
    gutil.log(gutil.colors.red(err));
    notify.onError(task + ' failed, check the logs..')(err);
  };
}

function scripts(watch) {
  var sourceFile = './src/js/main.jsx',
      resultFile = 'main.js',
      destDir    = './build/js';

  var bundler, rebundler;
  bundler = browserify({
    entries: sourceFile, // Only need initial file, browserify finds the deps
    extensions: ['.jsx'],
    transform: [reactify], // We want to convert JSX to normal javascript
    debug: ! production, // Gives us sourcemapping
    cache: {}, packageCache: {}, fullPaths: watch // Requirement of watchify
  });
  if (watch) {
    bundler = watchify(bundler)
      .on('update', function () { gutil.log('Rebundling...'); })
      .on('time', function (time) {
        gutil.log('Rebundled in:', gutil.colors.cyan(time + 'ms'));
      });
  }

  bundler.transform(reactify);
  bundler.transform({global: true}, envify);
  if(production) { bundler.transform({global: true}, uglifyify); }

  rebundle = function() {
    var stream = bundler.bundle();
    stream.on('error', handleError('Browserify'));
    stream = stream.pipe(source(resultFile));
    if(production) { stream.pipe(gStreamify(uglify())); }
    return stream.pipe(gulp.dest(destDir))
      .pipe(browserSync.reload({ stream: true }));
  };
  bundler.on('update', rebundle);
  return rebundle();
}

gulp.task('scripts', function() {
  return scripts(false);
});

gulp.task('watchScripts', function() {
  return scripts(true);
});

gulp.task('copy', function() {
  return gulp.src(['src/*.html']).pipe(gulp.dest('build'));
});
gulp.watch('src/*.html', ['copy']);

gulp.task('build', ['copy', 'watchScripts']);

gulp.task('browser-sync', ['build'], function() {
  browserSync({
    server: {
      baseDir: "./build/"
    }
  });

  gulp.watch("./build/*.html").on('change', browserSync.reload);

  // if there are other browsers:
  // setTimeout(function() {
  //   openWebpage('http://localhost:3000');
  // }, 3000);
});

gulp.task('default', ['browser-sync']);

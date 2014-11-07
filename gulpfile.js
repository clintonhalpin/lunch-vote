var gulp = require('gulp'),
express = require('express'),
gutil = require('gulp-util'),
path = require('path'),
uglify = require('gulp-uglify'),
browserify = require('gulp-browserify'),
sass = require('gulp-sass'),
connectLivereload = require('connect-livereload'),
tinylr = require('tiny-lr')(),
concat = require('gulp-concat'),
clean = require('gulp-clean'),
port = 4000,
lrport = 9088;

function notifyLiveReload(event) {
  var fileName = path.relative(__dirname + 'src/', event.path);
  tinylr.changed({
    body: {
      files: [fileName]
    }
  });
}

gulp.task('express', function() {
  var app = express();
  app.use(connectLivereload({port: lrport}));
  app.use(express.static(__dirname + '/dist'));
  app.listen(port);
});

gulp.task('livereload', function() {
  tinylr.listen(lrport);
});

gulp.task('browserify', function() {
  gulp.src(['src/js/app.js'])
  .pipe(browserify({
    shim: {
      angular: {
        path: './src/bower_components/angular/angular.min.js',
        exports: 'angular'
      },
      uiRouter: {
        path: './src/bower_components/angular-ui-router/release/angular-ui-router.min.js',
        exports: 'uiRouter'
      }
    }
  }).on('error', gutil.log))
  .pipe(concat('bundle.js'))
  .pipe(uglify())
  .pipe(gulp.dest('./dist/js'))
});

gulp.task('sass', function() {
  gulp.src('src/scss/**/*.scss')
  .pipe(sass({style: 'compressed' }).on('error', gutil.log))
  .pipe(gulp.dest('dist/css/'))
});

gulp.task('mv-html', function() {
  gulp.src('src/index.html')
  .pipe(gulp.dest('dist/'));
});

gulp.task('watch', function() {
  gulp.watch(['src/**/*.js'], [
    'browserify'
  ]);
  gulp.watch(['src/**/*.scss'], [
    'sass'
  ]);
  gulp.watch(['src/**/*.html'], [
    'mv-html'
  ]);
  gulp.watch('./dist/**').on('change', notifyLiveReload);
});

gulp.task('dist', ['sass', 'mv-html', 'browserify'], function() {
  console.log( "Dist built @ " + new Date());
});

gulp.task('default', ['express', 'livereload', 'watch'], function() {
  console.log("Running @ http://localhost:" + port);
});

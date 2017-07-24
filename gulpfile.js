const gulp = require('gulp');

// Gulp plugins
const sass = require('gulp-sass');
const sourcemaps = require('gulp-sourcemaps');
const autoprefixer = require('gulp-autoprefixer');
const clean = require('gulp-clean');
const babel = require('gulp-babel');
const concat = require('gulp-concat');
const size = require('gulp-size');
const replace = require('gulp-replace');
//const inject = require('gulp-inject');
//const wiredep = require('wiredep')({}).stream;
//const notify = require('gulp-notify');

// Other stuff
const path = require('path');
/*
const gulpLoadPlugins = require('gulp-load-plugins');
const $ = gulpLoadPlugins();
*/

//TODO: Check my vim conf, seems fucked
//const mainBowerFiles = require('main-bower-files');
//const filter = require('gulp-filter');
//const concat = require('gulp-concat');
/*
gulp.task('vendors', function() {
   return gulp.src(mainBowerFiles())
   .pipe(filter('*.css'))
   .pipe(concat('vendors.css'))
   .pipe(gulp.dest('dist/styles'));
});
*/
//gulp.parallel?
const config = {
  bootswatchTheme: 'sandstone',
}
//TODO: notify which theme is used
// Use gulp-if to enable disable different parts depending on prod/dev
gulp.task('styles', function() {
  return gulp.src('./src/sass/**/*.scss')
  .pipe(replace('__bootswatch_theme__', config.bootswatchTheme))
	.pipe(sourcemaps.init())
	.pipe(sass({
    includePaths: [
      path.resolve(__dirname, 'bower_components/bootstrap-sass/assets/stylesheets'),
      path.resolve(__dirname, 'bower_components/font-awesome/scss'),
      path.resolve(__dirname, 'bower_components/bootswatch'),
      path.resolve(__dirname, 'src/sass') //needed, try remove?
    ]
  }).on('error', sass.logError))
  .pipe(autoprefixer(['last 2 versions', '> 5%', 'Firefox ESR'])) //['last 1 version'] {cascade: true} ?
   //.pipe(concat('all.css'))
	.pipe(sourcemaps.write())
	.pipe(gulp.dest('./dist'));
});

// TODO: THIS>>>>>> Compiling bootstrap js
gulp.task('scripts', function() {
	return gulp.src(['.src/js/button.js'])
	.pipe(babel())
	.pipe(concat('./bootstrap.js'))
	.pipe(gulp.dest('./dist/js'));
});

gulp.task('watch', function() {
  // How add event handler on both the right way?
  gulp.watch('./src/js/**/*.js', ['scripts']);
  gulp.watch('./src/sass/**/*.scss', ['styles'])
  .on('change', function(event) {
    console.log('File ' + event.path + ' was ' + event.type + ', running tasks...');
  });
});

gulp.task('dist-clean', function() {
  return gulp.src('./dist', {read: false})
  .pipe(clean()); //.on('error')?
});

gulp.task('build', ['dist-clean', 'styles', 'scripts'], function() {
  const s = size({
    title: 'Copying fonts',
    showFiles: true,
    showTotal: true,
  });
  // Copy font-awesome fonts
  return gulp.src('./bower_components/font-awesome/fonts/**/**.*')
  .pipe(s)
  .pipe(gulp.dest('./dist/fonts'));
});

gulp.task('default', ['build', 'watch']);

//gulp-filter
//gulp-shorthand
//gulp-css
//gulp-babel
//gulp-modernizr?
//gulp-uglify
//gulp-concat
//gulp-shell (for building site)
//gulp-clean and gulp-copy, stada i dist/source?
//gulp-todo
//gulp-postcss
//autoprefixer-core - autoprefix css without worrying about browser specific prefixes. Use this instead of gulp-autoprefixer if using gulp-postcss
//gulp-sharp resize images
//gulp-if - adds conditionals in gulp pipeline
/* In prod:
var gulp = require('gulp');
var postcss = require('gulp-postcss');
var uncss = require('postcss-uncss');
*/

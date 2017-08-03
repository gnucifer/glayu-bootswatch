const gulp = require('gulp');

// Gulp plugins
const sass = require('gulp-sass');
const sourcemaps = require('gulp-sourcemaps');
const clean = require('gulp-clean');
const babel = require('gulp-babel');
const uglify = require('gulp-uglify');
const concat = require('gulp-concat');
const size = require('gulp-size');
const replace = require('gulp-replace');
const all = require('gulp-all');
const sequence = require('gulp-sequence');
const inject = require('gulp-inject');
const shell = require('gulp-shell');
const postcss = require('gulp-postcss');
const gulpif = require('gulp-if');
const watch = require('gulp-watch');
const cssnano = require('cssnano');
const autoprefixer = require('autoprefixer');
const pump = require('pump');
const browserSync = require('browser-sync').create();
const reload = browserSync.reload;
const path = require('path');

// Other stuff
// gulp-plumber for preventing stop on errors on watch-tasks
// gulp-filter
// const wiredep = require('wiredep')({}).stream;
// gulp-todo
// gulp-modernizr?
// gulp-sharp resize images
// const notify = require('gulp-notify');
// const mainBowerFiles = require('main-bower-files');
// const filter = require('gulp-filter');
// const concat = require('gulp-concat');
/*
gulp.task('vendors', function() {
   return gulp.src(mainBowerFiles())
   .pipe(filter('*.css'))
   .pipe(concat('vendors.css'))
   .pipe(gulp.dest('dist/styles'));
});
*/
//const gulpLoadPlugins = require('gulp-load-plugins');
//const $ = gulpLoadPlugins();
var config;
try {
  config = require('./config.json');
}
catch(err) {
  if (err.code === 'MODULE_NOT_FOUND') {
    console.log('config.json not found, please copy config.example.json to config.json and set config values.');
    process.exit(1);
  }
  else {
    throw err;
  }
}

gulp.task('serve', ['glayu-watch'], function() {
  browserSync.init({
    server: {
      baseDir: config.glayu.public
    }
  });
  //gulp.watch(path.join(config.glayu.public, '**/*.*')).on('change', reload);
});

// TODO: notify which theme is used
// TODO: Selectively include bootstrap css for smaller size?
gulp.task('styles', function() {
  //cssnext?
  return gulp.src('./src/sass/**/*.scss')
  .pipe(replace('__bootswatch_theme__', config.bootswatch.theme))
	.pipe(gulpif(!config.production, sourcemaps.init()))
	.pipe(sass({
    includePaths: [
      path.resolve(__dirname, 'bower_components/bootstrap-sass/assets/stylesheets'),
      path.resolve(__dirname, 'bower_components/font-awesome/scss'),
      path.resolve(__dirname, 'bower_components/bootswatch'),
      path.resolve(__dirname, 'src/sass') //needed, try remove?
    ]
  }).on('error', sass.logError))
  .pipe(
    postcss([
      autoprefixer(['last 2 versions', '> 5%', 'Firefox ESR']), //['last 1 version'] {cascade: true} ?
      cssnano()
    ])
  )
  //.pipe(concat('all.css'))
  .pipe(gulpif(!config.production, sourcemaps.write()))
  .pipe(gulp.dest('./dist/assets/css'));
});

gulp.task('scripts', function(done) {
  pump([
      gulp.src([
        './bower_components/jquery/dist/jquery.js',
        './bower_components/bootstrap-sass/assets/javascripts/bootstrap/collapse.js',
        './bower_components/bootstrap-sass/assets/javascripts/bootstrap/transition.js'
      ]),
      babel(),
      uglify(),
      concat('./script.js'),
      gulp.dest('./dist/assets/js')
    ],
    done
  );
});

gulp.task('templates', ['styles', 'scripts'], function() { //TODO: also add js
  // Or use event stream?
  return gulp.src(['./src/_layouts/*.eex', './src/_partials/*.eex'], {base: './src'})
  .pipe(
    inject(
      gulp.src([
          './dist/assets/css/**/*.css',
          './dist/assets/js/**/*.js'
        ], {
          read: false,
        }
      ), {
        addRootSlash: true,
        ignorePath: 'dist'
      }
    )
  )
  .pipe(gulp.dest('./dist'));
});

gulp.task('glayu-build', function(done) {
  let reloadBrowserSync = function() {
    reload();
    done();
  };
  (shell.task([
    ['cd', '"' + config.glayu.root + '"', '&&', '"' + config.glayu.bin + '"', 'build'].join(' ')
  ]))(reloadBrowserSync);
});

gulp.task('glayu-deploy-template', function() {
  const s = size({
    title: 'Copying theme',
    showFiles: true,
    showTotal: true,
  });
  return gulp.src('./dist/**/*.*')
  .pipe(s)
  .pipe(
    gulp.dest(
      path.join(config.glayu.root, 'themes', config.glayu.theme)
    )
  );
});

gulp.task('glayu-deploy', function(callback) {
  sequence('glayu-deploy-template', 'glayu-build')(callback);
});

// TODO: Fix (error handling etc, pump?
gulp.task('watch', function() {
  // How add event handler on both the right way?
  gulp.watch('./src/js/**/*.js', ['scripts']);
  gulp.watch('./src/sass/**/*.scss', ['styles'])
  .on('change', function(event) {
    console.log('File ' + event.path + ' was ' + event.type + ', running tasks...');
  });
});

// TODO: glayu-deploy-watch, better name?
// TODO: possible to stream directly to glayu without complexing to much?
gulp.task('glayu-watch', function() {
  var notify = function(event) {
    console.log('File ' + event.path + ' was ' + event.type + ', running tasks...');
  };
  var log_error = function(err) {
    if (err) {
      console.log(err);
    }
  };
  //TODO: use gulp-watch instead
  gulp.watch('./src/js/**/*.js', function() {
    sequence('scripts', 'glayu-deploy')(log_error);
  }).on('change', notify);
  gulp.watch('./src/sass/**/*.scss', function() {
    sequence('styles', 'glayu-deploy')(log_error);
  }).on('change', notify);
  // This also unnecessarily triggers rebuild of js + css, fix?
  gulp.watch(['./src/_layouts/*.eex', './src/_partials/*.eex'], function() {
    sequence('templates', 'glayu-deploy')(log_error);
  }).on('change', notify);
  gulp.watch(path.join(config.glayu.source, '**/*.*'), ['glayu-build'])
  .on('change', notify);
});

gulp.task('dist-clean', function() {
  // TODO: Filter, dont delete .gitkeep, or don't track dist?
  return gulp.src('./dist', {read: false})
  .pipe(clean()); //.on('error')?
});

gulp.task('build', ['dist-clean', 'templates'], function() {
  const s = size({
    title: 'Copying fonts',
    showFiles: true,
    showTotal: true,
  });
  return gulp.src([
    './bower_components/font-awesome/fonts/**/*.*',
    './bower_components/bootstrap-sass/assets/fonts/**/*.*', //TODO: Must be better way
  ]).pipe(s)
  .pipe(gulp.dest('./dist/assets/fonts'));

  // Copy font-awesome fonts
  //return all(
  //  gulp.src('./bower_components/font-awesome/fonts/**/**.*')
  //    .pipe(s)
  //    .pipe(gulp.dest('./dist/assets/fonts')),
  //  gulp.src(['./src/_layouts/**.eex', './src/_partials/**.eex'], {base: './src'})
  //    .pipe(gulp.dest('./dist'))
});

gulp.task('default', ['build', 'watch']);

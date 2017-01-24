var gulp = require('gulp'),
    sass = require('gulp-ruby-sass');
    // please note I'm using gulp-ruby-sass on a windows machine. there is a changed syntax!
    plumber = require('gulp-plumber'),
    rename = require('gulp-rename'),
    concat = require('gulp-concat'),
    uglify = require('gulp-uglify'),
    browserSync = require('browser-sync'),
    minifycss = require('gulp-minify-css');

var paths = {
    src: '/src',
    dist: '/dist'
    // can be used like path.sassPath + '/stylesheets'
}

gulp.task('browser-sync', function() {
  browserSync({
    server: {
      baseDir: "./"
    }
  });
});

gulp.task('bs-reload', function () {
  browserSync.reload();
});


gulp.task('styles-site', function(){
  return sass('src/scss/site.scss', {
    loadPath: [
      __dirname + paths.src + '/scss/site.scss',
      __dirname + paths.src + '/scss/scripts.scss'
    ]
  })
    .pipe(plumber({
      errorHandler: function (error) {
        console.log(error.message);
        this.emit('end');
    }}))
    .pipe(concat('main.css'))
    .pipe(gulp.dest('dist/css/'))
    .pipe(rename({suffix: '.min'}))
    .pipe(minifycss({ keepSpecialComments: 0, processImport: false }))
    .pipe(gulp.dest('dist/css/'))
    .pipe(browserSync.reload({stream:true}))
});

gulp.task('scripts', function(){
  return gulp.src('src/scripts/**/*.js')
    .pipe(plumber({
      errorHandler: function (error) {
        console.log(error.message);
        this.emit('end');
    }}))
    .pipe(concat('main.js'))
    .pipe(gulp.dest('dist/scripts/'))
    .pipe(rename({suffix: '.min'}))
    .pipe(uglify())
    .pipe(gulp.dest('dist/scripts/'))
    .pipe(browserSync.reload({stream:true}))
});

gulp.task('default', ['browser-sync'], function(){
  gulp.watch("src/**/*.scss", ['styles-site']);
  gulp.watch("src/scripts/**/*.js", ['scripts']);
  gulp.watch("*.html", ['bs-reload']);
});

var sassOptions = {
  errLogToConsole: true,
  outputStyle: 'expanded'
};

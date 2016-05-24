
/* Default gulp tasks */

'use strict';

var gulp = require('gulp');
// Requires the gulp-sass plugin
var sass = require('gulp-sass');

gulp.task('styles', function() {
  return gulp.src('app/scss/**/*.scss') // Gets all files ending with .scss in app/scss and children dirs
    .pipe(sass())
    .pipe(gulp.dest('app/css'))
})


gulp.task('default', ['styles'], function () {
	// Anything we want to do in here?
});

gulp.task('watch', ['styles'], function () {
	gulp.watch(['**/*.scss'], ['styles']);
});

/* Gulp Fontello Tasks */



var gulp = require('gulp');
var gulpPlugins = require('gulp-load-plugins');
var fs = require('fs');
var pkg = JSON.parse(fs.readFileSync('./package.json'));


 


const files = pkg.config.files;

// Rather than manually defined each gulp plugin we need, gulpPlugins defines them for us.
var plugins = gulpPlugins(),
  // for executing commands in the command line
  exec = require('child_process').exec,
  platform = process.platform,

  /**
   * Opens the font-server defined in package.json
   *
   * @return {void} logs to terminal.
   */
  fontEdit = () => {
    let openFont = {
      linux: `/opt/google/chrome/google-chrome --enable-plugins ${pkg.config.fontServer}/$(cat .fontello)`,
      darwin: `open -a "Google Chrome" ${pkg.config.fontServer}/$(cat .fontello)`,
      win32: `start chrome "${pkg.config.fontServer}/$(cat .fontello)"`
    };

    if (!openFont[platform]) {
      return false;
    }

    // Connects to font server to get a fresh token for our editing session.
    // sends current config in the process.
    let getFontToken = `curl --silent --show-error --fail --output .fontello --form "config=@${files.fonts}/config.json" ${pkg.config.fontServer} \n`;

    return exec(getFontToken + openFont[platform], function(err, stdout, stderr) {
      console.log(stdout);
      if (stderr) {
        console.error(err, stderr);
      }
    });
  },

  /**
   * Downloads and unpacks our updated font from the fontServer
   *
   * @return {void} logs operations to terminal.
   */
  fontSave = () => {
    var script = [
      'if test ! $(which unzip); then echo "Unzip is installed"; exit 128; fi',
      'rm -rf .fontello.src .fontello.zip',
      `curl --silent --show-error --fail --output .fontello.zip ${pkg.config.fontServer}/$(cat .fontello)/get`,
      'unzip .fontello.zip -d .fontello.src',
      `rm -rf ${files.fonts}`,
      `mv $(find ./.fontello.src -maxdepth 1 -name 'fontello-*') ${files.fonts}`,
      'rm -rf .fontello.src .fontello.zip'
    ];

    exec(script.join(' \n '), function(err, stdout, stderr) {
      console.log(stdout);
      return gulp.src([`${files.fonts}/css/fontello.css`])
        .pipe(plugins.base64())
        .pipe(plugins.concat('_font.scss'))
        .pipe(gulp.dest('src/sass/base/'));
      if (stderr) {
        console.error(err, stderr);
      }
    });
  };

// Font editing tasks
gulp.task('font-edit', fontEdit);
gulp.task('font-save', fontSave);
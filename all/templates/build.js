/**
 *  Build task for yeoman-wordpress
 *
 *  Inspired by https://github.com/retlehs/roots/tree/grunt
 *
 *  Work in progress, does not work for now !
 *  This script is dirty as heck for now as I just use it to test on a project.
 */

var fs = require('fs'),
    path = require('path'),
    crypto = require('crypto');

module.exports = function(grunt) {

  grunt.registerTask('build', 'Build script for Yeoman Wordpress', function() {
    var self = this,
        cb = this.async();

    // the file where the script / stylesheet are called can be named differently => use a config var in Gruntfile?
    var scriptsPhp = 'app/wp-content/themes/mytheme/index.php';

    // Parse the theme directories to get every *.css and *.js files to apply
    // the following process to each files:
    // - hash the file
    // - perform the replace function for each one

    var scriptAbsPath = __dirname;

    // CSS files
/*
    parseDirectory('./app/wp-content/themes/mytheme', './app/wp-content/themes/mytheme', 'css', function(cssFiles) {
      // Hash the CSS
      for (file in cssFiles) {
        var hashCss = grunt.helper('md5', 'app/wp-content/themes/mytheme/'+cssFiles[file]);
        console.log(hashCss);
      }
      cb();
    });
*/

    // JS files
    parseDirectory('./app/wp-content/themes/mytheme', './app/wp-content/themes/mytheme', 'js', function(jsFiles) {
      // Hash the js
      for (file in jsFiles) {
        var hashJs = grunt.helper('md5', 'app/wp-content/themes/mytheme/'+jsFiles[file]);
        var baseName = path.basename(jsFiles[file], '.js');
        var regexJs = new RegExp("(wp_register_script\('"+baseName+"',(\s*[^,]+,){2})\s*[^,]+,\s*([^\)]+)\);");

        fs.readFile(scriptsPhp, 'utf8', function(err, data) {
          var content = data.replace(regexJs, "\$1 '" + hashJs + "', " + "\$3);");
          fs.writeFile(scriptsPhp, content, function() {
            console.log('"' + scriptsPhp + '" updated with new JS versions.');
            console.log('');
            cb();
          });
        });
      }
    });
  });

  // Hash the CSS
/*  var hashCss = grunt.helper('md5', 'app/wp-content/themes/mytheme/style.css');

  // Hash the JS
  var hashJs = grunt.helper('md5', 'app/wp-content/themes/mytheme/js/small-menu.js');

// Update scripts.php to reference the new versions
  var regexCss = /(wp_enqueue_style\('roots_main',(\s*[^,]+,){2})\s*[^\)]+\);/;
  var regexJs = /(wp_register_script\('small-menu',(\s*[^,]+,){2})\s*[^,]+,\s*([^\)]+)\);/;

  var content = grunt.file.read(scriptsPhp);
  content = content.replace(regexCss, "\$1 '" + hashCss + "');");
  content = content.replace(regexJs, "\$1 '" + hashJs + "', " + "\$3);");
  fs.writeFile(scriptsPhp, content, function() {
    console.log('"' + scriptsPhp + '" updated with new CSS/JS versions.');
    console.log('');
  });
 */
}

/**
 *  Recursively parse the directory to find every files with a given extension and return all the files found
 *
 *  @param string originalPath The first path to be parsed. Used to get relative path
 *  @param string pathToFile Path to the directory
 *  @param string ext File extension to find
 *  @param function cb Callback function
 *  @return array
 */
function parseDirectory(originalPath, pathToFile, ext, cb) {
  var filesArray = new Array;

  fs.readdir(pathToFile, function(err, files) {
    files.forEach(function(file) {
      var pathFile = fs.realpathSync(pathToFile+'/'+file);
      var isDirectory = fs.statSync(pathFile).isDirectory();

      if (isDirectory) {
        parseDirectory(originalPath, pathFile, ext, function(inception) {
          // Yeah... I had no idea what to call the variable so I called it inception. Because, you know, it goes deeper so...
          // And who cares, nobody's reading this anyway.
          cb(filesArray.concat(inception));
        });
      }
      else {
        var filePattern = new RegExp('.*\.'+ext, 'i');
        if (filePattern.test(file)) {
          if (filesArray.indexOf(file) == -1) {
            var finalPath = path.relative(originalPath, pathFile);
            filesArray.push(finalPath);
          }
        }
        if (filesArray.length > 0) {
          cb(filesArray);
        }
      }
    });
  });
}
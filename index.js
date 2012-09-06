
var util = require('util'),
  path = require('path'),
  fs = require('fs'),
  yeoman = require('../../../'),
  grunt = require('grunt'),
  rimraf = require('rimraf');

module.exports = Generator;

function Generator() {
  yeoman.generators.Base.apply(this, arguments);

  this.sourceRoot(path.join(__dirname, 'templates'));
}

util.inherits(Generator, yeoman.generators.NamedBase);

Generator.prototype.askFor = function askFor(arguments){
  var cb = this.async(),
      self = this;

  var prompts = [{
          name: 'themeName',
          message: 'Name of the theme you want to use: ',
          default: 'mytheme',
          empty: false
      }];

  this.prompt(prompts, function(e, props) {
    if(e) { return self.emit('error', e); }

    // set the property to parse the gruntfile
    self.themeName = props.themeName.replace(/\ /g, '').toLowerCase();

    cb();
  });
}

// download the framework and unzip it in the project app/
Generator.prototype.createApp = function createApp(cb){
  var cb = this.async(),
      self = this;

  grunt.log.writeln('Let\'s download the framework, shall we?');
  this.tarball('https://github.com/WordPress/WordPress/tarball/master', 'app', cb);
}

// remove the basic theme and create a new one
Generator.prototype.createTheme = function createTheme(){
  var cb = this.async(),
      self = this;

  grunt.log.writeln('First let\'s remove the built-in themes we will not use');
  // remove the existing themes
  fs.readdir('app/wp-content/themes', function(err, files){
    if(typeof files != 'undefined' && files.length != 0){
      files.forEach(function(file){
        var pathFile = fs.realpathSync('app/wp-content/themes/'+file);
        var isDirectory = fs.statSync(pathFile).isDirectory();

        if(isDirectory){
          rimraf.sync(pathFile);
          grunt.log.writeln('Removing ' + pathFile);
        }
      });
    }

    grunt.log.writeln('');
    grunt.log.writeln('Let\'s create a fresh themes full of HTML5 boilerplate awesomeness');

    // create the theme with html5 boilerplate
    self.tarball('https://github.com/zencoder/html5-boilerplate-for-wordpress/tarball/master', 'app/wp-content/themes/'+self.themeName, cb);
  });
}

// rename all the css files to scss
Generator.prototype.convertFiles = function convertFiles(){
  var cb = this.async(),
      self = this;

  // parse recursively a directory and rename the css files to .scss
  function parseDirectory(path){
    fs.readdir(path, function(err, files){
      files.forEach(function(file){
        var pathFile = fs.realpathSync(path+'/'+file);
        var isDirectory = fs.statSync(pathFile).isDirectory();

        if(isDirectory){
          parseDirectory(pathFile);
        }
        else{
          var cssName = /[.]*\.css/i;
          if(cssName.test(file)){
            var newName = pathFile.substring(0, pathFile.length - 3) + 'scss';
            grunt.log.writeln('Renaming ' + pathFile + ' to ' + newName);
            fs.renameSync(pathFile, newName);
          }
        }
      });
    });
  }

  parseDirectory('app/wp-content/themes/'+self.themeName);

  cb();
}

// generate the files to use Yeoman and the git related files
Generator.prototype.createYeomanFiles = function createYeomanFiles(){
  this.template('Gruntfile.js');
  this.copy('package.json', 'package.json');
  this.copy('gitignore', '.gitignore');
  this.copy('gitattributes', '.gitattributes');
}

Generator.prototype.endGenerator = function endGenerator(){
  grunt.log.writeln('');
  grunt.log.writeln('Looks like we\'re done!');
  grunt.log.writeln('Now go back to work!');
  grunt.log.writeln('');
}
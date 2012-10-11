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

Generator.prototype.askFor = function askFor(arguments) {
  var cb = this.async(),
      self = this;

  var prompts = [{
          name: 'themeName',
          message: 'Name of the theme you want to use: ',
          default: 'mytheme'
      },
      {
          name: 'wordpressVersion',
          message: 'Which version of Wordpress do you want?',
          default: '3.4.2'
      },
      {
          name: 'includeRequireJS',
          message: 'Would you like to include RequireJS (for AMD support)?',
          default: 'Y/n',
          warning: 'Yes: RequireJS will be placed into the JavaScript vendor directory.'
      }];

  this.prompt(prompts, function(e, props) {
    if(e) { return self.emit('error', e); }

    // set the property to parse the gruntfile
    self.themeName = props.themeName.replace(/\ /g, '').toLowerCase();
    self.wordpressVersion = props.wordpressVersion;
    self.includeRequireJS = (/y/i).test(props.includeRequireJS);
    cb();
  });
}

// download the framework and unzip it in the project app/
Generator.prototype.createApp = function createApp(cb) {
  var cb = this.async(),
      self = this;

  grunt.log.writeln('Let\'s download the framework, shall we?');
  grunt.log.writeln('Downloading Wordpress version '+self.wordpressVersion);

  // @Todo find a way to get the latest stable release to avoid editing the file every time a new version is out
  this.tarball('https://github.com/WordPress/WordPress/tarball/'+self.wordpressVersion, 'app', cb);
}

// remove the basic theme and create a new one
Generator.prototype.createTheme = function createTheme() {
  var cb = this.async(),
      self = this;

  grunt.log.writeln('First let\'s remove the built-in themes we will not use');
  // remove the existing themes
  fs.readdir('app/wp-content/themes', function(err, files) {
    if (typeof files != 'undefined' && files.length != 0) {
      files.forEach(function(file) {
        var pathFile = fs.realpathSync('app/wp-content/themes/'+file);
        var isDirectory = fs.statSync(pathFile).isDirectory();

        if (isDirectory) {
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

// add Require.js if needed
Generator.prototype.requireJS = function requireJS() {
  var cb = this.async(),
      self = this;

  if (self.includeRequireJS) {
    this.remote('jrburke', 'requirejs', '2.0.5', function(err, remote) {
      if (err) { return cb(err); }

      fs.mkdir('app/wp-content/themes/'+self.themeName+'/js', function() {
        remote.copy('require.js', 'app/wp-content/themes/'+self.themeName+'/js/vendors/require.js');

        cb();
      });
    });
  }
  else {
    cb();
  }
}

// rename all the css files to scss
Generator.prototype.convertFiles = function convertFiles() {
  var cb = this.async(),
      self = this,
      nbrFiles = 0;

  // parse recursively a directory and rename the css files to .scss
  function parseDirectory(path) {
    fs.readdir(path, function(err, files) {
      files.forEach(function(file) {
        var pathFile = fs.realpathSync(path+'/'+file);
        var isDirectory = fs.statSync(pathFile).isDirectory();

        if (isDirectory) {
          parseDirectory(pathFile);
        }
        else {
          var cssName = /[.]*\.css/i;
          if (cssName.test(file)) {
            var newName = pathFile.substring(0, pathFile.length - 3) + 'scss';
//            grunt.log.writeln('Renaming ' + pathFile + ' to ' + newName);
            // to avoid deleting style.css which is needed to activate the them,
            // we do not rename but only create another file then copy the content
            fs.open(newName, 'w', '0666', function() {
              fs.readFile(pathFile, function (err, data) {
                if (err) throw err;
                fs.writeFile(newName, data);
              });
            });
          }
        }
      });
    });
  }

  grunt.log.writeln('Renaming the css files to scss');
  parseDirectory('app/wp-content/themes/'+self.themeName);

  cb();
}

// generate the files to use Yeoman and the git related files
Generator.prototype.createYeomanFiles = function createYeomanFiles() {
  this.template('Gruntfile.js');
  this.copy('package.json', 'package.json');
  this.copy('gitignore', '.gitignore');
  this.copy('gitattributes', '.gitattributes');
}

Generator.prototype.endGenerator = function endGenerator() {
  grunt.log.writeln('');
  grunt.log.writeln('Looks like we\'re done!');
  grunt.log.writeln('Now you just need to install Wordpress the usual way');
  grunt.log.writeln('Don\'t forget to activate the new theme in the admin panel, and then you can start coding!');
  grunt.log.writeln('');
}
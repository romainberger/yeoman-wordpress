var util = require('util'),
    path = require('path'),
    fs = require('fs'),
    yeoman = require('../../../'),
    grunt = require('grunt'),
    rimraf = require('rimraf'),
    exec = require('child_process').exec;

module.exports = Generator;

function Generator() {
  yeoman.generators.Base.apply(this, arguments);

  this.sourceRoot(path.join(__dirname, 'templates'));
}

util.inherits(Generator, yeoman.generators.NamedBase);

// get the latest stable version of Wordpress
Generator.prototype.getVersion = function getVersion() {
  var cb = this.async(),
      self = this,
      latestVersion = '3.4.2'; // we still store the latest version to avoid throwing error

  grunt.log.writeln('');
  grunt.log.writeln('Trying to get the latest stable version of Wordpress');

  // try to get the latest version using the git tags
  try {
    var version = exec('git ls-remote --tags git://github.com/WordPress/WordPress.git | tail -n 1', function(err, stdout, stderr) {
                    if (err) {
                      self.latestVersion = latestVersion;
                    }
                    else {
                      var pattern = /\d\.\d\.\d/ig;
                      var match = pattern.exec(stdout);

                      if (match !== null) {
                        self.latestVersion = match[0];
                        grunt.log.writeln('Latest version: '+self.latestVersion);
                      }
                      else {
                        self.latestVersion = latestVersion;
                      }
                    }

                    cb();
                  });
  }
  catch(e) {
    self.latestVersion = latestVersion;
    cb();
  }
}

Generator.prototype.askFor = function askFor(arguments) {
  var cb = this.async(),
      self = this;

  var prompts = [{
          name: 'themeName',
          message: 'Name of the theme you want to use: ',
          default: 'mytheme'
      },
      {
          name: 'themeBoilerplate',
          message: 'Starter theme (please provide a github link): ',
          default: 'https://github.com/automattic/_s'
      },
      {
          name: 'wordpressVersion',
          message: 'Which version of Wordpress do you want?',
          default: self.latestVersion
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
    self.themeBoilerplate = props.themeBoilerplate;
    self.wordpressVersion = props.wordpressVersion;
    self.includeRequireJS = (/y/i).test(props.includeRequireJS);

    // check if the user only gave the repo url or the entire url with /tarball/{branch}
    var tarballLink = (/[.]*tarball\/[.]*/).test(self.themeBoilerplate);
    if (!tarballLink) {
      // if the user gave the repo url we add the end of the url. we assume he wants the master branch
      var lastChar = self.themeBoilerplate.substring(self.themeBoilerplate.length - 1);
      if (lastChar === '/') {
        self.themeBoilerplate = self.themeBoilerplate+'tarball/master';
      }
      else {
        self.themeBoilerplate = self.themeBoilerplate+'/tarball/master';
      }
    }

    cb();
  });
}

// download the framework and unzip it in the project app/
Generator.prototype.createApp = function createApp(cb) {
  var cb = this.async(),
      self = this;

  grunt.log.writeln('Let\'s download the framework, shall we?');
  grunt.log.writeln('Downloading Wordpress version '+self.wordpressVersion);
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
    grunt.log.writeln('Now we download the theme');

    // create the theme
    self.tarball(self.themeBoilerplate, 'app/wp-content/themes/'+self.themeName, cb);
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
      self = this;

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

'use strict';

var util   = require('util')
  , path   = require('path')
  , fs     = require('fs')
  , yeoman = require('yeoman-generator')
  , rimraf = require('rimraf')
  , exec   = require('child_process').exec
  , semver = require('semver')
  , config = require('./../config.js')

module.exports = Generator

function Generator() {
  yeoman.generators.Base.apply(this, arguments)

  this.sourceRoot(path.join(__dirname, 'templates'))
}

util.inherits(Generator, yeoman.generators.NamedBase)

// try to find the config file and read the infos to set the prompts default values
Generator.prototype.getConfig = function getConfig() {
  var cb   = this.async()
    , self = this

  self.configExists = false

  config.getConfig(function(err, data) {
    if (!err) {
      self.configExists = true
    }

    self.defaultAuthorName = data.authorName
    self.defaultAuthorURI = data.authorURI
    self.defaultTheme = data.themeUrl
    self.latestVersion = data.latestVersion

    cb()
  })
}

// get the latest stable version of Wordpress
Generator.prototype.getVersion = function getVersion() {
  var cb   = this.async()
    , self = this

  this.log.writeln('')
  this.log.writeln('Trying to get the latest stable version of Wordpress')

  // try to get the latest version using the git tags
  try {
    var version = exec('git ls-remote --tags git://github.com/WordPress/WordPress.git', function(err, stdout, stderr) {
      if (err !== null) {
        console.log('exec error: ' + err);
      }
      else {
        var pattern = /\d\.\d[\.\d]*/ig
          , match = stdout.match(pattern)
          , latest = match[match.length-1];
        //
        if (latest !== null && typeof latest !== 'undefined') {
          if (semver.valid(latest)) {
            // update config if needed
            if (semver.gt(latest, self.latestVersion)) {
              self.log.writeln('Updating config with latest version: '+latest);
              config.updateWordpressVersion(latest);
            };
          };

          self.latestVersion = latest;
          self.log.writeln('Latest version: '+self.latestVersion);
        }
      }
      cb()
    })
  }
  catch(e) {
    cb()
  }
}

Generator.prototype.askFor = function askFor() {
  var cb   = this.async()
    , self = this

  var prompts = [{
          name: 'themeName',
          message: 'Name of the theme you want to use',
          default: 'mytheme'
      },
      {
          name: 'themeBoilerplate',
          message: 'Starter theme (please provide a github link)',
          default: self.defaultTheme,
          filter: function (input) {
            return input.replace(/\ /g, '').toLowerCase()
          }
      },
      {
          name: 'wordpressVersion',
          message: 'Which version of Wordpress do you want?',
          default: self.latestVersion
      },
      {
          type: 'confirm',
          name: 'includeRequireJS',
          message: 'Would you like to include RequireJS (for AMD support)?'
      },
      {
          name: 'authorName',
          message: 'Author name',
          default: self.defaultAuthorName
      },
      {
          name: 'authorURI',
          message: 'Author URI',
          default: self.defaultAuthorURI
      }]

  this.prompt(prompts, function(props) {
    // set the property to parse the gruntfile
    self.themeNameOriginal = props.themeName
    self.themeName = props.themeName
    self.themeOriginalURL = props.themeBoilerplate
    self.themeBoilerplate = props.themeBoilerplate
    self.wordpressVersion = props.wordpressVersion
    self.includeRequireJS = props.includeRequireJS
    self.authorName = props.authorName
    self.authorURI = props.authorURI

    // check if the user only gave the repo url or the entire url with /tarball/{branch}
    var tarballLink = (/[.]*tarball\/[.]*/).test(self.themeBoilerplate)
    if (!tarballLink) {
      // if the user gave the repo url we add the end of the url. we assume he wants the master branch
      var lastChar = self.themeBoilerplate.substring(self.themeBoilerplate.length - 1)
      if (lastChar === '/') {
        self.themeBoilerplate = self.themeBoilerplate+'tarball/master'
      }
      else {
        self.themeBoilerplate = self.themeBoilerplate+'/tarball/master'
      }
    }

    // create the config file it does not exist
    if (!self.configExists) {
      var values = {
        authorName: self.authorName
      , authorURI:  self.authorURI
      , themeUrl:   self.themeOriginalURL
      }
      config.createConfig(values, cb)
    }
    else {
      cb()
    }
  })
}

// download the framework and unzip it in the project app/
Generator.prototype.createApp = function createApp() {
  var cb   = this.async()
    , self = this

  this.log.writeln('Let\'s download the framework, shall we?')
  this.log.writeln('Downloading Wordpress version '+self.wordpressVersion)
  this.tarball('https://github.com/WordPress/WordPress/tarball/'+self.wordpressVersion, 'app', cb)
}

// remove the basic theme and create a new one
Generator.prototype.createTheme = function createTheme() {
  var cb   = this.async()
    , self = this

  this.log.writeln('First let\'s remove the built-in themes we will not use')
  // remove the existing themes
  fs.readdir('app/wp-content/themes', function(err, files) {
    if (typeof files != 'undefined' && files.length !== 0) {
      files.forEach(function(file) {
        var pathFile = fs.realpathSync('app/wp-content/themes/'+file)
          , isDirectory = fs.statSync(pathFile).isDirectory()

        if (isDirectory) {
          rimraf.sync(pathFile)
          self.log.writeln('Removing ' + pathFile)
        }
      })
    }

    self.log.writeln('')
    self.log.writeln('Now we download the theme')

    // create the theme
    self.tarball(self.themeBoilerplate, 'app/wp-content/themes/'+self.themeName, cb)
  })
}

// add Require.js if needed
Generator.prototype.requireJS = function requireJS() {
  var cb   = this.async()
    , self = this

  if (self.includeRequireJS) {
    this.remote('jrburke', 'requirejs', '2.0.5', function(err, remote) {
      if (err) { return cb(err) }

      fs.mkdir('app/wp-content/themes/'+self.themeName+'/js', function() {
        remote.copy('require.js', 'app/wp-content/themes/'+self.themeName+'/js/vendors/require.js')
        cb()
      })
    })
  }
  else {
    cb()
  }
}

// rename all the css files to scss
Generator.prototype.convertFiles = function convertFiles() {
  var cb   = this.async()
    , self = this

  // parse recursively a directory and rename the css files to .scss
  function parseDirectory(path) {
    fs.readdir(path, function(err, files) {
      files.forEach(function(file) {
        var pathFile = fs.realpathSync(path+'/'+file)
          , isDirectory = fs.statSync(pathFile).isDirectory()

        if (isDirectory) {
          parseDirectory(pathFile)
        }
        else {
          var cssName = /[.]*\.css/i
          if (cssName.test(file)) {
            var newName = pathFile.substring(0, pathFile.length - 3) + 'scss'
            // to avoid deleting style.css which is needed to activate the them,
            // we do not rename but only create another file then copy the content
            fs.open(newName, 'w', '0666', function() {
              fs.readFile(pathFile, 'utf8', function (err, data) {
                if (err) throw err
                // Insert the given theme name into SCSS and CSS files
                data = data.replace(/^.*Theme Name:.*$/mg, 'Theme Name: ' + self.themeNameOriginal)
                data = data.replace(/^.*Author: .*$/mg, 'Author: ' + self.authorName)
                data = data.replace(/^.*Author URI: .*$/mg, 'Author URI: ' + self.authorURI)

                fs.writeFile(newName, data)
                fs.writeFile(pathFile, data)
              })
            })
          }
        }
      })
    })
  }

  this.log.writeln('Renaming the css files to scss')
  parseDirectory('app/wp-content/themes/'+self.themeName)

  cb()
}

// generate the files to use Yeoman and the git related files
Generator.prototype.createYeomanFiles = function createYeomanFiles() {
  this.template('Gruntfile.js')
  this.template('bowerrc', '.bowerrc')
  this.copy('package.json', 'package.json')
  this.copy('gitignore', '.gitignore')
  this.copy('gitattributes', '.gitattributes')
}

Generator.prototype.endGenerator = function endGenerator() {
  this.log.writeln('')
  this.log.writeln('Looks like we\'re done!')
  this.log.writeln('Now you just need to install Wordpress the usual way')
  this.log.writeln('Don\'t forget to activate the new theme in the admin panel, and then you can start coding!')
  this.log.writeln('')
}

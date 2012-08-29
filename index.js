
var util = require('util'),
  path = require('path'),
  yeoman = require('../../../'),
  grunt = require('grunt');

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

  // remove the themes
  grunt.log.writeln('I am supposed to clean the themes directory here'.red);

  grunt.log.writeln('Let\'s create a fresh themes full of HTML5 boilerplate awesomeness');

  // create the theme with html5 boilerplate
  this.tarball('https://github.com/zencoder/html5-boilerplate-for-wordpress/tarball/master', 'app/wp-content/themes/'+self.themeName, cb);
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
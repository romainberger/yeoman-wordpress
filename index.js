
var util = require('util'),
  path = require('path'),
  yeoman = require('../../../'),
  grunt = require('grunt');

module.exports = Generator;

function Generator() {
  yeoman.generators.NamedBase.apply(this, arguments);

  this.sourceRoot(path.join(__dirname, 'templates'));

  // copy the yeoman files
  this.createYeomanFiles();

  // copy the template
  this.createApp(function(){
    // done
  });
}

util.inherits(Generator, yeoman.generators.NamedBase);

// download the framework and unzip it in the project app/
Generator.prototype.createApp = function createApp(cb){
  this.tarball('https://github.com/WordPress/WordPress/tarball/master', 'app', cb);
}

// generate the gruntfile and package.json
Generator.prototype.createYeomanFiles = function createYeomanFiles(){
  this.copy('Gruntfile.js', 'Gruntfile.js');
  this.copy('package.json', 'package.json');
 // this.copy('gitignore', '.gitignore');
// this.copy('gitattributes', '.gitattributes');
}
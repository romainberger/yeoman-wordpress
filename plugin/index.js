
'use strict';

var util   = require('util')
  , path   = require('path')
  , fs     = require('fs')
  , yeoman = require('yeoman-generator')
  , config = require('./../config.js')

module.exports = Generator

function Generator() {
  yeoman.generators.Base.apply(this, arguments)

  this.sourceRoot(path.join(__dirname, 'templates'))
}

util.inherits(Generator, yeoman.generators.NamedBase)

Generator.prototype.getConfig = function getConfig() {
  var cb   = this.async()
    , self = this

  config.getConfig(function(err, data) {
    self.defaultAuthor = data.authorName
    cb()
  })
}

Generator.prototype.askFor = function askFor() {
  var cb   = this.async()
    , self = this

  var prompts = [{
          name: 'pluginName',
          message: 'Name of the plugin: ',
          default: 'myPlugin'
      },
      {
          name: 'pluginAuthor',
          message: 'Author Name: ',
          default: self.defaultAuthor
      }]

  this.prompt(prompts, function(props) {
    self.pluginName   = props.pluginName
    self.pluginAuthor = props.pluginAuthor

    cb()
  })
}

Generator.prototype.createPlugin = function createPlugin() {
  var cb = this.async()

  this.tarball('https://github.com/tommcfarlin/WordPress-Plugin-Boilerplate/tarball/master', 'app/wp-content/plugins', cb)
}

Generator.prototype.editFiles = function editFiles() {
  var cb       = this.async()
    , self     = this
    , safeName = self.pluginName.replace(/\ /g, '');

  fs.rename('app/wp-content/plugins/plugin-name', 'app/wp-content/plugins/'+safeName, function() {
    fs.rename('app/wp-content/plugins/'+safeName+'/plugin-name.php', 'app/wp-content/plugins/'+safeName+'/'+safeName+'.php', function() {
      var pluginFile = 'app/wp-content/plugins/'+safeName+'/'+safeName+'.php'

      fs.readFile(pluginFile, 'utf8', function(err, data) {
        if (err) throw err

        data = data.replace(/^.*Plugin Name: .*$/mg, 'Plugin Name: ' + self.pluginName)
        data = data.replace(/^.*Author: .*$/mg, 'Author: ' + self.pluginAuthor)

        fs.writeFile(pluginFile, data)
        fs.unlink('app/wp-content/plugins/README.md', function() {
          cb()
        })
      })
    })
  })
}

Generator.prototype.goodbye = function goodbye() {
  this.log.writeln('Plugin created successfully')
  this.log.writeln('')
}

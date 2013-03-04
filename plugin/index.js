
'use strict'

var util   = require('util')
  , path   = require('path')
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

  this.prompt(prompts, function(e, props) {
    if(e) {
      return self.emit('error', e)
    }

    self.pluginName   = props.pluginName
    self.pluginAuthor = props.pluginAuthor

    cb()

  })
}

Generator.prototype.createPlugin = function createPlugin() {
  var cb   = this.async()

  this.tarball('https://github.com/tommcfarlin/WordPress-Plugin-Boilerplate/tarball/master', 'app/wp-content/plugins', cb)
}

Generator.prototype.editFiles = function editFiles() {
  // rename the directory
  // edit the files to change the author name and plugin name
  // remove the readme
}

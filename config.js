
'use strict'

var path = require('path')
  , fs   = require('fs')

module.exports = {
    getConfig: getConfig
  , createConfig: createConfig
  , updateWordpressVersion: updateWordpressVersion
}

var home            = process.env.HOME || process.env.USERPROFILE
  , configDirectory = path.join(home, '.yeoman-wordpress')
  , configPath      = path.join(configDirectory, 'config.json')
  , defaults = {
      authorName: ''
    , authorURI:  ''
    , themeUrl:   'https://github.com/automattic/_s'
    , latestVersion: '3.5.1'
  }

/**
 *  Read the config file
 *  And trigger the callback function with errors and
 *  datas as parameters
 */
function getConfig(cb) {
  try {
    fs.readFile(configPath, 'utf8', function(err, data) {
      if (err) {
        cb(true, defaults)
        return
      }

      cb(false, JSON.parse(data))
    })
  }
  catch(e) {
    cb(true, defaults)
  }
}

/**
 *  Create the config file
 *
 *  @param object values Values to write in the config file
 *  @param function cb Callback function
 */
function createConfig(values, cb) {
  var configValues = {
      authorName: values.authorName || defaults.authorName
    , authorURI:  values.authorURI || defaults.authorURI
    , themeUrl:   values.themeUrl || defaults.themeUrl
    , latestVersion: values.latestVersion || defaults.latestVersion
  }

  var configData = ['{\n\t'
      , '"authorName": "'+configValues.authorName+'",\n\t'
      , '"authorURI": "'+configValues.authorURI+'",\n\t'
      , '"themeUrl": "'+configValues.themeUrl+'",\n\t'
      , '"latestVersion": "'+configValues.latestVersion+'"\n'
      , '}'
  ].join('')

  fs.mkdir(configDirectory, '0777', function() {
    fs.writeFile(configPath, configData, 'utf8', cb)
  })
}

/**
 * Update the config file to bump
 * the Wordpress version
 *
 * @param string version Wordpress version
 */
function updateWordpressVersion(version) {
  getConfig(function(err, values) {
    var newValues = {
        authorName: values.authorName
      , authorURI:  values.authorURI
      , themeUrl:   values.themeUrl
      , latestVersion: version
    }

    createConfig(newValues, function() {
      console.log('done')
    })
  })
}

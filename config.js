
'use strict'

var path = require('path')
  , fs   = require('fs')

module.exports = {
  getConfig: getConfig
, createConfig: createConfig
}

var home       = process.env.HOME || process.env.USERPROFILE
  , configPath = path.join(home, '.yeoman/yeoman-wordpress/config.json')

/**
 *  Read the config file
 *  And trigger the callback function with errors and
 *  datas as parameters
 */
function getConfig(cb) {
  fs.readFile(configPath, 'utf8', function(err, data) {
    cb(err, JSON.parse(data))
  })
}

/**
 *  Create the config file
 */
function createConfig() {
  console.log('TODO !!')
}

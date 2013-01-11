// Build task for yeoman-wordpress

var fs = require('fs')
  , path = require('path')
  , crypto = require('crypto')

module.exports = function(grunt) {

  grunt.registerMultiTask('build', 'Build script for Yeoman Wordpress', function() {
    grunt.helper('parseFile', this.data)
  })

  grunt.registerHelper('parseFile', function(files) {
    grunt.file.expandFiles(files).forEach(function(f) {
      // @TODO : check this regex
      var regScript = /\/.*\.js/ig
        , content = grunt.file.read(f)
        , match
        , result = []

      // find the script names in the php file
      while (match = regScript.exec(content)) {
        result.push(match[0])
      }

      if (result.length > 0) {
        result.forEach(function(file) {
          // rename the file with md5 hash
          var filePath = path.join(process.cwd(), 'app/wp-content/themes/<%= themeName %>', file)
            , tempPath = path.join(process.cwd(), 'temp/wp-content/themes/<%= themeName %>')
            , md5 = grunt.helper('md5', filePath)
            , renamed = [md5.slice(0, 8), path.basename(filePath)].join('.')
            , newFilePath = path.resolve(path.dirname(tempPath), renamed)

          // copy the file to the temp folder with the new name
          // @TODO this is supposed to work but the temp dir does not exist sooooo...
          fs.createReadStream(filePath).pipe(fs.createWriteStream(newFilePath));

          // @TODO replace the filename in the php file with `renamed`. Be careful to only renamed one file and not every *.js
          // content = content.replace(regScript, renamed);
        })
      }
    })
  })

  // Function taken from the Yeoman rev.js task
  // **md5** helper is a basic wrapper around crypto.createHash, with
  // given `algorithm` and `encoding`. Both are optional and defaults to
  // `md5` and `hex` values.
  grunt.registerHelper('md5', function(filepath, algorithm, encoding) {
    algorithm = algorithm || 'md5';
    encoding = encoding || 'hex';
    var hash = crypto.createHash(algorithm);
    hash.update(grunt.file.read(filepath));
    grunt.log.verbose.write('Hashing ' + filepath + '...');
    return hash.digest(encoding);
  });

}

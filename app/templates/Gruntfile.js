module.exports = function(grunt) {
  'use strict';

  // show elapsed time at the end
  require('time-grunt')(grunt);
  // load all grunt tasks
  require('load-grunt-tasks')(grunt);

  var yeomanConfig = {
    themeName: '<%= themeName %>',
    dist: 'dist'
  }

  grunt.initConfig({
    yeomanConfig: yeomanConfig,
    watch: {
      coffee: {
        files: ['app/wp-content/themes/<%%= yeomanConfig.themeName %>/js/*.coffee'],
        tasks: ['coffee:dist']
      },
      coffeeTest: {
        files: ['test/spec/{,*/}*.coffee'],
        tasks: ['coffee:test']
      },
      compass: {
        files: ['app/wp-content/themes/<%%= yeomanConfig.themeName %>'],
        tasks: ['compass:server', 'autoprefixer']
      },
      styles: {
        files: ['app/wp-content/themes/<%%= yeomanConfig.themeName %>'],
        tasks: ['copy:styles', 'autoprefixer']
      },
      livereload: {
        options: {
          livereload: '<%%= connect.options.livereload %>'
        },
        files: [
          'app/wp-content/themes/<%%= yeomanConfig.themeName %>/*.php',
          'app/wp-content/themes/<%%= yeomanConfig.themeName %>/*.css',
          'app/wp-content/themes/<%%= yeomanConfig.themeName %>/js/*.js',
          'app/wp-content/themes/<%%= yeomanConfig.themeName %>/images/*'
        ]
      }
    },
    connect: {
      options: {
        port: 9000,
        livereload: 35729,
        // change this to '0.0.0.0' to access the server from outside
        hostname: 'localhost'
      },
      livereload: {
        options: {
          open: true,
          base: [
            '.tmp',
            'app/wp-content/themes/<%%= yeomanConfig.themeName %>'
          ]
        }
      },
      test: {
        options: {
          base: [
            '.tmp',
            'test',
            'app/wp-content/themes/<%%= yeomanConfig.themeName %>'
          ]
        }
      },
      dist: {
        options: {
          open: true,
          base: yeomanConfig.dist
        }
      }
    },
    clean: {
        dist: {
            files: [{
                dot: true,
                src: [
                    '.tmp',
                    '<%%= yeomanConfig.dist %>/*',
                    '!<%%= yeomanConfig.dist %>/.git*'
                ]
            }]
        },
        server: '.tmp'
    },
    jshint: {
        options: {
            jshintrc: '.jshintrc'
        },
        all: [
            'Gruntfile.js',
            'app/wp-content/themes/<%%= yeomanConfig.themeName %>/js/{,*/}*.js',
            '!app/wp-content/themes/<%%= yeomanConfig.themeName %>/js/vendor/*',
            'test/spec/{,*/}*.js'
        ]
    },
    mocha: {
        all: {
            options: {
                run: true,
                urls: ['http://<%%= connect.test.options.hostname %>:<%%= connect.test.options.port %>/index.html']
            }
        }
    },
    coffee: {
        dist: {
            files: [{
                expand: true,
                cwd: 'app/wp-content/themes/<%%= yeomanConfig.themeName %>/js',
                src: '{,*/}*.coffee',
                dest: '.tmp/scripts',
                ext: '.js'
            }]
        },
        test: {
            files: [{
                expand: true,
                cwd: 'test/spec',
                src: '{,*/}*.coffee',
                dest: '.tmp/spec',
                ext: '.js'
            }]
        }
    },
    compass: {
        options: {
            sassDir: 'app/wp-content/themes/<%%= yeomanConfig.themeName %>',
            cssDir: '.tmp/styles',
            generatedImagesDir: '.tmp/images/generated',
            imagesDir: 'app/wp-content/themes/<%%= yeomanConfig.themeName %>/img',
            javascriptsDir: 'app/wp-content/themes/<%%= yeomanConfig.themeName %>/js',
            fontsDir: 'app/wp-content/themes/<%%= yeomanConfig.themeName %>/css/fonts',
            importPath: 'app/wp-content/themes/<%%= yeomanConfig.themeName %>/bower_components',
            httpImagesPath: '/images',
            httpGeneratedImagesPath: '/images/generated',
            httpFontsPath: '/css/fonts',
            relativeAssets: false
        },
        dist: {
            options: {
                generatedImagesDir: '<%%= yeomanConfig.dist %>/img/generated'
            }
        },
        server: {
            options: {
                debugInfo: true
            }
        }
    },
    autoprefixer: {
        options: {
            browsers: ['last 1 version']
        },
        dist: {
            files: [{
                expand: true,
                cwd: '.tmp/styles/',
                src: '{,*/}*.css',
                dest: '.tmp/styles/'
            }]
        }
    },
    // not used since Uglify task does concat,
    // but still available if needed
    /*concat: {
        dist: {}
    },*/
    requirejs: {
        dist: {
            // Options: https://github.com/jrburke/r.js/blob/master/build/example.build.js
            options: {
                // `name` and `out` is set by grunt-usemin
                baseUrl: 'app/wp-content/themes/'+yeomanConfig.themeName+'/js',
                optimize: 'none',
                // TODO: Figure out how to make sourcemaps work with grunt-usemin
                // https://github.com/yeoman/grunt-usemin/issues/30
                //generateSourceMaps: true,
                // required to support SourceMaps
                // http://requirejs.org/docs/errors.html#sourcemapcomments
                preserveLicenseComments: false,
                useStrict: true,
                wrap: true
                //uglify2: {} // https://github.com/mishoo/UglifyJS2
            }
        }
    },
    rev: {
        dist: {
            files: {
                src: [
                    '<%%= yeomanConfig.dist %>/scripts/{,*/}*.js',
                    '<%%= yeomanConfig.dist %>/styles/{,*/}*.css',
                    '<%%= yeomanConfig.dist %>/images/{,*/}*.{png,jpg,jpeg,gif,webp}',
                    '<%%= yeomanConfig.dist %>/styles/fonts/{,*/}*.*'
                ]
            }
        }
    },
    useminPrepare: {
        options: {
            dest: '<%%= yeomanConfig.dist %>'
        },
        html: 'app/wp-content/themes/<%%= yeomanConfig.themeName %>/index.html'
    },
    usemin: {
        options: {
            dirs: ['<%%= yeomanConfig.dist %>']
        },
        html: ['<%%= yeomanConfig.dist %>/{,*/}*.html'],
        css: ['<%%= yeomanConfig.dist %>/styles/{,*/}*.css']
    },
    imagemin: {
        dist: {
            files: [{
                expand: true,
                cwd: 'app/wp-content/themes/<%%= yeomanConfig.themeName %>/images',
                src: '{,*/}*.{png,jpg,jpeg}',
                dest: '<%%= yeomanConfig.dist %>/images'
            }]
        }
    },
    svgmin: {
        dist: {
            files: [{
                expand: true,
                cwd: 'app/wp-content/themes/<%%= yeomanConfig.themeName %>/images',
                src: '{,*/}*.svg',
                dest: '<%%= yeomanConfig.dist %>/images'
            }]
        }
    },
    cssmin: {
        // This task is pre-configured if you do not wish to use Usemin
        // blocks for your CSS. By default, the Usemin block from your
        // `index.html` will take care of minification, e.g.
        //
        //     <!-- build:css({.tmp,app}) styles/main.css -->
        //
        // dist: {
        //     files: {
        //         'app/wp-content/themes/<%%= yeomanConfig.themeName %>/style.css': [
        //             '.tmp/styles/{,*/}*.css',
        //             'app/wp-content/themes/<%%= yeomanConfig.themeName %>/styles/{,*/}*.css'
        //         ]
        //     }
        // }
    },
    htmlmin: {
        dist: {
            options: {
                /*removeCommentsFromCDATA: true,
                // https://github.com/yeoman/grunt-usemin/issues/44
                //collapseWhitespace: true,
                collapseBooleanAttributes: true,
                removeAttributeQuotes: true,
                removeRedundantAttributes: true,
                useShortDoctype: true,
                removeEmptyAttributes: true,
                removeOptionalTags: true*/
            },
            files: [{
                expand: true,
                cwd: 'app/wp-content/themes/<%%= yeomanConfig.themeName %>',
                src: '*.html',
                dest: '<%%= yeomanConfig.dist %>'
            }]
        }
    },
    // Put files not handled in other tasks here
    copy: {
        dist: {
            files: [{
                expand: true,
                dot: true,
                cwd: 'app/wp-content/themes/<%%= yeomanConfig.themeName %>',
                dest: '<%%= yeomanConfig.dist %>',
                src: [
                    '*.{ico,png,txt}',
                    '.htaccess',
                    'images/{,*/}*.{webp,gif}',
                    'styles/fonts/{,*/}*.*',
                    'bower_components/sass-bootstrap/fonts/*.*'
                ]
            }]
        },
        styles: {
            expand: true,
            dot: true,
            cwd: 'app/wp-content/themes/<%%= yeomanConfig.themeName %>/styles',
            dest: '.tmp/styles/',
            src: '{,*/}*.css'
        }
    },
    modernizr: {
        devFile: 'app/wp-content/themes/<%%= yeomanConfig.themeName %>/bower_components/modernizr/modernizr.js',
        outputFile: '<%%= yeomanConfig.dist %>/bower_components/modernizr/modernizr.js',
        files: [
            '<%%= yeomanConfig.dist %>/scripts/{,*/}*.js',
            '<%%= yeomanConfig.dist %>/styles/{,*/}*.css',
            '!<%%= yeomanConfig.dist %>/scripts/vendor/*'
        ],
        uglify: true
    },
    concurrent: {
        server: [
            'compass',
            'coffee:dist',
            'copy:styles'
        ],
        test: [
            'coffee',
            'copy:styles'
        ],
        dist: [
            'coffee',
            'compass',
            'copy:styles',
            'imagemin',
            'svgmin',
            'htmlmin'
        ]
    },
    bower: {
        options: {
            exclude: ['modernizr']
        },
        all: {
            rjsConfig: 'app/wp-content/themes/<%%= yeomanConfig.themeName %>/scripts/main.js'
        }
    }
  });

  grunt.registerTask('server', function (target) {
      if (target === 'dist') {
          return grunt.task.run(['build', 'connect:dist:keepalive']);
      }

      grunt.task.run([
          'clean:server',
          'concurrent:server',
          'autoprefixer',
          'connect:livereload',
          'watch'
      ]);
  });

  grunt.registerTask('test', [
      'clean:server',
      'concurrent:test',
      'autoprefixer',
      'connect:test',
      'mocha'
  ]);

  grunt.registerTask('build', [
      'clean:dist',
      'useminPrepare',
      'concurrent:dist',
      'autoprefixer',
      'requirejs',
      'concat',
      'cssmin',
      'uglify',
      'modernizr',
      'copy:dist',
      'rev',
      'usemin'
  ]);

  grunt.registerTask('default', [
      'jshint',
      'test',
      'build'
  ]);
};

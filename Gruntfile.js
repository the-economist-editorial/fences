'use strict';

var webpack = require('webpack');
var jsFiles = [
  './js/**/*.js'
];

module.exports = function(grunt) {
  var mainPort = 1991;
  var livereloadPort = 1989;

  var webpackBuildConfig = require('./webpack.config.js');

  grunt.initConfig({
    connect : {
      server : {
        options : {
          base : '.',
          port : mainPort,
          hostname : '*',
          livereload : livereloadPort
        }
      }
    },
    webpack : {
      options: webpackBuildConfig,
      'build-dev' : {
        devtool : 'sourcemap',
        debug : true
      }
    },
    'webpack-dev-server' : {
      options : {
        webpack : webpackBuildConfig,
        publicPath : '/'
      },
      start : {
        keepAlive : true,
        webpack : {
          devtool : 'sourcemap',
          debug : true
        }
      }
    },
    cssnext : {
      options : {
        sourcemap : true,
        import : true,
        // map : {
        //   inline : false,
        //   annotation : 'dist/index.css.map'
        // }
      },
      dist : {
        files : {
          'built/index.css' : 'css/index.css'
        }
      }
    },
    watch : {
      // this makes sure grunt restarts whenever the Gruntfile changes
      grunt : {
        files : ['Gruntfile.js']
      },
      css : {
        files : ['css/**/*.css'],
        tasks : ['cssnext'],
        options : {
          livereload : livereloadPort
        }
      },
      data : {
        files : ['data/**/*.*'],
        options : {
          livereload : livereloadPort
        }
      },
      html : {
        files : ['index.html'],
        options : {
          livereload : livereloadPort
        }
      },
      js : {
        files : jsFiles,
        tasks : ['webpack:build-dev'],
        options : {
          spawn : false,
          livereload : livereloadPort
        }
      }
    }
  });

  grunt.loadNpmTasks('grunt-webpack');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-connect');
  grunt.loadNpmTasks('grunt-cssnext');

  grunt.registerTask('default', ['webpack:build-dev', 'cssnext', 'connect', 'watch']);
};

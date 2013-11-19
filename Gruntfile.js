module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    nodeunit: {
      all: ['test/*.js']
    },
    watch: {
      files: '<config:lint.files>',
      tasks: 'default'
    },
    jshint: {
      files: ['./*.js', './src/*.js', './test/*.js'],
      options: {
        curly: true,
        eqeqeq: true,
        immed: true,
        latedef: true,
        newcap: true,
        noarg: true,
        sub: true,
        undef: true,
        boss: true,
        eqnull: true,
        node: true
      },
      globals: {
        exports: true
      }
    },
    uglify: {
      options: {
        banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n'
      },
      build: {
        src: ['./build/jacc.js'],
        dest: 'build/<%= pkg.name %>.min.js'
      }
    },
    coffee: {
      compile: {
        files: {
          './build/jacc.js': ['./src/app3.coffee']
        }
      },
      compile2: {
        files: {
          './test/testCoffee.js': ['./test/*.coffee']
        }
      }
    }
  });

  // Load the plugin that provides the "uglify" task.
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-nodeunit');
  grunt.loadNpmTasks('grunt-contrib-coffee');

  // Default task(s).
  grunt.registerTask('default', ['coffee', 'uglify']);

};

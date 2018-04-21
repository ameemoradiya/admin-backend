'use strict';

module.exports = function (grunt) {

  grunt.initConfig({
    'jshint': {
      'files': [ 'constants/*.js', 'controllers/*.js', 'lib/*.js', 'lib/**/*.js',
        'models/*.js', 'modules/*.js', 'routes/*.js', 'routes/**/*.js', 'scripts/*.js', 'services/*.js',
        'app.js', 'server.js' ],
      'options': grunt.file.readJSON('.jshintrc')
    },
    'watch': {
      'files': [ '<%= jshint.files %>' ],
      'tasks': [ 'jshint' ]
    }
  });

  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-watch');

  grunt.registerTask('default', [ 'jshint' ]);
  grunt.registerTask('build', [ 'clean', 'less', 'browserify', 'notify' ]);

};

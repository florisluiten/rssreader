module.exports = function(grunt) {
    grunt.initConfig({
                         jasmine : {
                             src : 'www/js/application.js',
                             options: {
                                 specs : 'tests/unit/specs/*specs.js'
                             }
                         }
                     });
    grunt.loadNpmTasks('grunt-contrib-jasmine');
    grunt.registerTask('default', 'jasmine');
};


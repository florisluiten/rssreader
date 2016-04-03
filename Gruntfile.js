module.exports = function(grunt) {
    grunt.initConfig({
        jasmine: {
            src: 'www/js/rssreader.js',
            options: {
                specs: 'tests/unit/specs/*specs.js',
                vendor: ['www/js/jquery.min.js', 'www/js/jquery.event.drag-2.2.js']
            }
        }
    });
    grunt.loadNpmTasks('grunt-contrib-jasmine');
    grunt.registerTask('default', 'jasmine');
};


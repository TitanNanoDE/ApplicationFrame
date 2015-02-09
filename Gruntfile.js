module.exports = function(grunt) {

    grunt.loadNpmTasks('grunt-es6-module-transpiler');
    grunt.loadNpmTasks('grunt-es6-transpiler');

    grunt.initConfig({
        transpile: {
            main: {
                type: "amd",
                files: [{
                    expand: true,
                    src: ['af.js', 'modules/*.js'],
                    dest: 'dist/'
                }]
            }
        },
        es6transpiler: {
            options: {
                globals : {
                    System : false,
                    'define' : false
                }
            },
            main: {
                files : [{
                    expand : true,
                    src: ['dist/**/*.js'],
                    dest: './'
                }]
            },
        }
    });

    grunt.registerTask('default', ['transpile', 'es6transpiler']);
};

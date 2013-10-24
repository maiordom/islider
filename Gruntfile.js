module.exports = function( grunt ) {
    'use strict';

    grunt.initConfig({
        watch: {
            js: {
                files: [ 'src/*.js' ],
                tasks: [ 'replace:js' ]
            },
            css: {
                files: [ 'src/islider.styl' ],
                tasks: [ 'stylus' ]
            }
        },
        stylus: {
            compile: {
                options: {
                    compress: false,
                    use: [
                        require( 'nib' )
                    ]
                },
                files: {
                    'islider.css': 'src/islider.styl'
                }
            }
        },
        replace: {
            js: {
                options: {
                    patterns: [{
                        json: {
                            'control': '<%= grunt.file.read("src/islider-control.js") %>',
                            'drag': '<%= grunt.file.read("src/islider-drag.js") %>'
                        }
                    }]
                },
                files: [{ 
                    src: 'src/islider-box.js',
                    dest: 'islider.js'
                }]
            }
        }
    });

    grunt.loadNpmTasks( 'grunt-replace' );
    grunt.loadNpmTasks( 'grunt-contrib-watch' );
    grunt.loadNpmTasks( 'grunt-contrib-stylus' );
    grunt.registerTask( 'default', [ 'stylus', 'replace', 'watch' ] );
};
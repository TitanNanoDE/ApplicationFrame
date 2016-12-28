'use strict';

let gulp = require('gulp');
let babel = require('gulp-babel');
let merge = require ('merge-stream');

const dist = 'testable/';

const babelConfig = {
    "plugins": ["babel-plugin-transform-es2015-modules-commonjs"]
};

gulp.task('default', () => {
    let main = gulp.src(['af.js'])
        .pipe(babel(babelConfig))
        .pipe(gulp.dest(dist));

    let core = gulp.src(['core/**/*.js'])
        .pipe(babel(babelConfig))
        .pipe(gulp.dest(dist + 'core/'));

    let modules = gulp.src(['modules/**/*.js'])
        .pipe(babel(babelConfig))
        .pipe(gulp.dest(dist + 'modules'));

    let util = gulp.src(['util/**/*.js'])
        .pipe(babel(babelConfig))
        .pipe(gulp.dest(dist + 'util'));

    return merge(main, core, modules, util);
});

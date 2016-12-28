'use strict';

let gulp = require('gulp');
let babel = require('gulp-babel');
const clean = require('gulp-clean');
let merge = require ('merge-stream');

const dist = 'testable/';

const babelConfig = {
    "plugins": ["babel-plugin-transform-es2015-modules-commonjs"]
};

gulp.task('clean', () => {
    return gulp.src(dist, { read: false })
        .pipe(clean());
})

gulp.task('default', ['clean'], () => {

    let core = gulp.src(['core/**/*.js'])
        .pipe(babel(babelConfig))
        .pipe(gulp.dest(dist + 'core/'));

    let util = gulp.src(['util/**/*.js'])
        .pipe(babel(babelConfig))
        .pipe(gulp.dest(dist + 'util'));

    return merge(core, util);
});

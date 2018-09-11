'use strict';

const gulp = require('gulp');
const babel = require('gulp-babel');
const clean = require('gulp-clean');
const sourcemaps = require('gulp-sourcemaps');
const merge = require ('merge-stream');

const dist = 'testable/';

const babelConfig = {
    'plugins': ['@babel/transform-modules-commonjs']
};

gulp.task('clean', () => {
    return gulp.src(dist, { read: false })
        .pipe(clean());
});

gulp.task('default', ['clean'], () => {

    const core = gulp.src([
        'core/**/*.js',
        'util/**',
        'IndexedDB.js',
        'IndexedDB/**/*.js',
        'rendering.js',
        'rendering/**/*.js',
        'IndexedDB/**/*.js',
        'memory/**/*.js',
        'node/**/*.js',
        'web/**/*.js',
        'ServiceWorker/**/*.js',
        'traits/**/*.js',
    ], { base: './', })
        .pipe(sourcemaps.init())
        .pipe(babel(babelConfig))
        .pipe(sourcemaps.write())
        .pipe(gulp.dest(dist));

    return merge(core);
});

'use strict';

const { src, dest, series } = require('gulp');
const babel = require('gulp-babel');
const clean = require('gulp-clean');
const sourcemaps = require('gulp-sourcemaps');
const merge = require ('merge-stream');

const dist = 'testable/';

const babelConfig = {
    'plugins': ['@babel/transform-modules-commonjs']
};

const task_clean = function() {
    return src(dist, { read: false, allowEmpty: true })
        .pipe(clean());
};

const task_default = function() {

    const core = src([
        'core/**/*.js',
        'util/**',
        'rendering/**/*.js',
        'IndexedDB/**/*.js',
        'memory/**/*.js',
        'node/**/*.js',
        'web/**/*.js',
        'ServiceWorker/**/*.js',
        'traits/**/*.js',
        'threading/**/*.js',
    ], { base: './', })
        .pipe(sourcemaps.init())
        .pipe(babel(babelConfig))
        .pipe(sourcemaps.write('.', {
            sourceRoot: '../'
        }))
        .pipe(dest(dist));

    return merge(core);
};

exports.default = series(task_clean, task_default);

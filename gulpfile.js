'use strict';

const gulp = require('gulp');
const connect = require('gulp-connect');
const babel = require('gulp-babel');
const watch = require('gulp-watch');
const autoprefixer = require('gulp-autoprefixer');
const stylus = require('gulp-stylus');
const nib = require('nib');
const uglify = require('gulp-uglify');
const rename = require('gulp-rename');
const cssNano = require('gulp-cssnano');
const replace = require('gulp-replace');
const runSequence = require('run-sequence');
const concat = require('gulp-concat');
const fs = require('fs');

const config = require('./package.json').config;

gulp.task('server', () => {
    return connect.server({
        port: 3001,
        root: [__dirname]
    });
});

gulp.task('replace', () => {
    return gulp.src(`${config.jsPath}/${config.name}.js`)
        .pipe(replace('// @@control', fs.readFileSync(`${config.jsPath}/islider-control.js`, 'utf8')))
        .pipe(replace('// @@drag', fs.readFileSync(`${config.jsPath}/islider-drag.js`, 'utf8')))
        .pipe(gulp.dest(config.dist));
});

gulp.task('js', () => {
    runSequence('replace', ['babel']);
});

gulp.task('babel', () => {
    return gulp.src(`${config.dist}/*.js`)
        .pipe(babel({
            presets: ['es2015']
        }))
        .on('error', function(err) {
            console.log('error', err.toString());
            this.emit('end');
        })
        .pipe(gulp.dest(config.dist));
});

gulp.task('stylus', () => {
    return gulp.src(`${config.cssPath}/*.styl`)
        .pipe(stylus({
            use: [nib()]
        }))
        .pipe(autoprefixer({
            browsers: ['last 2 versions']
        }))
        .pipe(concat(`${config.name}.css`))
        .pipe(gulp.dest(config.dist))
        .pipe(connect.reload());
});

gulp.task('min-js', () => {
    return gulp.src(`${config.dist}/${config.name}.js`)
        .pipe(uglify())
        .pipe(rename(`${config.name}.min.js`))
        .pipe(gulp.dest(config.dist));
});

gulp.task('min-css', () => {
    return gulp.src(`${config.dist}/${config.name}.css`)
        .pipe(cssNano())
        .pipe(rename(`${config.name}.min.css`))
        .pipe(gulp.dest(config.dist));
});

gulp.task('build', () => {
    return runSequence('min-js', 'min-css');
});

gulp.task('watch', () => {
    watch(`${config.jsPath}/*.js`, () => {
        runSequence('js');
    });

    watch(`${config.cssPath}/*.styl`, () => {
        runSequence('stylus');
    });
});

gulp.task('default', ['server', 'watch', 'js', 'stylus']);

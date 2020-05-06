const gulp = require('gulp');
const sass = require('gulp-sass'); /* 编译scss */
const postcss = require('gulp-postcss'); /* postcss */
const autoprefixer = require('autoprefixer'); /* 自动添加前缀 */
const px2rem = require('postcss-px2rem'); /* px转rem */
const cssmin = require('gulp-cssmin'); /* 压缩css */
const babel = require('gulp-babel'); /* babel转es6 */
const jsmin = require('gulp-uglify'); /* 压缩js */
const rename = require('gulp-rename'); /* 重命名 */
const bs = require('browser-sync').create(); /* 热更新 */
const reload = bs.reload;
const fileinclude = require('gulp-file-include'); /* 合并html */
const clean = require('gulp-clean'); /* 清理文件插件 */
const plumber = require('gulp-plumber'); /* 防止编译出错跳出watch */
const watch = require('gulp-watch'); /* 监听新建文件 */

const assetRev = require('gulp-asset-rev');
const rev = require('gulp-rev');
const revCollector = require('gulp-rev-collector');
const runSequence = require('run-sequence'); /* gulp同步执行任务 */
const path = require('path');
/* 开发地址 */
const es = './src/assets/js/**/*.js';
const scss = './src/assets/scss/**/*.scss';
const html = './src/**/*.html';
const static = './src/static/**/*';
/* 打包地址 */
const css = './dist/assets/css';
const dist = './dist';
const js = './dist/assets/js';
// 替换资源版本号后的html
// var htmlrev = dist + '/view';
// var images = app + '/images/**/*.img';

// 开启本地服务器
gulp.task('serve', ['build'], function () {
    bs.init({
        server: './dist'
    })
    gulp.watch(scss, ['postcss']);
    gulp.watch(es, ['es6']);
    // watch(html, () => {
    //     gulp.start('fileinclude')
    // })
    gulp.watch(html, ['fileinclude'])
    gulp.watch(html).on('change', reload);
})

// 合并template模板
gulp.task('fileinclude', () => {
    return gulp.src(html)
        .pipe(plumber())
        .pipe(fileinclude({
            prefix: '@@',
        }))
        .pipe(gulp.dest(dist));
})

// 编译scss
gulp.task('postcss', () => {
    return gulp.src(scss)
        .pipe(plumber())
        .pipe(sass())
        .pipe(postcss([autoprefixer({
            browsers: ['last 2 versions'],
            cascade: true, //是否美化属性值 默认：true 像这样：
            //-webkit-transform: rotate(45deg);
            //        transform: rotate(45deg);
            remove: true //是否去掉不必要的前缀 默认：true
        })]))
        .pipe(cssmin())
        .pipe(rename({
            suffix: '.min'
        }))
        .pipe(gulp.dest(css))
        .pipe(reload({
            stream: true
        }))
});

// 编译es6
gulp.task('es6', () => {
    return gulp.src(es)
        .pipe(plumber())
        .pipe(babel({
            presets: ['es2015']
        }))
        .pipe(jsmin())
        .pipe(rename({
            suffix: '.min'
        }))
        .pipe(reload({
            stream: true
        }))
        .pipe(gulp.dest(js));
})
/* 移动静态资源 */
gulp.task('static', () => {
    return gulp.src(static)
        .pipe(gulp.dest(path.join(dist, '/static')));
})

/* 清空dist文件夹 */
gulp.task('clean', () => {
    return gulp.src(dist)
        .pipe(clean());
})
/* 打包编译 */
gulp.task('build', ['clean'], () => {
    gulp.start('postcss', 'es6', 'fileinclude', 'static');
})

//为css中引入的图片/字体等添加hash编码
gulp.task('assetRev', function () {
    return gulp.src(cssSrc) //该任务针对的文件
        .pipe(assetRev()) //该任务调用的模块
        .pipe(gulp.dest('src/css')); //编译后的路径
});
//CSS生成文件hash编码并生成 rev-manifest.json文件名对照映射
gulp.task('revCss', function () {
    return gulp.src('./build/css/*.css')
        .pipe(rev())
        .pipe(rev.manifest())
        .pipe(gulp.dest('./rev/css'));
});
//js生成文件hash编码并生成 rev-manifest.json文件名对照映射
gulp.task('revJs', function () {
    return gulp.src('./build/js/*.js')
        .pipe(rev())
        .pipe(rev.manifest())
        .pipe(gulp.dest('./rev/js'));
});
//Html替换css、js文件版本
gulp.task('revHtml', function () {
    return gulp.src(['./rev/**/*.json', html])
        .pipe(revCollector())
        .pipe(gulp.dest(htmlrev));
});

//开发构建
gulp.task('dist', function (done) {
    condition = false;
    runSequence( //需要说明的是，用gulp.run也可以实现以上所有任务的执行，只是gulp.run是最大限度的并行执行这些任务，而在添加版本号时需要串行执行（顺序执行）这些任务，故使用了runSequence.
        // ['assetRev'],
        // ['es6'],
        ['cssmin'],
        ['jsmin'],
        ['revCss'],
        ['revJs'],
        ['revHtml'],
        done);
});


gulp.task('default', ['serve']);
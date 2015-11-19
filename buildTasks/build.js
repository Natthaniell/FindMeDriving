module.exports = function (gulp, plugins) {
    /**
     * CSS task. Create css files from SASS/compass,
     * - build compass
     */
    gulp.task('compass', function() {
        var postcss      = require('gulp-postcss');
        var sourcemaps   = require('gulp-sourcemaps');
        var autoprefixer = require('autoprefixer');
        var csswring     = require('csswring');
        return gulp.src(['src/assets/scss/**/*.scss'])
            .pipe(sourcemaps.init())
            .pipe(plugins.compass({
                css: 'src/assets/css',
                sass: 'src/assets/scss'
            }))
            //.pipe(plugins.postcss([ autoprefixer({ browsers: ['> 90%'] }), csswring() ]))
            //.pipe(sourcemaps.write('.'))
            .pipe(gulp.dest('src/assets/css'))
            .pipe(plugins.reload({stream:true}));
    });



    // babel compiler
    gulp.task('typescript', function () {
        return gulp.src('./src/app/**/*.ts')
            .pipe(plugins.ts({
                noImplicitAny: true,
                module : 'amd'
            }))
            .pipe(plugins.ngAnnotate({
                remove: true,
                add: true,
                single_quotes: true
            }))
            .pipe(gulp.dest('./src/app/'));
    });

    // babel compiler
    gulp.task('babel', function () {
        return gulp.src('./src/app/**/*.js')
            //.pipe(plugins.babel({
            //    blacklist : ['strict']
            //}))

            .pipe(gulp.dest('./src/app/'));
    });
};
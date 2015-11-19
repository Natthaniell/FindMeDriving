module.exports = function (gulp, plugins) {

    gulp.task('browser-sync', function() {
        return plugins.browserSync({
            port : 3000
        });
    });


    // watch css file change
    gulp.task('watchCompass', function() {
        return gulp.watch('src/**/*.scss', ['compass']);
    });

    gulp.task('watchTypescriptExec', function(cb){
        return plugins.runSequence('typescript', 'babel', cb);
    })

    gulp.task('watchTypescript', function() {
        return gulp.watch('src/app/**/*.ts', ['watchTypescriptExec']);
    })
};
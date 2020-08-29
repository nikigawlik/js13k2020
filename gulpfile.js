const { src, dest } = require('gulp');
const webpack = require('webpack-stream');
const TerserPlugin = require('terser-webpack-plugin');

function defaultTask(cb) {
    // place code for your default task here

    src(['modules/**/*.js'])
        .pipe(webpack({
            // Any configuration options...
            output: {
                filename: 'bundle.js'
            },
            optimization: {
                minimizer: [
                    new TerserPlugin({
                        cache: true,
                        parallel: true,
                        sourceMap: true, // Must be set to true if using source-maps in production
                        terserOptions: {
                            // https://github.com/webpack-contrib/terser-webpack-plugin#terseroptions
                            ecma: 6,
                            warnings: true,
                            parse: {},
                            compress: {},
                            mangle: {
                                properties: 
                                false
                                // {
                                //     reserved: [], // for some reason webpack cant handle these exports
                                //     debug: false,
                                //     undeclared: true,
                                // }
                            }, // Note `mangle.properties` is `false` by default.
                            module: false,
                            output: null,
                            toplevel: false,
                            nameCache: null,
                            ie8: false,
                            keep_classnames: undefined,
                            keep_fnames: false,
                            safari10: false,
                        }
                    }),
                ],
            }
        }))
        .pipe(dest('build'))

    src(['index.html', 'style.css']).pipe(dest('build'))
    src(['images/**/*.png]']).pipe(dest('build/images'))

    cb();
}

exports.default = defaultTask
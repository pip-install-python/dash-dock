const path = require('path');
const webpack = require('webpack');
const WebpackDashDynamicImport = require('@plotly/webpack-dash-dynamic-import');
const packagejson = require('./package.json');

const dashLibraryName = packagejson.name.replace(/-/g, '_');

module.exports = (env, argv) => {
    let mode;

    const overrides = module.exports || {};

    // if user specified mode flag take that value
    if (argv && argv.mode) {
        mode = argv.mode;
    }
    // else if configuration object is already set (module.exports) use that value
    else if (overrides.mode) {
        mode = overrides.mode;
    }
    // else take webpack default (production)
    else {
        mode = 'production';
    }

    let filename = (overrides.output || {}).filename;
    if(!filename) {
        const modeSuffix = mode === 'development' ? 'dev' : 'min';
        filename = `${dashLibraryName}.${modeSuffix}.js`;
    }

    const entry = overrides.entry || {main: './src/lib/index.js'};

    const devtool = overrides.devtool || 'source-map';

    // Use a different external React depending on mode
    const reactExternals = mode === 'development'
        ? {
            react: 'React',
            'react-dom': 'ReactDOM',
            'react/jsx-runtime': 'jsxRuntime'
          }
        : {
            react: 'React',
            'react-dom': 'ReactDOM'
          };

    const externals = ('externals' in overrides)
        ? overrides.externals
        : ({
            ...reactExternals,
            'plotly.js': 'Plotly',
            'prop-types': 'PropTypes',
          });

    return {
        mode,
        entry,
        output: {
            path: path.resolve(__dirname, dashLibraryName),
            chunkFilename: '[name].js',
            filename,
            library: dashLibraryName,
            libraryTarget: 'window',
        },
        devtool,
        devServer: {
            static: {
                directory: path.join(__dirname, '/')
            }
        },
        externals,
        module: {
            rules: [
                {
                    test: /\.jsx?$/,
                    exclude: /node_modules/,
                    use: {
                        loader: 'babel-loader',
                        options: {
                            presets: [
                                ['@babel/preset-env', {
                                    targets: {
                                        browsers: ['last 2 versions', 'ie >= 11']
                                    }
                                }],
                                ['@babel/preset-react', {
                                    runtime: 'automatic'
                                }]
                            ],
                            plugins: [
                                '@babel/plugin-proposal-object-rest-spread'
                            ]
                        }
                    },
                },
                {
                    test: /\.tsx?$/,
                    exclude: /node_modules/,
                    use: 'ts-loader'
                },
                {
                    test: /\.css$/,
                    use: [
                        'style-loader',
                        'css-loader'
                    ],
                },
            ],
        },
        resolve: {
            extensions: ['.js', '.jsx', '.ts', '.tsx', '.json'],
            // Add alias to prevent circular dependencies
            alias: {
                'dash_dock': path.resolve(__dirname, 'src/lib'),
                // Create an alias for the jsx runtime to help with React 18
                'react/jsx-runtime': require.resolve('react/jsx-runtime')
            }
        },
        optimization: {
            splitChunks: {
                name: '[name].js',
                cacheGroups: {
                    async: {
                        chunks: 'async',
                        minSize: 0,
                        name(module, chunks, cacheGroupKey) {
                            return `${cacheGroupKey}-${chunks[0].name}`;
                        }
                    },
                    shared: {
                        chunks: 'all',
                        minSize: 0,
                        minChunks: 2,
                        name: 'dash_dock-shared'
                    }
                }
            }
        },
        plugins: [
            new WebpackDashDynamicImport(),
            new webpack.SourceMapDevToolPlugin({
                filename: '[file].map',
                exclude: ['async-plotlyjs']
            }),
            // Define React 18 compatibility flag
            new webpack.DefinePlugin({
                'process.env.NODE_ENV': JSON.stringify(mode),
                '__REACT_DEVTOOLS_GLOBAL_HOOK__': '({ isDisabled: true })',
                // Disable strict mode warnings in development
                'React.StrictMode': mode === 'development' ? 'false' : 'true'
            })
        ]
    };
};
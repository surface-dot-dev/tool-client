const webpack = require('webpack')
const path = require('path')

module.exports = {
    entry: './src/index.ts',
    output: {
        path: path.resolve(__dirname, 'dist/umd'),
        filename: 'surface-tool-client.js',
        library: {
            type: 'umd',
            name: 'surface-tool-client',
        },
    },
    module: {
        rules: [
            {
                test: /\.ts$/,
                loader: 'ts-loader',
                options: {
                    transpileOnly: true,
                },
            },
        ],
    },
    resolve: {
        extensions: ['.ts', '.js', '.json'],
    },
    plugins: [
        new webpack.DefinePlugin({
            process: 'process/browser',
        }),
    ],
}

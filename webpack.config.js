
let MiniCssExtractPlugin = require('mini-css-extract-plugin');
let webpack = require('webpack');

let mod = {
    rules: [
        {
          test: /\.(sa|sc|c)ss$/,
          use:  [
            MiniCssExtractPlugin.loader,
            { 
                loader: 'css-loader',
                options: { url: false } 
            },
            {  
                loader: 'postcss-loader', // Run post css actions
                options: {
                    plugins: function () { // post css plugins, can be exported to postcss.config.js
                        return [
                            require('precss'),
                            require('autoprefixer')
                        ];
                    }
                }
            },
            'sass-loader'
          ]
        },
        { 
            test: /\.js$/,
            exclude: /node_modules/,
            loader: "babel-loader" 
        }
    ],

}

let plug = [
      new MiniCssExtractPlugin({
        filename: '../css/[name].css',
      }),
      // https://stackoverflow.com/questions/28969861/managing-jquery-plugin-dependency-in-webpack
        new webpack.ProvidePlugin({
            jQuery: 'jquery',
            $: 'jquery',
            jquery: 'jquery',
            'window.jQuery': 'jquery',
        }),
]

module.exports = {
    output: {
        filename: '[name].js',
        path: '/home/eugen/github/papermerge-proj/papermerge/boss/static/boss/js/'
    },
    entry: {
        papermerge: [
            './src/js/app.js',
            './src/sass/app.scss',
        ]

    },
    module: mod,
    plugins: plug,
    resolve: {
        // I got this from here
        // https://stackoverflow.com/questions/28969861/managing-jquery-plugin-dependency-in-webpack
        alias: {
            'bootstrap-select-dropdown': "bootstrap-select-dropdown/src/js/bootstrap-select-dropdown"
        }
    }
}



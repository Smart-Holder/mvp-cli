
// const path = require('path');

const webpack = require('webpack');
const tools = require('webpkit/tools');

tools.module.rules[0].exclude = /((typeof|_bigint)\.js)|node_modules/;
tools.module.rules[0].use = { loader: 'ts-loader' };
// webpack.module.rules[1].exclude = /mvp-ser/;
// webpack.module.rules[1].include.push(path.resolve('./deps/mvp-ser/src/models'));

tools.plugins.push(new webpack.DefinePlugin({ 'process.env.WALLET': `"${process.env.WALLET}"` }));

module.exports = tools;

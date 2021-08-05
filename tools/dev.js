
// const path = require('path');

const webpack = require('webpkit/tools');

webpack.module.rules[0].exclude = /((typeof|_bigint)\.js)|node_modules/;
webpack.module.rules[0].use = { loader: 'ts-loader' };
// webpack.module.rules[1].exclude = /mvp-ser/;
// webpack.module.rules[1].include.push(path.resolve('./deps/mvp-ser/src/models'));

module.exports = webpack;

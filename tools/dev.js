

const cfg = require('webpkit/tools/cfg');

cfg.env = {
	NODE_ENV: `"${cfg.NODE_ENV}"`,
	WALLET: !!process.env.WALLET,
};

const tools = require('webpkit/tools');

tools.module.rules[0].exclude = /((typeof|_bigint)\.js)|node_modules/;
tools.module.rules[0].use = { loader: 'ts-loader' };
// webpack.module.rules[1].exclude = /mvp-ser/;
// webpack.module.rules[1].include.push(path.resolve('./deps/mvp-ser/src/models'));

module.exports = tools;
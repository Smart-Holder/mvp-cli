
var deploy = {
	ERC721: '0xFA6dFa64cEC3401106a9F75bD57a2F484B47e72c',
	ERC721Proxy: '0xb801fe5300eAEF8bf21BBD9F76f0d04C4B240923',
};

try {
	var deploy_build = require('./deps/mvp-sol/out/deploy_pub.json');
} catch(err) {}

module.exports = {
	sdk: 'http://192.168.1.100:8001/service-api',
	prefixer: 'http://hash-release.stars-mine.com/v2',
	platform: 'eth',
	contracts: {
		...deploy, ...deploy_build,
		...deploy,
	},
}

var ERC721Proxy = artifacts.require("ERC721Proxy.sol");
var ERC721 = artifacts.require("ERC721.sol");
var pkg = require('../package.json');

const { deployProxy, upgradeProxy, prepareUpgrade } = require('@openzeppelin/truffle-upgrades');

const fs = require('fs');
const cached = `${process.env.HOME || '/tmp'}/.${pkg.name}`;

async function upgradeDeploy(name, Contract, args, opts) {
	var caches = {};
	var deployer = opts.deployer;

	if (fs.existsSync(cached)) {
		try {
			caches = JSON.parse(fs.readFileSync(cached, 'utf-8'));
		} catch(err) {}
	}

	var pub, cache = caches[name];

	if (cache && cache.address) {
		pub = new Contract(cache.address);
		pub.cached = true;

		if (cache.impl == await prepareUpgrade(pub.address, Contract, {deployer})) // 获取实现 impl
			return pub;
	}

	if (!pub)
		// 部署外部上下文,这个协约由`truffle-upgrades`自动自成
		// 调用此协约方法时会间接调用实现`impl`的方法，并且使用当前协约上下文
		pub = await deployProxy(Contract, args, opts);

	await upgradeProxy(pub.address, Contract, {deployer}); // 部署实现 impl

	caches[name] = {
		address: pub.address, impl: await prepareUpgrade(pub.address, Contract, {deployer}),
	};
	fs.writeFileSync(cached, JSON.stringify(caches, null, 2));

	return pub;
}

async function deploy(deployer, name, Contract, args, opts) {
	if (process.env.UPGRADE == 'true') { // 使用升级方式部署协约
		return upgradeDeploy(name, Contract, args, opts);
	} else { // 使用普通方式部署协约每次部署协约地址都会发生改变
		await deployer.deploy(Contract, args, opts);
		return Contract;
	}
}

module.exports = async function(deployer, networks, accounts) {
	// var team = accounts[0];

	// https://docs.openzeppelin.com/upgrades-plugins/1.x/faq#why-cant-i-use-custom-types
	opts = { deployer, initializer: 'initialize', unsafeAllowCustomTypes: true };
	// TODO: check storage layout
	var erc721_proxy = await deploy(deployer, 'ERC721Proxy', ERC721Proxy, [], opts);
	var erc721 = await deploy(deployer, 'ERC721', ERC721, [], opts);

	console.log("erc721_proxy:", erc721_proxy.address);
	console.log("erc721      :", erc721.address);
};
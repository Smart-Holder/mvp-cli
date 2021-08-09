#!/usr/bin/env node

var path = require('path');
var fs2 = require('somes/fs2');

var out = path.resolve(`${__dirname}/../out`);
var truffle_out = path.resolve(`${out}/truffle`);
var abi_out = path.resolve(`${out}/abi`);

var abis = fs2.readdirSync(truffle_out).filter(e=>path.extname(e)=='.json');

fs2.mkdirpSync(abi_out);

abis.forEach(function(abi_path, j) {
	// var name = abi_path.substring(abi_path.lastIndexOf('_') + 1, abi_path.length - 4);
	var abi_str = fs2.readFileSync(`${truffle_out}/${abi_path}`, 'utf-8');
	var {contractName,abi,bytecode} = JSON.parse(abi_str);
	var json = { contractName, abi };
	fs2.writeFileSync(`${abi_out}/${contractName}.json`, JSON.stringify(json, null, 2));
	// fs2.writeFileSync(`${abi_out}/${name}.bin`, bytecode);
});
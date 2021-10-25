
import storage from 'somes/storage';
import buffer, {IBuffer} from 'somes/buffer';
import {Signer} from 'somes/request';
import { sha256 } from 'somes/hash';
import somes from 'somes';
import chain from './chain';
import hash from 'somes/hash';

const crypto_tx = require('crypto-tx');

var _PrivateKey: IBuffer | null = null;

export async function genPrivateKey() {
	if (!_PrivateKey) {
		var from = await chain.getDefaultAccount();
		var key = '__as1ahaasr_' + from;
		if (storage.has(key)) {
			_PrivateKey = buffer.from(storage.get(key), 'base64');
		} else {
			// var mask = chain.metaMask;
			// var r = await mask.request({
			// 	method: 'personal_sign',
			// 	params: [
			// 		'0x' + buffer.from('Login to wallet').toString('hex'),
			// 		from,
			// 	],
			// });
			// _PrivateKey = hash.sha256(r);
			_PrivateKey = hash.sha256(key + 'a1048d9bb6a4e985342b240b5dd63176b27f1bac62fa268699ea6b55f9ff301a');

			storage.set(key, _PrivateKey.toString('base64'));
		}
	}
}

function privateKey() {
	somes.assert(_PrivateKey, 'not init call genPrivateKey()');
	return _PrivateKey as IBuffer;
}

export function publicKey() {
	return '0x' + crypto_tx.getPublic( privateKey(), true).toString('hex');
}

export function address() {
	return crypto_tx.getAddress(privateKey()) as string;
}

export function authName() {
	return somes.hash(address());
}

export function sign(msg: IBuffer) {
	var signature = crypto_tx.sign(msg, privateKey());
	return {
		signature: buffer.from(signature.signature), 
		recovery: signature.recovery as number,
	};
}

export class SDKSigner implements Signer {

	private _authName: string;

	constructor() {
		this._authName = authName();
	}

	sign(path: string, data: string) {
		var st = Date.now();
		var key = "a4dd53f2fefde37c07ac4824cf7085439633e1a357daacc3aaa16418275a9e40";
		var msg = (data) + st + key;
		var hash = sha256(msg);

		var signature = sign(hash);
		var sign_ = buffer.concat([signature.signature, [signature.recovery]]).toString('base64');

		return {
			st: String(st),
			sign: sign_,
			'auth-name': this._authName,
		};
	}
}


import storage from 'somes/storage';
import buffer, {IBuffer} from 'somes/buffer';
import {Signer} from 'somes/request';
import { sha256 } from 'somes/hash';
import somes from 'somes';

const crypto_tx = require('crypto-tx');

var _PrivateKey: IBuffer | null = null;

function privateKey() {
	if (!_PrivateKey) {
		if (storage.has('__as1ahaasr')) {
			_PrivateKey = buffer.from(storage.get('__as1ahaasr'), 'base64')
		} else {
			_PrivateKey = buffer.from(crypto_tx.genPrivateKey());
			storage.set('__as1ahaasr', _PrivateKey.toString('base64'));
		}	
	}
	return _PrivateKey;
}

export function publicKey() {
	return '0x' + crypto_tx.getPublic(privateKey(), true).toString('hex');
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

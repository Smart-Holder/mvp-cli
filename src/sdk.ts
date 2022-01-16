
import * as config from '../config';
import Store from 'somes/store';
import { make } from 'webpkit/lib/store';
import chain from './chain';
import { Signer } from 'somes/request';
import { sha256 } from 'somes/hash';
import buffer, { IBuffer } from 'somes/buffer';
import storage from 'somes/storage';
import hash from 'somes/hash';
import somes from 'somes';
import { Signature } from 'web3z';
import { setDeviceSigner } from './models/device';

export const store = new Store('mvp/cli');

const crypto_tx = require('crypto-tx');

var _PrivateKey: IBuffer | null = null;
var _AuthName: string = '';

var USE_WALLET_SIGN_PRIVATE_KEY = false;

async function genPrivateKey() {
	console.log(_PrivateKey?.toString('hex'), "_PrivateKey");

	if (!_PrivateKey) {
		var from = await chain.defaultAccount();
		var key = '__as1ahaasr_' + from;

		if (await storage.has(key)) {
			_PrivateKey = buffer.from(await storage.get(key), 'base64');
		}
		else if (USE_WALLET_SIGN_PRIVATE_KEY) {
			var mask = chain.metaMask;
			var r = await mask.request({
				method: 'personal_sign',
				params: ['0x' + buffer.from('Login to wallet').toString('hex'), from],
			});
			_PrivateKey = hash.sha256(r);
			storage.set(key, _PrivateKey.toString('base64'));
		}
		else { // 这个随机key不安全
			_PrivateKey = hash.sha256(key + 'a1048d9bb6a4e985342b240b5dd63176b27f1bac62fa268699ea6b55f9ff301a');
			storage.set(key, _PrivateKey.toString('base64'));
		}
	}
}

function privateKey() {
	somes.assert(_PrivateKey, 'not init call genPrivateKey()');
	return _PrivateKey as IBuffer;
}

function publicKey() {
	return '0x' + crypto_tx.getPublic(privateKey(), true).toString('hex');
}

function address() {
	return crypto_tx.getAddress(privateKey()) as string;
}

export function authName() {
	return _AuthName || somes.hash(address());
}

function sign(msg: IBuffer, priv?: IBuffer): Signature {
	var signature = crypto_tx.sign(msg, priv || privateKey());
	return {
		signature: buffer.from(signature.signature),
		recovery: signature.recovery as number,
	};
}

export function setPrivateKey(priv: IBuffer, authName?: string) {
	_PrivateKey = priv;
	_AuthName = authName || '';
}

export class SDKSigner implements Signer {
	authName() { return authName() }
	privateKey() { return privateKey() }

	sign(path: string, data: string) {
		var st = Date.now();
		var key = "a4dd53f2fefde37c07ac4824cf7085439633e1a357daacc3aaa16418275a9e40";
		var msg = (data) + st + key;
		var hash = sha256(msg);

		var signature = sign(hash, this.privateKey());
		var sign_ = buffer.concat([signature.signature, [signature.recovery]]).toString('base64');

		return {
			st: String(st),
			sign: sign_,
			'auth-name': this.authName(),
		};
	}
}

export async function initialize() {
	await genPrivateKey();
	await make({ url: config.sdk, store, signer: new SDKSigner() });
	// 使用随机生成的中心账号做为 `device signer`
	setDeviceSigner({
		async availableOwner() { return address() },
		async availablePublicKey() { return publicKey() },
		async signFrom(target: string, msg: IBuffer) { return sign(msg) },
	});

	var user = await store.core.user.methods.authUser();
	if (!user) {
		await store.core.user.methods.register({ name: authName(), key: publicKey(), ref: await chain.defaultAccount() });
	}
	console.log('auth.user', user);
}

export default store.core;
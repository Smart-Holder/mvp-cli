
import { SDKSigner, writePrivateKey } from '../src/key';
import storage from 'somes/storage';
import buffer, {IBuffer} from 'somes/buffer';
import errno from 'somes/errno';
import { Root, Nav } from 'webpkit/mobile';
import hash from 'somes/hash';
import somes from 'somes';
import {WSConversation} from 'somes/ws/conv';
import sdk, {store} from './sdk';

const crypto_tx = require('crypto-tx');

export interface LoginState {
	name: string;
	key: string;
	priv?: string;
}

function privateKey(state: LoginState) {
	somes.assert(state.priv, 'not privateKey');
	var priv = state.priv as string;
	return buffer.from(priv.slice(2), 'hex');
}

function useTouristState() {
	var priv = buffer.from(crypto_tx.genPrivateKey());
	writePrivateKey(priv, 'tourist'); // tourist user
	return {
		name: 'tourist',
		key: '0x' + crypto_tx.getPublic(priv, true).toString('hex'),
	};
}

var _LoginState: LoginState = useTouristState(); // current login state

export function logout() {
	useTouristState(); // tourist user
	storage.delete('loginState');
	var nav = Root.current.refs.nav as Nav;
	nav.replace('/login', false, 0); // to login page
	if (store.conv) {
		store.conv.autoReconnect = 3e4;
	}
}

export async function login(state: LoginState) {
	writePrivateKey(privateKey(state), state.name);
	await storage.set('loginState', state);
	state.priv = undefined;
	_LoginState = state;
	if (store.conv) {
		store.conv.autoReconnect = 50;
		store.conv.connect();
	}
}

export async function test(state: LoginState) { // test access permission

	class MySigner extends SDKSigner {
		private _state: LoginState;
		authName() { return this._state.name }
		privateKey() { return privateKey(this._state) }
		constructor(state: LoginState) {
			super();
			this._state = state;
		}
	}

	try {
		await sdk.user.methods.devices({}, {signer: new MySigner(state)}); // check access
	} catch(err: any) { // ILLEGAL ACCESS
		if (err.errno == errno.ERR_ILLEGAL_ACCESS[0]) {
			return false;
		}
		throw err;
	}
	return true;
}

export async function exists(name: string) { // is user exists
	!!await sdk.user.methods.authUser({}, {headers: { 'auth-name': name }});
}

export function genLoginState(name: string, pwd: string) {
	var priv = hash.sha256(name + pwd + 'a1048d9bb6a4e985342b240b5dd63176b27f1bac62fa268699eccd55f9ff301a');
	return {
		name: name,
		priv: '0x' + priv.toString('hex'),
		key: '0x' + crypto_tx.getPublic(priv, true).toString('hex'),
	};
}

export async function check() {
	var state = await storage.get('loginState') as LoginState;
	if (!state || !await test(state)) { // login ok
		await somes.sleep(1e2);
		return logout();
	}
	await login(state);
}
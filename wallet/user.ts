
import storage from 'somes/storage';
import buffer, {IBuffer} from 'somes/buffer';
import errno from 'somes/errno';
import { Root, Nav } from 'webpkit/mobile';
import hash from 'somes/hash';
import somes from 'somes';
import sdk, {store} from './sdk';
import {SDKSigner,setPrivateKey} from '../src/sdk';

const crypto_tx = require('crypto-tx');

export const IS_USE_SESSION_AUTH = true; // use session auth

export interface LoginState {
	name: string;
	key: string;
	priv?: string;
}

class MySigner extends SDKSigner {
	private _state: LoginState;
	authName() { return this._state.name }
	privateKey() { return privateKey(this._state) }
	constructor(state: LoginState) {
		super();
		this._state = state;
	}
}

function privateKey(state: LoginState) {
	somes.assert(state.priv, 'not privateKey');
	var priv = state.priv as string;
	return buffer.from(priv.slice(2), 'hex');
}

function useTouristState() {
	var priv = buffer.from(crypto_tx.genPrivateKey());
	setPrivateKey(priv, 'tourist'); // tourist user
	return {
		name: 'tourist',
		key: '0x' + crypto_tx.getPublic(priv, true).toString('hex'),
	};
}

var _LoginState: LoginState = useTouristState(); // current login state

async function useLoginState(state: LoginState) {
	setPrivateKey(privateKey(state), state.name);
	await storage.set('loginState', state);
	state.priv = undefined;
	_LoginState = state;
	if (store.conv) {
		store.conv.autoReconnect = 50;
		store.conv.connect();
	}
}

async function tryLogin(state: LoginState, key2?: string, ref?: string) { // test access permission
	try {
		await sdk.user.methods.setUser({ key2, ref }, {signer: new MySigner(state)}); // check access and set key2
	} catch(err: any) { // ILLEGAL ACCESS
		if (err.errno == errno.ERR_ILLEGAL_ACCESS[0]) {
			return false;
		}
		throw err;
	}
	return true;
}

function genLoginState(name: string, pwd: string) {
	var priv = hash.sha256(name + pwd + 'a1048d9bb6a4e985342b240b5dd63176b27f1bac62fa268699ea6b55f9ff301a');
	// a1048d9bb6a4e985342b240b5dd63176b27f1bac62fa268699eccd55f9ff301a new
	// a1048d9bb6a4e985342b240b5dd63176b27f1bac62fa268699ea6b55f9ff301a old
	console.log(priv.toString('base64'), '0x' + priv.toString('hex'));
	
	return {
		name: name,
		priv: '0x' + priv.toString('hex'),
		key: '0x' + crypto_tx.getPublic(priv, true).toString('hex'),
	};
}

export function loginState() {
	return _LoginState;
}

export function logout() {
	useTouristState(); // tourist user
	storage.delete('loginState');
	var nav = Root.current.refs.nav as Nav;
	nav.replace('/login', false, 0); // to login page
	if (store.conv) {
		store.conv.autoReconnect = 3e4;
	}
}

export const sendPhoneVerify = async (phone:string) => {
	return sdk.user.methods.sendPhoneVerify({phone});
}

export async function login(name: string, {verify,pwd,ref}: {verify?: string, pwd?: string, ref?: string}) {
	if (verify) {
		var priv2 = buffer.from(crypto_tx.genPrivateKey()); // random gen session key
		var key2 = '0x' + crypto_tx.getPublic(priv2, true).toString('hex');
		await sdk.user.methods.loginFromPhone({ phone: name, verify, key2, ref }); // 验证码登录只能使用key2临时会话
		await useLoginState({ name, key: key2, priv: '0x' + priv2.toString('hex') });
	} else {
		somes.assert(pwd, 'PWD cannot be empty');
		var state = genLoginState(name, pwd as string);
		if (IS_USE_SESSION_AUTH) {
			var priv2 = buffer.from(crypto_tx.genPrivateKey()); // random gen session key
			var key2 = '0x' + crypto_tx.getPublic(priv2, true).toString('hex');
			await tryLogin(state, key2, ref);
			state.priv = '0x' + priv2.toString('hex');
			state.key = key2; // use key2 as session, 这里使用临时key2来进行会话授权
		} else {
			await tryLogin(state, undefined, ref); // 使用密码pkey授权访问,可能存在安全问题
		}
		await useLoginState(state);
	}
}

export async function register(name: string, pwd: string, verify: string, ref?: string) {
	var state = genLoginState(name, pwd);
	await sdk.user.methods.registerFromPhone({phone:name, pkey: state.key, verify});
	await login(name, {pwd,ref}); // is login ?
}

export async function changePwd(name: string, pwd: string) {
	var state = genLoginState(name, pwd);
	await sdk.user.methods.setUser({ pkey: state.key });
	await login(name, { pwd });
}

export async function setRef(ref: string) { // 用来关联当前会话用户,能否收到与ref相关的消息,在切换钱包地址时建议设置该值
	await sdk.user.methods.setUser({ ref });
}

export async function exists(name: string) { // is user exists
	!!await sdk.user.methods.authUser({}, {headers: { 'auth-name': name }});
}

export async function check() {
	var state = await storage.get('loginState') as LoginState;
	if (!state || !await tryLogin(state)) { // login ok
		await somes.sleep(1e2);
		return logout();
	}
	await useLoginState(state);
}
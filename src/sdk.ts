
import * as config from '../config';
import Store from 'somes/store';
import { make } from 'webpkit/lib/store';
import { SDKSigner, authName, publicKey, genPrivateKey } from './key';
import chain from './chain';

export const store = new Store('mvp/cli');

export async function initialize(address?:string) {
	await genPrivateKey(address);
	await make({ url: config.sdk, store, signer: new SDKSigner() });
	var user = await store.core.user.methods.authUser();
	if (!user) {
		await store.core.user.methods.register({ name: authName(), key: publicKey(), ref: await chain.defaultAccount() });
	}
	console.log('auth.user', user);
}

export default store.core;
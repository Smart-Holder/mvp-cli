
import * as config from '../config';
import Store from 'somes/store';
import { make } from 'webpkit/lib/store';
import { SDKSigner, authName, publicKey, genPrivateKey } from './key';

export const store = new Store('mvp/cli');

export async function initialize() {
	await genPrivateKey();
	await make({ url: config.sdk, store, signer: new SDKSigner() });
	var user = await store.core.user.methods.authUser();
	if (!user) {
		await store.core.user.methods.register({ name: authName(), key: publicKey() });
	}
	console.log('auth.user', user);
}

export default store.core;
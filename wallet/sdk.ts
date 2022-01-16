
import * as config from '../config';
import { make } from 'webpkit/lib/store';
import {check} from './user';
import {setSigner, DeviceSigner} from '../src/models/device';

import {store,SDKSigner} from '../src/sdk';

export {store};

export async function initialize(signer: DeviceSigner) {
	await make({ url: config.sdk, store, signer: new SDKSigner() });
	setSigner(signer); // set device signer
	check(); // check login state
}

export default store.core;
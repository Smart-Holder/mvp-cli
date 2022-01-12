
import * as config from '../config';
import { make } from 'webpkit/lib/store';
import { SDKSigner } from '../src/key';
import {check} from './user';

import {store} from '../src/sdk';

export {store};

export async function initialize() {
	await make({ url: config.sdk, store, signer: new SDKSigner() });
	check(); // check login state
}

export default store.core;
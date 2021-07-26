
import * as config from '../config';
import Store from 'somes/store';
import {make} from 'webpkit/lib/store';

export const store = new Store('mvp/cli');

export function initialize() {
	return make({ url: config.sdk, store });
}

export default store.core;
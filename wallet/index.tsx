/* ***** BEGIN LICENSE BLOCK *****
 * Distributed under the BSD license:
 *
 * Copyright (c) 2019, hardchain
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 *     * Redistributions of source code must retain the above copyright
 *       notice, this list of conditions and the following disclaimer.
 *     * Redistributions in binary form must reproduce the above copyright
 *       notice, this list of conditions and the following disclaimer in the
 *       documentation and/or other materials provided with the distribution.
 *     * Neither the name of hardchain nor the
 *       names of its contributors may be used to endorse or promote products
 *       derived from this software without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
 * ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
 * WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL hardchain BE LIABLE FOR ANY
 * DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
 * (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
 * LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
 * ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
 * SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 *
 * ***** END LICENSE BLOCK ***** */

import { React, Root, ReactDom, Nav, dialog } from 'webpkit/mobile';
import _404 from '../src/pages/404';
import routes from './router';
import '../src/css/util.scss';
import '../src/index.css';
import { initialize } from './sdk';
import { initialize as initializeChain } from './chain';
import utils from 'somes';
import errnoHandles from '../src/handle';
import 'antd-mobile/dist/antd-mobile.css'
import * as moment from 'moment';
import wallet from './wallet_ui';
import { Tab } from './util/tools';

import storage from 'somes/storage';
import { LoginState, privateKey } from './user';
import { writePrivateKey } from '../src/key';
import { setPrivateKey } from '../src/sdk';

utils.onUncaughtException.on((e) => {
	console.log(e.data.message);
	if (e.data.message == 'ResizeObserver loop limit exceeded') return false;
	errnoHandles(e.data);
});

utils.onUnhandledRejection.on((e) => {
	errnoHandles(e.data.reason);
});

Nav.platform = '_mini_app';
moment.locale(navigator.language || 'zh-cn');

export class MyRoot<P> extends Root<P> {

	isHashRoutes = false;

	async triggerLoad() {
		await super.triggerLoad();
		try {
			var state = await storage.get('loginState') as LoginState;
			if (state) setPrivateKey(privateKey(state), state.name);
			await initialize(wallet);
		} catch (err: any) {
			dialog.alert(err.message);
			throw err;
		}
	}

	private _nav = () => {
		return this.refs.nav as any;
	}

	renderTools() {
		let pathname = location.pathname;
		// login
		// safety_tips
		// create_account
		// secretkey
		// import_secret_key
		// register
		// console.log(['/login', '/safety_tips', '/create_account', '/secretkey', '/import_secret_key', '/register',].includes(pathname), pathname);

		return pathname.startsWith('/account') || pathname.startsWith('/home') ? <Tab nav={this._nav} /> : '';
	}
}

initializeChain(wallet).then(() => {
	ReactDom.render(<MyRoot routes={routes} notFound={_404} />, document.querySelector('#app'));
	if (process.env.NODE_ENV == 'development') {
		import('../test/test');
	}
});
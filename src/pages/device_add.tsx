
import { React } from 'webpkit/mobile';
import NavPage from '../nav';
import Header from '../util/header';
import '../css/device_nft.scss';
import * as device from '../models/device';
import {alert} from 'webpkit/lib/dialog';
import {URL} from 'somes/path';

const crypto_tx = require('crypto-tx');

export default class extends NavPage<{a?: string; c?: string; v?: string;}> {

	title = '添加设备';

	_back() {
		if (this.nav.length > 1) {
			this.popPage();
		} else {
			this.replacePage('/device');
			// globalThis.close(); // close window
		}
	}

	async _AddDevice(target: string, code: string, check?: string) {
		try {
			await device.bind(target, code, check);
			alert('绑定设备成功', ()=>this._back());
		} catch(err) {
			alert(err.message, ()=>this._back());
		}
	}

	async triggerLoad() {
		if (this.params.a && this.params.c && this.params.v) {
			await this._AddDevice(crypto_tx.checksumAddress(this.params.a), this.params.c, this.params.v);
		} else {
			alert('请使用钱包扫码功能扫描设备屏幕二维码', ()=>this._back());
		}
	}

	render() {
		return (
			<div className="device_nft">
				<Header title="添加设备" page={this} />
				<div className="bind">绑定设备中...</div>
			</div>
		);
	}

}
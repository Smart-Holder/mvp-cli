
import { React } from 'webpkit/mobile';
import NavPage from '../nav';
import Header from '../util/header';
import '../css/device_nft.scss';
import * as device from '../models/device';
import {alert} from 'webpkit/lib/dialog';

export default class extends NavPage<{a?: string; c?: string}> {

	title = '添加设备';

	_back() {
		if (this.nav.length > 1) {
			this.popPage();
		} else {
			globalThis.close(); // close window
		}
	}

	async _AddDevice(target: string, code: string) {
		try {
			await device.bind(target, code);
			alert('绑定设备成功', ()=>this._back());
		} catch(err) {
			alert(err.message, ()=>this._back());
		}
	}

	async triggerLoad() {
		if (this.params.a && this.params.c) {
			await this._AddDevice(this.params.a, this.params.c);
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
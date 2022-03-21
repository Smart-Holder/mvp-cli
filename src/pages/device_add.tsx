
import { React } from 'webpkit/mobile';
import NavPage from '../nav';
import '../css/device_nft.scss';
import * as device from '../models/device';
// import { alert } from 'webpkit/lib/dialog';
import { alert } from '../util/tools'
import { Spin } from 'antd';
import { withTranslation } from 'react-i18next';

const crypto_tx = require('crypto-tx');

class DeviceAdd extends NavPage<{ a?: string; c?: string; v?: string; }> {

	title = '添加设备';

	_back() {
		if (this.nav.length > 1) {
			this.popPage();
		} else {
			this.replacePage('/device');
		}
	}

	async _AddDevice(target: string, code: string, check?: string) {
		const { t } = this;

		try {
			await device.bind(target, code, check);
			alert(t('绑定设备成功'), () => this._back());
		} catch (err: any) {
			alert(err.message, () => this._back());
		}
	}

	async triggerLoad() {
		const { t } = this;

		if (this.params.a && this.params.c && this.params.v) {
			await this._AddDevice(crypto_tx.checksumAddress(this.params.a), this.params.c, this.params.v);
		} else {
			alert(t('请使用钱包扫码功能扫描设备屏幕二维码'), () => this._back());
		}
	}



	render() {
		const { t } = this;
		return (
			<div className="device_nft">
				{/* <Header title="添加设备" page={this} /> */}
				{/* <div className="bind">绑定设备中...</div> */}
				<div className="loading_box">
					<Spin delay={500} className="device_list_loading" spinning={true} tip={t('绑定设备中') + '...'} />
				</div>

			</div>
		);
	}

}

export default withTranslation('translations', { withRef: true })(DeviceAdd);

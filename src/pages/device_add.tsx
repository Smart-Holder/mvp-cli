
import { React } from 'webpkit/mobile';
import NavPage from '../nav';
import '../css/device_nft.scss';
import * as device from '../models/device';
// import { alert } from 'webpkit/lib/dialog';
import { alert, confirm, getParams, } from '../util/tools'
import { Spin } from 'antd';
import { withTranslation } from 'react-i18next';
import { bindDevice, bind, deviceActivation, checkBindDeviceStatus, getDeviceInfoByAddress } from '../models/device';

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

	async _AddDevice() {
		// https://mvp-dev.stars-mine.com/device_add?a=0xD1eE3D79f46354807Eaa18a4242270f931500fdd&c=4627&v=EWC1wsYbkB65QJ&n=3860
		const { t } = this;
		// let href = 'https://mvp-dev.stars-mine.com/device_add?a=0xD1eE3D79f46354807Eaa18a4242270f931500fdd&c=1297&v=EWC1wsYbkB65QJ&n=387';
		let href = window.location.href;

		try {
			// await device.bind(target, code, check);
			await this.newBindDevice(href);
			alert(t('绑定设备成功'), () => this._back());
		} catch (err: any) {
			alert(err.message, () => this._back());
		}
	}

	async bind_device(href: string, resolve: (value: unknown) => void, reject: (reason?: any) => void) {

		let { a, c, v, n = 0 } = getParams(href);
		let { t } = this;

		return new Promise(async () => {

			try {
				if (!a) {
					// alert("请扫描设备绑定二维码!");
					throw Error('请扫描设备绑定二维码!');
				}
				Number(n) < 386 ? await bind(crypto_tx.checksumAddress(a), c, v) : await bindDevice(a, c, v);
				// if (isActivation && Number(n) < 316) {
				// 	await deviceActivation({ address: a });
				// }

				if (Number(n) < 386) return resolve('');

				let index = 0;
				let dsq_id = setInterval(async () => {
					try {
						let data = await checkBindDeviceStatus(a);
						index++;
						if (index >= 5) {
							clearInterval(dsq_id);
							reject({ message: t('设备绑定失败超时') });
							// alert('设备绑定失败超时');
						}
						if (!data) {
							clearInterval(dsq_id);
							resolve('');
						} else if (data == 3) {
							// reject(data);
							clearInterval(dsq_id);
							// alert('绑定失败,绑定二维码过期');
							reject({ message: t('绑定失败,绑定二维码过期') });
						}
					} catch (error) {
						clearInterval(dsq_id);
						reject(error);
					}
				}, 1000);
			} catch (error) {
				reject(error);
			}
		});

	}

	// 绑定设备设置当前钱包
	async newBindDevice(href: string) {
		let { a } = getParams(href);
		let { t } = this;
		let data = await getDeviceInfoByAddress({ address: a });
		return new Promise(async (resolve, reject) => {
			try {
				if (data?.activation) {
					await this.bind_device(href, resolve, reject);
				} else {
					confirm({
						title: t('绑定提示'),
						text: t('首次绑定设备后将不支持退换，确定绑定设备？')
					}, async (isOk) => {
						if (!isOk) {
							this._back();
							reject({});
							return;
						};
						// 激活绑定
						await this.bind_device(href, resolve, reject);

						// resolve('');
					});
				}
			} catch (error) {
				reject(error);
			}
		});

	}

	async triggerLoad() {
		const { t } = this;

		if (this.params.a && this.params.c && this.params.v) {
			// await this._AddDevice(crypto_tx.checksumAddress(this.params.a), this.params.c, this.params.v);
			await this._AddDevice();
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

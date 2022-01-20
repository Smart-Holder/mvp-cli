
import { React } from 'webpkit/mobile';
import NavPage from '../nav';
import { Device, NFT } from '../models';
import { encodeParameters } from '../chain';
import { devices, setDeviceSigner } from '../models/device';
import { Spin } from 'antd';
import { DeviceItem } from '../components/deviceItem';
import IconFont from '../components/icon_font';
// import { changeLanguage } from '../util/i18next';
import { withTranslation } from 'react-i18next';
import '../css/index.scss';
import native from '../../wallet/native';
import wallet from '../../wallet/wallet_ui';
import "../../wallet/util/wallet_ui.scss";
import * as config from '../../config';
import { getParams } from '../../wallet/util/tools';
import * as device from '../models/device';
import { alert } from 'webpkit/lib/dialog';

const crypto_tx = require('crypto-tx');

// const { t } = Translation(); //把使用方法结构
type ICarouselType = 'imToken' | 'TokenPocket' | 'MateMask';



class DeviceList extends NavPage<{ address?: string, keyName?: string }> {

	title = '我的NFT';

	_NftAdd = () => {
		this.pushPage('/nft_add');
	}

	_NftDetails(e: NFT) {
		this.pushPage({ url: `/nft_details`, params: { id: e.id } });
	}

	state = {
		nft: [] as NFT[], device: [] as Device[], loading: true, visible: false, carouselType: 'MateMask' as ICarouselType,
		keysName: [] as string[],
		currKey: ''
	};

	async triggerLoad() {
		// await initialize();
		var hex = encodeParameters(['address'], ['0xc2C09aABe77B718DA3f3050D0FDfe80D308Ea391']);
		console.log(hex);

		let keysName = await native.getKeysName() || [];
		this.setState({ keysName });
		this.getDeviceList();
	}

	async triggerShow() {
		// await check(); // check login state
		this.getDeviceList();
	}

	async getDeviceList() {
		let { address } = this.params;
		let device = await devices();
		if (address) device = device.filter((item) => item.owner === address);
		this.setState({ device, loading: false });
	}

	// 添加设备
	async addDevice() {


		// let carouselType = '';
		// let userAgent = navigator.userAgent
		// // if ()
		// if (userAgent.includes('imToken')) {
		// 	carouselType = 'imToken';
		// } else if (userAgent.includes('TokenPocket')) {
		// 	carouselType = 'TokenPocket';

		// 	tp.invokeQRScanner().then((href: string) => {
		// 		if (href.startsWith('http')) location.href = href;
		// 	});
		// 	return
		// } else {
		// 	carouselType = 'MateMask';
		// }
		// this.setState({ visible: true, carouselType });
		let data = this.params.keyName || (await wallet.selectCurrentKey());
		if (!data) return false;
		// console.log(data);
		this.selectCurrKey(data);

	}

	carouselSetupType = {
		TokenPocket: [
			{ title: this.t('第一步：进入钱包主页，点击右上角扫一扫'), img: require('../assets/tp_setp_1.jpg') },
			{ title: <div>{this.t('第二步：扫码绑定成功')}</div>, img: require('../assets/step_3.png') },
		],
		MateMask: [
			{ title: <div>{this.t('第一步：请点击左上角')}“<IconFont type="icon-danchuangicon1" />”{this.t('选择')}“<IconFont type="icon-danchuangicon2" />”</div>, img: require('../assets/step_1.png') },
			{ title: <div>{this.t('第二步：进入钱包后请点击右上角')} <br />“<IconFont type="icon-danchuangicon3" />”{this.t('按钮')}</div>, img: require('../assets/step_2.png') },
			{ title: <div>{this.t('第三步：扫码绑定成功')}</div>, img: require('../assets/step_3.png') },
		],
		imToken: [
			{ title: this.t('第一步：进入钱包主页，点击右上角扫一扫'), img: require('../assets/imtoken_setp_1.1.jpg') },
			{ title: <div>{this.t('第二步：扫码绑定成功')}</div>, img: require('../assets/step_3.png') },
		],
	};

	async selectCurrKey(key: string) {
		this.setState({ loading: true, currKey: key });
		try {
			// let href = 'https://mvp-dev.stars-mine.com/device_add?a=0x137C59F4eb2BcfE409dad6C467Af90459383FA3A&c=4769&v=7ijxWXoQKGFGo' || await native.scan() + `&owner=${key}`;
			console.log('start');
			let href = await native.scan();

			config.env == 'dev' && (href = href.replace('https://mvp-dev.stars-mine.com', config.host));
			await wallet.setCurrentKey(key);
			setDeviceSigner(wallet);
			let { a, c, v } = getParams(href);
			await device.bind(crypto_tx.checksumAddress(a), c, v);
			this.getDeviceList();
		} catch (error: any) {
			console.log('end');
			this.setState({ loading: false });
			if ('Key derivation failed - possibly wrong password' == error.message) return alert('密码输入错误');;
			alert(error.message);
		}
		console.log('other');

	}


	render() {
		const { device, loading } = this.state;
		const { t } = this;
		return (
			<div className="index device_list_page">
				<div className="page_title" style={localStorage.getItem('language') != 'ZH' ? { letterSpacing: 0 } : {}}>{t('智能数字收藏品')}</div>
				<Spin delay={500} className="device_list_loading" spinning={loading} tip={'loading'} >

					{/* <Header title="我的NFT" page={this} /> */}
					<div className="device_warp">

						<div className="device_list">
							<div className="list_title" >{t("全部设备")}</div>
							<div className="list_top_extra">
								<div className="bind_device_btn" onClick={this.addDevice.bind(this)}>
									<img className="add_icon" src={require('../assets/add_icon.png')} alt="+" /> {t("绑定新设备")}
								</div>
							</div>

							{device.map(item => {
								return <DeviceItem key={item.sn} deviceInfo={item} onClick={() => {
									this.pushPage({ url: `/device_info`, params: { ...item } });
								}} />
							})}
						</div>

						{/* <Modal visible={this.state.visible}
					transparent
					title={t("扫码绑定设备")}
					footer={[{ text: t('我知道了'), onPress: () => this.setState({ visible: false }) }]}
				>
					<BindDeviceCarousel />
				</Modal> */}
					</div>

					{/* <Modal visible={this.state.visible}
						transparent
						title={'选择管理密钥'}
						closable
						className="select_wallet_box"
						onClose={() => this.setState({ visible: false })}
					// footer={[{ text: t('我知道了'), onPress: () => this.setState({ visible: false }) }]}
					>
						{keysName.map(key => {
							return <div key={key} className="wallet_item" onClick={this.selectCurrKey.bind(this, key)}>
								<IconFont type="icon-qianbao" />
								<div className="name">{key}</div>
							</div>
						})}

					</Modal> */}
				</Spin>

			</div>
		);
	}

}

export default withTranslation('translations', { withRef: true })(DeviceList);
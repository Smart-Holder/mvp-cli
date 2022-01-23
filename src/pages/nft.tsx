
import { React } from 'webpkit/mobile';
import NavPage from '../nav';
import { Device, NFT } from '../models';
import { devices, setDeviceSigner } from '../models/device';
import { Spin } from 'antd';
import { DeviceItem } from '../components/deviceItem';
import IconFont from '../components/icon_font';
import { withTranslation } from 'react-i18next';
import native from '../../wallet/util/prefix_native';
import wallet from '../../wallet/wallet_ui';
import * as config from '../../config';
import { getParams } from '../../wallet/util/tools';
import * as device from '../models/device';
import { alert } from 'webpkit/lib/dialog';
import { check } from '../../wallet/user';
import { Modal } from 'antd-mobile';
import Header from '../util/header';


import '../css/index.scss';
import "../../wallet/util/wallet_ui.scss";

const crypto_tx = require('crypto-tx');

// const { t } = Translation(); //把使用方法结构
type ICarouselType = 'imToken' | 'TokenPocket' | 'MateMask';

interface IDeviceItemProps extends Device{
	key?:string
}

class DeviceList extends NavPage<{ address?: string, keyName?: string }> {

	title = '我的NFT';

	_NftAdd = () => {
		this.pushPage('/nft_add');
	}

	_NftDetails(e: NFT) {
		this.pushPage({ url: `/nft_details`, params: { id: e.id } });
	}

	state = {
		nft: [] as NFT[], device: [] as IDeviceItemProps[], loading: true, visible: false, carouselType: 'MateMask' as ICarouselType,
		keysName: [] as string[],
		currKey: ''
	};

	async triggerLoad() {
		// await initialize();
		// var hex = encodeParameters(['address'], ['0xc2C09aABe77B718DA3f3050D0FDfe80D308Ea391']);
		// console.log(hex);

	
		this.getDeviceList();
	}

	async triggerShow() {
		// await check(); // check login state
		this.getDeviceList();
	}

	async getDeviceList() {
		let { address } = this.params;
		await check();
		
		let device: IDeviceItemProps[] = await devices();
		// 仅允许当前手机内的钱包和设备有绑定关系的 设备出现
		let keysName = await native.getKeysName() || [];
		let addressListPromise = keysName?.map(async (key) => { return { keyStoreStr: await native.getKey(key),key}});
		let addressList:any = (await Promise.all(addressListPromise)).reduce((pre,curr) => {
			let { keyStoreStr, key } = curr;
			let address = ('0x' + JSON.parse(String(keyStoreStr)).address).toUpperCase()
			return { ...pre,[address]: {key ,address}};
		},{});

		let addressArr = Object.keys(addressList);
		// 从钱包设备进入仅显示当前钱包绑定关系的设备
		if (address) {
			device = device.filter((item) => {
				item.key = addressList[String(address)]?.key;
				return item.owner === address;
			})
		} else {
		// 从底部tab设备进入显示当前所有钱包有绑定关系的设备
			device = device.filter(item => {
				let owner = item.owner.toUpperCase();
				let ownerItem = addressList[owner];
				item.key = ownerItem?.key;
				return addressArr.includes(owner);
			});
		};
		this.setState({ device, loading: false, keysName });
	}

	// 添加设备
	async addDevice() {

		let keyName = this.params.keyName;
		if (keyName) {
			this.selectCurrKey(keyName);
		} else {	
			this.setState({ visible: true });
		}

		// let data = this.params.keyName || (await wallet.selectCurrentKey());
		// if (!data) return false;
		// this.selectCurrKey(data);

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
		this.setState({ loading: true, visible:false });
		try {
			// let href = 'https://mvp-dev.stars-mine.com/device_add?a=0x137C59F4eb2BcfE409dad6C467Af90459383FA3A&c=6357&v=7ijxWXoQKGFGo' || await native.scan() + `&owner=${key}`;
			let href = await native.scan();
			if (!href) return this.setState({loading:false});
			config.env == 'dev' && (href = href.replace('https://mvp-dev.stars-mine.com', config.host));
			await wallet.setCurrentKey(key);
			setDeviceSigner(wallet);
			let { a, c, v } = getParams(href);
			await device.bind(crypto_tx.checksumAddress(a), c, v);
			this.getDeviceList();
		} catch (error: any) {
			this.setState({ loading: false });
			alert(error.message);
		}

	}

	async walletModalOk() {
		// this.setState({ visible:false });
		let { currKey } = this.state;
		if (!currKey) return false;
		this.selectCurrKey(currKey);
	}


	render() {
		const { device, loading, keysName, currKey } = this.state;
		const {address } = this.params;
		const { t } = this;
		return (
			<div className="index device_list_page">
				<div className="page_title" style={localStorage.getItem('language') != 'ZH' ? { letterSpacing: 0 } : {}}>{t('智能数字收藏品')}</div>
				<Spin delay={500} className="device_list_loading" spinning={loading} tip={'loading'} >

					{Boolean(address) && <Header title="设备管理" page={this} />}
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

					<Modal visible={this.state.visible}
						transparent
						title={'选择管理密钥'}
						closable
						className="select_wallet_box"
						onClose={() => this.setState({ visible: false })}
						footer={[
							{ text: t('取消'), onPress: () => this.setState({ visible:false}) },
							{ text: t('确定'), onPress: this.walletModalOk.bind(this) }
						]}
					>
						{keysName.map(key => {
							return <div key={key} className={`wallet_item ${currKey == key && 'active'}`} onClick={() => this.setState({ currKey: key == currKey ? '' : key})}>
								<IconFont type="icon-qianbao" />
								<div className="name">{key}</div>
							</div>
						})}

					</Modal>
				</Spin>

			</div>
		);
	}

}

export default withTranslation('translations', { withRef: true })(DeviceList);
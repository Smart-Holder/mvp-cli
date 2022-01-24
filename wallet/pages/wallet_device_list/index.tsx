
import { React } from 'webpkit/mobile';
import NavPage from '../../../src/nav';
import { Device, NFT } from '../../../src/models';
import { devices } from '../../../src/models/device';
import { Spin } from 'antd';
import { DeviceItem } from '../../../src/components/deviceItem';
import native from '../../util/prefix_native';
import * as config from '../../../config';
import { alert } from 'webpkit/lib/dialog';
import { check } from '../../user';
import Header from '../../../src/util/header';


import SelectWallet from '../../../src/components/select_wallet';
import { setCurrWallet_BindDevice } from '../../../src/util/tools';
import './index.scss';


interface IDeviceItemProps extends Device {
	key?: string
}

class DeviceList extends NavPage<{ address?: string, keyName?: string }> {


	state = {
		nft: [] as NFT[], device: [] as IDeviceItemProps[], loading: true, visible: false,

	};

	async triggerLoad() {
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
		let addressListPromise = keysName?.map(async (key) => { return { keyStoreStr: await native.getKey(key), key } });
		let addressList: any = (await Promise.all(addressListPromise)).reduce((pre, curr) => {
			let { keyStoreStr, key } = curr;
			let address = ('0x' + JSON.parse(String(keyStoreStr)).address).toUpperCase()
			return { ...pre, [address]: { key, address } };
		}, {});

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

	}

	async selectCurrKey(key: string) {
		this.setState({ loading: true, visible: false });
		try {
			// let href = 'https://mvp-dev.stars-mine.com/device_add?a=0x137C59F4eb2BcfE409dad6C467Af90459383FA3A&c=6357&v=7ijxWXoQKGFGo' || await native.scan() + `&owner=${key}`;
			let href = await native.scan();
			if (!href) return this.setState({ loading: false });

			config.env == 'dev' && (href = href.replace('https://mvp-dev.stars-mine.com', config.host));
			await setCurrWallet_BindDevice(key, href);
			this.getDeviceList();
		} catch (error: any) {
			this.setState({ loading: false });
			alert(error.message);
		}

	}

	modalOk(currKey: string) {
		if (!currKey) return false;
		this.selectCurrKey(currKey);
	}

	render() {
		const { device, loading } = this.state;
		// const {address } = this.params;
		return (
			<div className="index wallet_device_list_page">
				<Spin delay={500} className="device_list_loading" spinning={loading} tip={'loading'} >

					<Header title="设备管理" page={this} className="device_header" />
					{/* <img className="home_bg_img" src={require("../assets/home_bg3.png")} alt="" /> */}

					<div className="device_warp">

						<div className="device_list">
							<div className="list_title" >{("全部设备")}</div>
							<div className="list_top_extra">
								<div className="bind_device_btn" onClick={this.addDevice.bind(this)}>
									<img className="add_icon" src={require('../../../src/assets/add_icon.png')} alt="+" /> {("绑定新设备")}
								</div>
							</div>

							{device.map(item => {
								return <DeviceItem key={item.sn} deviceInfo={item} onClick={() => {
									this.pushPage({ url: `/device_info`, params: { ...item } });
								}} />
							})}
						</div>


					</div>

					<SelectWallet visible={this.state.visible} modalOk={this.modalOk.bind(this)} onClose={() => this.setState({ visible: false })} />


				</Spin>

			</div>
		);
	}

}

export default DeviceList;